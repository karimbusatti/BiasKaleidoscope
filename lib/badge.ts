export function generateBadgeScript(options: { color: 'green' | 'amber' | 'red'; href: string }) {
  const colorMap: Record<typeof options.color, string> = {
    green: '#38A169',
    amber: '#D69E2E',
    red: '#E53E3E'
  } as const;
  return `<a href="${options.href}" style="display:inline-flex;align-items:center;font-family:system-ui;font-size:12px;padding:6px 12px;border-radius:999px;background:${colorMap[options.color]};color:white;text-decoration:none;">Bias Kaleidoscope • ${options.color.toUpperCase()}</a>`;
}
