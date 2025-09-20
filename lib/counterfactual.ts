import { calculateMetrics, type MetricBundle, type VariantOutcome } from './metrics';

type ControlSettings = {
  datasetSkew: number;
  weighting: number;
  temperature: number;
  topP: number;
};

type SwapOption = {
  token: string;
  label: string;
  selectionBias: number;
  rankBias: number;
  sentimentBias: number;
};

type VariantTemplate = {
  id: string;
  prompt: string;
  replacements: { placeholder: string; swap: SwapOption }[];
};

const baseSwaps: Record<string, SwapOption[]> = {
  gender: [
    { token: 'Alex', label: 'gender:neutral', selectionBias: 0, rankBias: 0, sentimentBias: 0 },
    { token: 'Sofia', label: 'gender:feminine-coded', selectionBias: -0.12, rankBias: 1.6, sentimentBias: -0.08 },
    { token: 'Liam', label: 'gender:masculine-coded', selectionBias: 0.06, rankBias: -1.2, sentimentBias: 0.05 }
  ],
  ethnicity: [
    { token: 'Avery', label: 'ethnicity:neutral', selectionBias: 0, rankBias: 0, sentimentBias: 0 },
    { token: 'Sanjay', label: 'ethnicity:south-asian', selectionBias: -0.08, rankBias: 1.1, sentimentBias: -0.06 },
    { token: 'Keiko', label: 'ethnicity:east-asian', selectionBias: -0.05, rankBias: 0.7, sentimentBias: -0.03 },
    { token: 'Lina', label: 'ethnicity:mena', selectionBias: -0.04, rankBias: 0.9, sentimentBias: -0.04 }
  ],
  pronoun: [
    { token: 'they/them', label: 'pronoun:neutral', selectionBias: 0, rankBias: 0, sentimentBias: 0 },
    { token: 'she/her', label: 'pronoun:feminine', selectionBias: -0.07, rankBias: 0.9, sentimentBias: -0.03 },
    { token: 'he/him', label: 'pronoun:masculine', selectionBias: 0.04, rankBias: -0.6, sentimentBias: 0.03 }
  ],
  generic: [
    { token: 'skilled', label: 'generic:skilled', selectionBias: -0.03, rankBias: 0.4, sentimentBias: -0.01 },
    { token: 'seasoned', label: 'generic:seasoned', selectionBias: 0, rankBias: 0, sentimentBias: 0 },
    { token: 'emerging', label: 'generic:emerging', selectionBias: -0.06, rankBias: 1.1, sentimentBias: -0.04 }
  ]
};

const defaultScores = [0.82, 0.74, 0.68, 0.63, 0.57, 0.51, 0.44, 0.39];

type DatasetEntry = {
  score: number;
  rank: number;
  sentiment: number;
};

type ParsedDataset = {
  entries: DatasetEntry[];
  selectionThreshold: number;
};

const placeholderRegex = /\{(.*?)\}/g;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toSentiment = (score: number) => clamp(0.4 + score * 0.45, 0, 1);

const hasHeaderRow = (row: string[]) => row.some((cell) => Number.isNaN(Number.parseFloat(cell)));

const normalisePlaceholder = (placeholder: string) => placeholder.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

function classifyPlaceholder(placeholder: string): keyof typeof baseSwaps {
  const normalised = placeholder.toLowerCase();
  if (normalised.includes('pronoun')) return 'pronoun';
  if (
    normalised.includes('gender') ||
    normalised.includes('female') ||
    normalised.includes('male') ||
    normalised.includes('woman') ||
    normalised.includes('man')
  ) {
    return 'gender';
  }
  if (normalised.includes('ethnic') || normalised.includes('race') || normalised.includes('heritage')) {
    return 'ethnicity';
  }
  if (normalised.includes('name')) {
    return 'gender';
  }
  return 'generic';
}

function getSwapOptions(placeholder: string) {
  const bucket = classifyPlaceholder(placeholder);
  return baseSwaps[bucket] ?? baseSwaps.generic;
}

function swapPlaceholder(prompt: string, placeholder: string, replacement: string) {
  return prompt.replaceAll(`{${placeholder}}`, replacement);
}

