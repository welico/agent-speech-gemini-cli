function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  const slice = text.slice(0, maxChars);
  const lastBreak = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '), slice.lastIndexOf(' '));
  if (lastBreak < 80) {
    return `${slice.trim()}...`;
  }
  return `${slice.slice(0, lastBreak).trim()}...`;
}

function cleanupMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\|.*\|$/gm, ' ')
    .replace(/^\s*[-*]\s+/gm, '- ')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pickCoreLines(text: string): string[] {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const bullets = lines.filter((line) => /^(-\s|\d+\.\s|✅|⏭️|💡)/.test(line));
  if (bullets.length > 0) {
    return bullets.slice(0, 3);
  }
  return lines.slice(0, 3);
}

function normalizeForSpeech(text: string): string {
  return text
    .replace(/^[-*]\s+/gm, '')
    .replace(/✅\s*Used:\s*/g, 'Used: ')
    .replace(/⏭️\s*Not Used:\s*/g, 'Not used: ')
    .replace(/💡\s*Recommended:\s*/g, 'Recommended: ')
    .replace(/\s+/g, ' ')
    .replace(/\.\./g, '.')
    .trim();
}

export function summarizeForSpeech(input: string, maxChars: number = 320): string {
  const cleaned = cleanupMarkdown(input);
  if (!cleaned) {
    return '';
  }

  const marker = '📊 bkit Feature Usage';
  const markerIndex = cleaned.indexOf(marker);
  const hasBkitFooter = markerIndex >= 0;
  const body = hasBkitFooter ? cleaned.slice(0, markerIndex).trim() : cleaned;
  const footer = hasBkitFooter ? cleaned.slice(markerIndex).trim() : '';

  const source = body || cleaned;
  const core = pickCoreLines(source).join('. ');
  let summary = normalizeForSpeech(core);

  if (hasBkitFooter) {
    const usedMatch = footer.match(/✅\s*Used:\s*([^\n]+)/);
    if (usedMatch?.[1]?.trim()) {
      summary = `${summary}. Used: ${usedMatch[1].trim()}.`;
    }
  }

  return truncateText(summary, maxChars);
}
