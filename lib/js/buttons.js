import { _signIn } from "./fetch.mjs"
import { _getListOfPlatforms, _getPlatformByName, _getUserSession, _setFunnelByPlatform, _storeFunnel } from "./storage.js"

function _onCreateNewFunnelButtonClick() {
  const buttons = document.querySelectorAll("div[class=gruppe-1537]")

  if (buttons.length === 0) return
  if (window.location.pathname !== "/toolbox/funnel/wahl/") return

  buttons.forEach(button => {
    button.setAttribute("style", "cursor: pointer;")
    button.addEventListener("click", () => {
      window.location.assign("/toolbox/funnel/erstellen/")
    })
  })
}
_onCreateNewFunnelButtonClick()

function _onCreateFunnelButtonClick() {
  const buttons = document.querySelectorAll("div[class=gruppe-1462]")
  const selects = document.querySelectorAll("select[name=platforms]")
  const inputs = document.querySelectorAll("input[type=text]")

  buttons.forEach(button => {
    let userInput
    let userSelect
    button.setAttribute("style", "cursor: pointer;")
    button.addEventListener("click", () => {
      selects.forEach(select => userSelect = select.value)
      inputs.forEach(input => userInput = input.value)

      if (userInput === "") return
      if (userInput === undefined) return
      if (userInput === null) return
      if (userInput.length > 13) return
      if (userSelect === "") return
      if (userSelect === undefined) return
      if (userSelect === null) return

      const response = _storeFunnel(userSelect, userInput)
      window.location.assign("/toolbox/funnel/")
    })
  })
}
_onCreateFunnelButtonClick()

function _onStartFunnelButtonClick() {
  const buttons = document.querySelectorAll("div[class*=start_button]")

  if (buttons.length === 0) return
  if (window.location.pathname !== "/toolbox/funnel/start/") return

  buttons.forEach(button => {
    button.setAttribute("style", "cursor: pointer;")
    button.addEventListener("click", () => {
      window.location.assign("/toolbox/funnel/wahl/")
    })
  })
}
_onStartFunnelButtonClick()

function _onLogoButtonClick() {
  const buttons = document.querySelectorAll("div[class*='logo-final']")

  if (buttons.length === 0) return

  buttons.forEach(button => {
    button.setAttribute("style", "cursor: pointer;")
    button.addEventListener("click", (event) => window.location.assign("/"))
  })
}
_onLogoButtonClick()

function _onHomeButtonClick() {
  const buttons = document.querySelectorAll("div[class*='navbar-link-place']")

  if (buttons.length === 0) return

  buttons.forEach(button => {
    if (window.location.pathname === "/") {
      button.setAttribute("style", "color: #b71919; -webkit-text-stroke: #b71919;")
      return
    }
    button.setAttribute("style", "cursor: pointer;")
    button.addEventListener("click", (event) => window.location.assign("/"))
  })
}
_onHomeButtonClick()

function _onCalculatorButtonClick() {
  const buttons = document.querySelectorAll("div[class*='navbar-link-rechner']")

  if (buttons.length === 0) return

  buttons.forEach(button => {
    if (window.location.pathname === "/zeitrechner/") {
      button.setAttribute("style", "color: #b71919; -webkit-text-stroke: #b71919;")
      return
    }
    button.setAttribute("style", "cursor: pointer;")
    button.addEventListener("click", (event) => window.location.assign("/zeitrechner"))
  })
}
_onCalculatorButtonClick()

function _onNetworkButtonClick() {
  const buttons = document.querySelectorAll("div[class*='navbar-link-netzwerk']")

  if (buttons.length === 0) return

  buttons.forEach(button => {
    if (window.location.pathname === "/netzwerk/") {
      button.setAttribute("style", "color: #b71919; -webkit-text-stroke: #b71919;")
      return
    }
    button.setAttribute("style", "cursor: pointer;")
    button.addEventListener("click", (event) => window.location.assign("/netzwerk"))
  })
}
_onNetworkButtonClick()

function _onPlatformButtonClick() {
  const buttons = document.querySelectorAll("div[class*='navbar-link-plattform']")

  if (buttons.length === 0) return

  buttons.forEach(button => {
    if (window.location.pathname === "/plattform/") {
      button.setAttribute("style", "color: #b71919; -webkit-text-stroke: #b71919;")
      return
    }
    button.setAttribute("style", "cursor: pointer;")
    button.addEventListener("click", (event) => window.location.assign("/plattform"))
  })
}
_onPlatformButtonClick()

function _onSignInButtonClick() {
  const buttons = document.querySelectorAll("div[class*='overlap-group8']")

  if (buttons.length === 0) return

  buttons.forEach(button => {
    button.addEventListener("click", async (event) => {

      const accountIdFields = document.querySelectorAll("input[name='accountId']")

      if (accountIdFields.length === 0) return
      let accountId
      accountIdFields.forEach(field => {
        if (!field.checkValidity()) {
          field.setAttribute("style", `
            border-radius: 15px;
            border-color: red;
            background-color: transparent;
            width: 100%;
            height: 100%;
            padding-left: 5%;
            color: #d1d1d1;
          `)
          field.setAttribute("title", "Dieses Feld ist notwendig.")
          return
        }
        accountId = field.value
      })
      if (accountId === undefined) return
      if (accountId.length > 13) return

      const privateKeyFields = document.querySelectorAll("input[name='privateKey']")
      if (privateKeyFields.length === 0) return
      let privateKey
      privateKeyFields.forEach(field => {
        if (!field.checkValidity()) {
          field.setAttribute("style", `
            border-radius: 15px;
            border-color: red;
            background-color: transparent;
            width: 100%;
            height: 100%;
            padding-left: 5%;
            color: #d1d1d1;
          `)
          field.setAttribute("title", "Dieses Feld ist notwendig.")
          return
        }
        privateKey = field.value
      })
      if (privateKey === undefined) return

      const signInResponse = await _signIn(accountId)

      window.sessionStorage.setItem("userSession", JSON.stringify({accountId, privateKey, signInResponse}))

      window.location.assign("/finanzstatus")
    })
  })
}
_onSignInButtonClick()

