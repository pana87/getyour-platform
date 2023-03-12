import { Helper } from "./Helper.js"

export class CanvasField {

  #startDrawing(event) {
    event.preventDefault()

    this.isDrawing = true

    document.querySelectorAll(this.canvasSelector).forEach(canvas => {
      const context = canvas.getContext('2d');
      context.lineWidth = 1;
      context.lineJoin = 'round';
      context.lineCap = 'round';

      const containerRect = document.querySelector(this.fieldSelector).getBoundingClientRect()
      const x = event.clientX - containerRect.left - canvas.offsetLeft;
      const y = event.clientY - containerRect.top - canvas.offsetTop;
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      const scaledX = x / canvasWidth * canvas.width;
      const scaledY = y / canvasHeight * canvas.height;

      context.beginPath();
      context.moveTo(scaledX, scaledY);
    })
  }

  #drawLine(event) {
    event.preventDefault()

    if (this.isDrawing === false) return
    document.querySelectorAll(this.canvasSelector).forEach(canvas => {
      const context = canvas.getContext('2d');
      context.lineWidth = 1;
      context.lineJoin = 'round';
      context.lineCap = 'round';

      const containerRect = document.querySelector(this.fieldSelector).getBoundingClientRect()
      const x = event.clientX - containerRect.left - canvas.offsetLeft;
      const y = event.clientY - containerRect.top - canvas.offsetTop;
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      const scaledX = x / canvasWidth * canvas.width;
      const scaledY = y / canvasHeight * canvas.height;

      context.lineTo(scaledX, scaledY);
      context.stroke();
    })
  }

  #stopDrawing() {
    this.isDrawing = false
  }

  withType(callback) {
    if(callback !== undefined) document.querySelectorAll(this.canvasSelector).forEach(canvas => callback(canvas))
    return this
  }

  with({withElement, withField, withCanvas, withLabel}) {
    if (withElement !== undefined) this.fields.push(withElement)
    if (withField !== undefined) this.withFieldCallback = withField
    if (withCanvas !== undefined) this.withCanvasCallback = withCanvas
    if (withLabel !== undefined) this.withLabelCallback = withLabel
    this.#setFields()
    return this
  }

  withDrawable() {
    document.querySelectorAll(this.canvasSelector).forEach(canvas => {
      this.isDrawing = false;
      canvas.addEventListener('mousedown', (event) => this.#startDrawing(event))
      canvas.addEventListener('mousemove', (event) => this.#drawLine(event))
      canvas.addEventListener('mouseup', () => this.#stopDrawing())
      canvas.addEventListener('mouseout', () => this.#stopDrawing())
    })
    return this
  }


  #setFields() {

    for (let i = 0; i < this.fields.length; i++) {
      this.fields[i].innerHTML = ""
      this.fields[i].classList.add(this.name)
      this.fields[i].style.position = "relative"
      this.fields[i].style.backgroundColor = "rgba(255, 255, 255, 0.6)"
      this.fields[i].style.borderRadius = "13px"
      this.fields[i].style.border = "0.3px solid black"
      this.fields[i].style.display = "flex"
      this.fields[i].style.flexDirection = "column"
      this.fields[i].style.margin = "34px"
      this.fields[i].style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
      this.fields[i].style.justifyContent = "center"
      this.fields[i].style.cursor = "pointer"


      const canvas = document.createElement("canvas")
      canvas.classList.add(this.name)
      canvas.style.width = "100%"

      if (this.withLabelCallback !== undefined) {
        const label = document.createElement("label")
        label.classList.add(this.name)
        label.style.color = "#707070"
        label.style.fontSize = "21px"
        label.style.margin = "21px 34px"
        this.withLabelCallback(label)

        label.append(canvas)
        this.fields[i].append(label)
      }
      if (this.withCanvasCallback !== undefined) this.withCanvasCallback(canvas)
      if (this.withFieldCallback !== undefined) this.withFieldCallback(this.fields[i])
    }
  }

  constructor(name) {
    if (Helper.stringIsEmpty(name)) throw new Error("class name is empty")
    this.name = name
    this.fieldSelector = `div[class='${this.name}']`
    this.canvasSelector = `canvas[class='${this.name}']`
    this.type = "canvas"
    this.labelSelector = `label[class='${this.name}']`
    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    this.#setFields()
  }
}
