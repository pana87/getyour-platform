import { AddButton } from "./AddButton.js"
import { Platform } from "./Platform.js"
import { _storePlatform } from "./storage.js"
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
  <h3 class="title">Plattform erstellen</h3>
  <div class="input-field">
    <div class="info">
      <i class="material-icons">info</i>
      <p class="info-text">Erstelle eine Plattform, die Interaktionen für dein Netzwerk bietet.</p>
    </div>
    <form action="/toolbox/"></form>
  </div>

</div>
`

export class PlatformForm extends HTMLElement {

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

    let userInput
    builders.forEach(builder => builder.shadowRoot.querySelectorAll("getyour-platform-form").forEach(form => form.shadowRoot.querySelectorAll("getyour-text-field").forEach(textfield => textfield.shadowRoot.querySelectorAll("input[type=text]").forEach(input => userInput = input.value))))

    if (userInput === "") return
    if (userInput === undefined) return
    if (userInput === null) return

    // this.append(userInput)
    const response = _storePlatform(userInput)

    // window.location.assign("/mehr/")
    // builders.forEach(builder =)
    // console.log(builders);
    builders.forEach(builder => builder.close())
  }

  append(object) {
    const list = JSON.parse(window.localStorage.getItem("platforms")) || []
    if (list.filter(it => it.name === object.name).length > 0) return
    list.push(object)
    window.localStorage.setItem("platforms", JSON.stringify(list))
  }
}

window.customElements.define("getyour-platform-form", PlatformForm)
