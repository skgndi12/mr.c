export function normalizeWhitespace(str: string) {
  // replace newline and tab with a space: https://stackoverflow.com/questions/10805125
  let newText = str.replace(/\r?\n|\r?\t/g, ' ');
  // normalize multiple spaces: https://stackoverflow.com/questions/1981349
  newText = newText.replace(/\s\s+/g, ' ');

  newText = newText.trimStart();

  return newText;
}