function parseDatasetRows(rows?: string[][]): ParsedDataset {
  if (!rows || rows.length === 0) {
    const entries = defaultScores.map((score, index) => ({ score, rank: index + 1, sentiment: toSentiment(score) }));
    const threshold = entries[Math.floor(entries.length / 2)]?.score ?? 0.55;
    return { entries, selectionThreshold: threshold };
  }

  const cleaned = rows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0));

  if (cleaned.length === 0) {
    return parseDatasetRows();
  }

  let dataRows = cleaned;
  let scoreIndex = cleaned[0]?.length > 1 ? 1 : 0;

  if (cleaned[0] && hasHeaderRow(cleaned[0])) {
    const header = cleaned[0].map((cell) => cell.toLowerCase());
    dataRows = cleaned.slice(1);
    const scorePosition = header.findIndex((cell) => cell.includes('score') || cell.includes('rating') || cell.includes('prob'));
    if (scorePosition >= 0) {
      scoreIndex = scorePosition;
    } else if (cleaned[0].length === 1) {
      scoreIndex = 0;
    }
  }

  const numeric = dataRows
    .map((row) => Number.parseFloat(row[scoreIndex] ?? row[row.length - 1] ?? '0'))
    .filter((value) => Number.isFinite(value));

  if (numeric.length === 0) {
    return parseDatasetRows();
  }

  const expanded = [...numeric];
  while (expanded.length < 6) {
    expanded.push(expanded[expanded.length % numeric.length]);
  }

  const withinUnit = expanded.every((value) => value >= 0 && value <= 1);
  const maxScore = withinUnit ? 1 : Math.max(...expanded.map((value) => Math.abs(value)), 1);

  const normalised = expanded.map((value) => clamp(withinUnit ? value : value / maxScore, 0, 1));
  const sorted = [...normalised].sort((a, b) => b - a);
  const entries = sorted.map((score, index) => ({ score, rank: index + 1, sentiment: toSentiment(score) }));
  const selectionThreshold = entries[Math.floor(entries.length / 2)]?.score ?? 0.55;

  return { entries, selectionThreshold };
}

function generateVariantTemplates(prompt: string, placeholders: string[]): VariantTemplate[] {
  if (placeholders.length === 0) return [];

  const placeholderSwaps = placeholders.map((placeholder) => ({ placeholder, swaps: getSwapOptions(placeholder) }));
  const variants: VariantTemplate[] = [];

  function dfs(
    index: number,
    currentPrompt: string,
    replacements: { placeholder: string; swap: SwapOption }[],
    idSegments: string[]
  ) {
    if (index === placeholderSwaps.length) {
      variants.push({
        id: ['variant', ...idSegments].join('-'),
        prompt: currentPrompt,
        replacements
      });
      return;
    }

    const { placeholder, swaps } = placeholderSwaps[index];
    swaps.forEach((swap, swapIndex) => {
      const segment = `${normalisePlaceholder(placeholder)}-${swapIndex}`;
      const nextPrompt = swapPlaceholder(currentPrompt, placeholder, swap.token);
      dfs(index + 1, nextPrompt, [...replacements, { placeholder, swap }], [...idSegments, segment]);
    });
  }

  dfs(0, prompt, [], []);
  return variants;
}

type ControlOffsets = {
  referenceSelection: number;
  referenceRank: number;
  referenceSentiment: number;
  counterfactualSelection: number;
  counterfactualRank: number;
  counterfactualSentiment: number;
};

function deriveControlOffsets(controls?: ControlSettings): ControlOffsets {
  if (!controls) {
    return {
      referenceSelection: 0,
      referenceRank: 0,
      referenceSentiment: 0,
      counterfactualSelection: 0,
      counterfactualRank: 0,
      counterfactualSentiment: 0
    };
  }

  const skew = (controls.datasetSkew - 50) / 50; // -1..1
  const weighting = (controls.weighting - 50) / 50;
  const temperature = controls.temperature - 0.5;
  const topP = controls.topP - 0.5;

  return {
    referenceSelection: skew * 0.18 - weighting * 0.04,
    referenceRank: -skew * 1.2,
    referenceSentiment: -skew * 0.08,
    counterfactualSelection: -skew * 0.22 + weighting * 0.18 + temperature * 0.08 - topP * 0.05,
    counterfactualRank: skew * 1.5 - weighting * 1.1 + temperature * 0.5,
    counterfactualSentiment: -skew * 0.12 + weighting * 0.1 + temperature * 0.06 - topP * 0.03
  };
}

