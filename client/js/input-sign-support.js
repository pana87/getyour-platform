document.querySelectorAll("input, select, textarea").forEach(input => {
  Helper.verify("input/value", input)
  input.addEventListener("input", () => this.verify("input/value", input))
})
