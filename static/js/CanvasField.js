import {Helper} from "/js/Helper.js"

export class CanvasField {

  withField(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(field => callback(field))
    return this
  }

  withLabel(callback) {
    if (callback !== undefined) document.querySelectorAll(this.labelSelector).forEach(label => callback(label))
    return this
  }

  withType(callback) {
    if(callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(canvas => callback(canvas))
    return this
  }

  #startDrawing(event) {
    event.preventDefault()

    this.isDrawing = true

    document.querySelectorAll(this.inputSelector).forEach(canvas => {
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
    document.querySelectorAll(this.inputSelector).forEach(canvas => {
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

      this.isEmpty = false
    })
  }

  #stopDrawing() {
    this.isDrawing = false
  }


  #drawLineOnTouch(canvas) {
    var mousePos = { x:0, y:0 };
    canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
    }, false);
    canvas.addEventListener("touchend", function (e) {
      e.preventDefault();

    var mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
    }, false);
    canvas.addEventListener("touchmove", function (e) {
      e.preventDefault();

    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
    }, false);

    function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top
    };
    }
  }


  withDrawable() {
    document.querySelectorAll(this.inputSelector).forEach(canvas => {
      this.isDrawing = false;
      canvas.addEventListener('mousedown', (event) => this.#startDrawing(event))
      canvas.addEventListener('mousemove', (event) => this.#drawLine(event))
      canvas.addEventListener('mouseup', () => this.#stopDrawing())
      canvas.addEventListener('mouseout', () => this.#stopDrawing())

      this.#drawLineOnTouch(canvas)

    })
    return this
  }

  #setCanvas(field) {
    field.textContent = ""
    field.classList.add(this.name)
    field.style.position = "relative"
    field.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
    field.style.borderRadius = "13px"
    field.style.border = "0.3px solid black"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
    field.style.justifyContent = "center"

    const labelContainer = document.createElement("div")
    labelContainer.classList.add(`label-container-${this.name}`)
    labelContainer.style.display = "flex"
    labelContainer.style.alignItems = "center"
    labelContainer.style.margin = "21px 89px 0 34px"

    const info = document.createElement("img")
    info.src = "/public/info-gray.svg"
    info.alt = "Info"
    info.style.width = "34px"
    info.style.marginRight = "21px"
    labelContainer.append(info)

    const label = document.createElement("label")
    label.classList.add(this.name)
    label.style.color = "#707070"
    label.style.fontSize = "21px"
    labelContainer.append(label)
    field.append(labelContainer)

    const canvas = document.createElement("canvas")
    canvas.classList.add(this.name)
    canvas.style.width = "100%"
    field.append(canvas)
  }

  constructor(name) {
    if (Helper.verifyIs("text/empty", name)) throw new Error("class name is empty")
    this.name = name
    this.fieldSelector = `div[class='${this.name}']`
    this.inputSelector = `canvas[class='${this.name}']`
    this.labelSelector = `label[class='${this.name}']`
    this.type = "canvas"
    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    for (let i = 0; i < this.fields.length; i++) {
      this.#setCanvas(this.fields[i])
    }
  }
}
