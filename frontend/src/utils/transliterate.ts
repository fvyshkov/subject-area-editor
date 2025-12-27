const translitMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  ' ': '_', '-': '_', '.': '_', ',': '_', '!': '', '?': '', '\'': '', '"': '',
  ':': '', ';': '', '(': '', ')': '', '[': '', ']': '', '{': '', '}': '',
  '/': '_', '\\': '_', '|': '_', '@': '', '#': '', '$': '', '%': '', '^': '',
  '&': '', '*': '', '+': '', '=': '', '~': '', '`': '', '<': '', '>': ''
};

export function transliterate(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (translitMap[char] !== undefined) {
      result += translitMap[char];
    } else if (/[a-zA-Z0-9_]/.test(char)) {
      result += char;
    }
  }

  // Remove consecutive underscores
  result = result.replace(/_+/g, '_');

  // Remove leading/trailing underscores
  result = result.replace(/^_+|_+$/g, '');

  // Convert to lowercase
  return result.toLowerCase();
}