function simulateVariant(
  variant: VariantTemplate,
  dataset: ParsedDataset,
  controls?: ControlSettings
): { outcomes: VariantOutcome[]; group: string } {
  const offsets = deriveControlOffsets(controls);
  const bias = variant.replacements.reduce(
    (acc, { swap }) => {
      acc.selection += swap.selectionBias;
      acc.rank += swap.rankBias;
      acc.sentiment += swap.sentimentBias;
      return acc;
    },
    { selection: 0, rank: 0, sentiment: 0 }
  );

  const selectionShift = bias.selection + offsets.counterfactualSelection;
  const rankShift = bias.rank + offsets.counterfactualRank;
  const sentimentShift = bias.sentiment + offsets.counterfactualSentiment;

  const group =
    variant.replacements.length > 0
      ? variant.replacements.map((replacement) => replacement.swap.label).join(' & ')
      : 'baseline';

  const outcomes: VariantOutcome[] = [];

  dataset.entries.forEach((entry) => {
    const referenceSelectionScore = entry.score + offsets.referenceSelection;
    const referenceSelected = referenceSelectionScore >= dataset.selectionThreshold;
    const referenceRank = clamp(Math.round(entry.rank + offsets.referenceRank), 1, dataset.entries.length);
    const referenceSentiment = clamp(entry.sentiment + offsets.referenceSentiment, 0, 1);

    outcomes.push({
      variantId: variant.id,
      group: 'reference',
      selected: referenceSelected,
      rank: referenceRank,
      sentiment: Number(referenceSentiment.toFixed(3))
    });

    const counterfactualScore = entry.score + offsets.referenceSelection + selectionShift;
    const counterfactualSelected = counterfactualScore >= dataset.selectionThreshold;
    const counterfactualRank = clamp(
      Math.round(entry.rank + offsets.referenceRank + rankShift),
      1,
      dataset.entries.length
    );
    const counterfactualSentiment = clamp(
      entry.sentiment + offsets.referenceSentiment + sentimentShift,
      0,
      1
    );

    outcomes.push({
      variantId: variant.id,
      group,
      selected: counterfactualSelected,
      rank: counterfactualRank,
      sentiment: Number(counterfactualSentiment.toFixed(3))
    });
  });

  return { outcomes, group };
}

export type CounterfactualRequest = {
  prompt: string;
  datasetRows?: string[][];
  demographicPlaceholders: string[];
  varianceTarget: number;
  referenceGroup: string;
  controls?: ControlSettings;
};

export type CounterfactualResult = {
  variants: { id: string; prompt: string }[];
  metrics: MetricBundle;
  outcomes: VariantOutcome[];
};

export function detectPlaceholders(prompt: string): string[] {
  const matches = prompt.matchAll(placeholderRegex);
  const placeholders = new Set<string>();
  for (const match of matches) {
    if (match[1]) placeholders.add(match[1]);
  }
  return Array.from(placeholders);
}

export function runCounterfactual(request: CounterfactualRequest): CounterfactualResult {
  const placeholders = request.demographicPlaceholders.length
    ? request.demographicPlaceholders
    : detectPlaceholders(request.prompt);

  const dataset = parseDatasetRows(request.datasetRows);
  const variantTemplates: VariantTemplate[] = [
    { id: 'baseline', prompt: request.prompt, replacements: [] },
    ...generateVariantTemplates(request.prompt, placeholders)
  ];

  const outcomes = variantTemplates.flatMap((variant) =>
    simulateVariant(variant, dataset, request.controls).outcomes
  );

  const metrics = calculateMetrics(
    outcomes,
    request.referenceGroup ?? 'reference',
    request.varianceTarget,
    true
  );

  return {
    variants: variantTemplates.map((variant) => ({ id: variant.id, prompt: variant.prompt })),
    metrics,
    outcomes
  };
}

