import https from 'https';

type TranslationResponse = unknown[];
const TRANSLATE_CHUNK_SIZE = 1500;

function safeTranslateChunks(data: TranslationResponse): string {
  const parts = Array.isArray(data[0]) ? data[0] as unknown[] : [];
  return parts
    .map((item) => (Array.isArray(item) && typeof item[0] === 'string' ? item[0] : ''))
    .join('')
    .trim();
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    return text;
  }

  const tl = targetLanguage.trim();
  if (!tl || tl.toLowerCase() === 'en') {
    return text;
  }

  const chunks: string[] = [];
  for (let i = 0; i < trimmed.length; i += TRANSLATE_CHUNK_SIZE) {
    chunks.push(trimmed.slice(i, i + TRANSLATE_CHUNK_SIZE));
  }

  const translatedParts: string[] = [];
  for (const chunk of chunks) {
    const q = encodeURIComponent(chunk);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(tl)}&dt=t&q=${q}`;

    const body = await new Promise<string>((resolve, reject) => {
      https
        .get(url, (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (part) => {
            data += part;
          });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`Translation API failed with status ${res.statusCode}`));
              return;
            }
            resolve(data);
          });
        })
        .on('error', reject);
    });

    const parsed = JSON.parse(body) as TranslationResponse;
    translatedParts.push(safeTranslateChunks(parsed) || chunk);
  }

  const translated = translatedParts.join('').trim();
  return translated || text;
}
