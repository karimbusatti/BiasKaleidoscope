export type Issue = {
  id: string;
  type: 'gendered' | 'readability' | 'salary' | 'requirements';
  description: string;
  suggestion: string;
};

const genderedTerms: Record<string, string> = {
  "rockstar": "expert",
  "ninja": "specialist",
  "dominant": "confident",
  "supportive": "collaborative"
};

const salaryRegex = /(\$|€|£)\s?\d+/;

export function analyzeJobDescription(jd: string): Issue[] {
  const issues: Issue[] = [];

  Object.entries(genderedTerms).forEach(([term, replacement]) => {
    if (jd.toLowerCase().includes(term)) {
      issues.push({
        id: `gendered-${term}`,
        type: 'gendered',
        description: `Gender-coded term "${term}" detected`,
        suggestion: `Swap "${term}" with "${replacement}"`
      });
    }
  });

  const sentences = jd.split(/[.!?]/).filter(Boolean);
  const averageLength = sentences.length
    ? sentences.reduce((acc, sentence) => acc + sentence.trim().split(/\s+/).length, 0) / sentences.length
    : 0;

  if (averageLength > 22) {
    issues.push({
      id: 'readability-length',
      type: 'readability',
      description: 'Sentences are long; aim for 18-20 words.',
      suggestion: 'Break down long sentences into shorter points.'
    });
  }

  if (!salaryRegex.test(jd)) {
    issues.push({
      id: 'salary-missing',
      type: 'salary',
      description: 'Salary range missing.',
      suggestion: 'Add a transparent salary band (e.g., €70k - €90k).'
    });
  }

  const requirementCount = (jd.match(/must|required|need/gi) ?? []).length;
  if (requirementCount > 5) {
    issues.push({
      id: 'requirements-heavy',
      type: 'requirements',
      description: 'Requirements heavy job description detected.',
      suggestion: 'Consider marking some requirements as preferred rather than required.'
    });
  }

  return issues;
}

export function applyFixes(jd: string, issues: Issue[]): string {
  let improved = jd;
  issues.forEach((issue) => {
    if (issue.type === 'gendered') {
      const term = issue.description.match(/"(.*?)"/);
      if (term?.[1]) {
        const replacement = issue.suggestion.split('"')[3] ?? 'candidate';
        const regex = new RegExp(term[1], 'gi');
        improved = improved.replace(regex, replacement);
      }
    }
  });

  if (issues.some((issue) => issue.type === 'salary') && !salaryRegex.test(improved)) {
    improved += '\n\nCompensation: €70k - €90k + equity options.';
  }

  return improved;
}
