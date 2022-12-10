import { AddButton } from "./AddButton.js"
import { Interaction } from "./Interaction.js"
import { TextField } from "./TextField.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

  <style>
    input[type=text], select {
      width: 100%;
      padding: 12px 20px;
      margin: 8px 0;
      display: inline-block;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }

    input[type=submit] {
      width: 100%;
      background-color: #4CAF50;
      color: white;
      padding: 14px 20px;
      margin: 8px 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    input[type=submit]:hover {
      background-color: #45a049;
    }

    div {
      border-radius: 5px;
      background-color: rgba(157, 159, 157, 1);
      padding: 20px;
    }
    .title {
      font-family: "FormaDJR Micro-Regular";
      font-weight: bold;
    }
    .form-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
    }
    .info {
      display: flex;
      padding: 0;
    }
    .material-icons {
      display: flex;
      align-items: center;
      font-size: 14px;
    }
    .info-text {
      margin: 0;
      display: flex;
      align-items: center;
      font-family: "FormaDJR Micro-Regular";
      font-size: 10px;
      margin-left: 5px;
    }
    .input-field {
      width: 89%;
    }
    form {
      display: flex;
      flex-direction: column;
    }
  </style>

<div class="form-container">
  <img src="${window.__URL__}/img/getyour-logo-icon.png" alt="Getyour Logo Icon" />
  <h3 class="title">Interaktion erstellen</h3>
  <div class="input-field">
    <div class="info">
      <i class="material-icons">info</i>
      <p class="info-text">Erstelle eine Funktion, die Mehrwert für die Plattform bietet.</p>
    </div>
    <form action="/toolbox/"></form>
  </div>

</div>
`

export class InteractionForm extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {

    const form = this.shadowRoot.querySelector("form")
    const addButton = new AddButton()
    addButton.style.width = "50%"
    addButton.style.alignSelf = "flex-end"
    form.append(new TextField())
    form.append(addButton)

    addButton.addEventListener("click", () => this.submit())
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  submit() {
    const builders = document.querySelectorAll("getyour-modal-builder")

    if (builders.length === 0) return

    let object
    builders.forEach(builder => builder.shadowRoot.querySelectorAll("getyour-interaction-form").forEach(form => form.shadowRoot.querySelectorAll("getyour-text-field").forEach(textfield => textfield.shadowRoot.querySelectorAll("input[type=text]").forEach(input => object = new Interaction(input.value)))))

    if (!object) return
    if (object.name === "") return
    if (object.name === undefined) return
    if (object.name === null) return

    this.append(object)

    window.location.assign("/mehr/")
  }

  append(object) {
    const list = JSON.parse(window.localStorage.getItem("interactions")) || []
    if (list.filter(it => it.name === object.name).length > 0) return
    list.push(object)
    window.localStorage.setItem("interactions", JSON.stringify(list))
  }
}

window.customElements.define("getyour-interaction-form", InteractionForm)
