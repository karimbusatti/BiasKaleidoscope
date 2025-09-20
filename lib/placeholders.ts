const placeholderRegex = /\{(.*?)\}/g;

export function extractPlaceholders(input: string) {
  const matches = input.matchAll(placeholderRegex);
  const placeholders = new Set<string>();
  for (const match of matches) {
    if (match[1]) placeholders.add(match[1]);
  }
  return Array.from(placeholders);
}
