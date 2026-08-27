export function tryParseJSON(text: string) {
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    if (cleaned[i] === "}") depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }

  if (end === -1) {
    cleaned = cleaned.substring(start);
    const openBrackets =
      (cleaned.match(/\[/g) || []).length -
      (cleaned.match(/\]/g) || []).length;
    const openBraces =
      (cleaned.match(/\{/g) || []).length -
      (cleaned.match(/\}/g) || []).length;
    cleaned = cleaned.replace(/,\s*"[^"]*$/, "");
    cleaned = cleaned.replace(/,\s*$/, "");
    for (let i = 0; i < openBrackets; i++) cleaned += "]";
    for (let i = 0; i < openBraces; i++) cleaned += "}";
  } else {
    cleaned = cleaned.substring(start, end + 1);
  }

  cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

  return JSON.parse(cleaned);
}
