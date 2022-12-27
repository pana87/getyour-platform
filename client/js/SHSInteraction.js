export class SHSInteraction {

  withClickAssign(pathname) {
    const fields = document.querySelectorAll(this.cssSelectorField)

    if (fields.length === 0) return

    fields.forEach(field => {
      field.style.cursor = "pointer"
      field.addEventListener("click", () => window.location.assign(pathname))
    })
    return this
  }

  constructor(cssSelectorField) {
    this.cssSelectorField = cssSelectorField
    this.className = this.cssSelectorField.split("=")[1].split("]")[0]
  }
}
