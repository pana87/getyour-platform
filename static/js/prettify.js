export const prettifyHtml = text => {
  return text
  .replace(/\n/g, "")
  .replace(/>/g, ">\n  ")
  .replace(/</g, "\n<")
}
