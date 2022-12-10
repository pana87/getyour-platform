import { SHSChecklistItem } from "../felix/shs/technician/checklist-item/SHSChecklistItem.js"
import { AddInteractionButton } from "./AddInteractionButton.js"
import { FunnelButton } from "./FunnelButton.js"
import { InteractionList } from "./InteractionList.js"
import { ModalHeader } from "./ModalHeader.js"
import { MoreList } from "./MoreList.js"
import { NavigationLayout } from "./NavigationLayout.js"
import { PlatformList } from "./PlatformList.js"
import { _getListOfPlatforms, _getUserSession } from "./storage.js"
import { ToolboxLogo } from "./ToolboxLogo.js"


function _renderSHSChecklistItems() {
  console.log("hi");
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
  document.body.insertBefore(new SHSChecklistItem(), document.body.querySelector("div[class=content]"))
}
_renderSHSChecklistItems()

// function _renderFunnelList() {
//   const divs = document.querySelectorAll("div[class=gruppe-1455]")

//   console.log(divs);

//   divs.forEach(div => {
//     div.innerHTML = ""
//   })
// }
// _renderFunnelList()

function _renderPlatformSelect() {
  const divs = document.querySelectorAll("div[class=overlap-group1]")

  if (divs.length === 0) return
  if (window.location.pathname !== "/toolbox/funnel/erstellen/") return

  const label = document.createElement("label")
  label.setAttribute("for", "platforms")
  // label.innerHTML = "Plattform auswählen ▼"

  const select = document.createElement("select")
  select.setAttribute("name", "platforms")
  select.setAttribute("id", "platforms")
  // input.setAttribute("placeholder", "Plattform auswählen ▼")
  select.style.width = "100%"
  select.style.height = "100%"
  select.style.backgroundColor = "white"
  select.style.paddingLeft = "5px"
  select.style.borderRadius = "5px"
  select.style.border = "none"

  const platforms = _getListOfPlatforms()

  platforms.forEach(platform => {
    const option = document.createElement("option")
    option.value = platform.name
    option.innerHTML = platform.name
    select.append(option)
  })

  divs.forEach(div => {
    div.innerHTML = ""
    div.append(label)
    div.append(select)
  })
}
_renderPlatformSelect()

function _renderFunnelNameInputField() {
  const divs = document.querySelectorAll("div[class=overlap-group]")

  if (divs.length === 0) return
  if (window.location.pathname !== "/toolbox/funnel/erstellen/") return

  const input = document.createElement("input")
  input.setAttribute("type", "text")
  input.setAttribute("name", "funnelName")
  input.setAttribute("required", "true")
  input.setAttribute("placeholder", "Funnelname..")
  input.style.width = "100%"
  input.style.height = "100%"
  input.style.backgroundColor = "white"
  input.style.paddingLeft = "5px"
  input.style.borderRadius = "5px"
  input.style.border = "none"
  divs.forEach(div => {
    div.innerHTML = ""
    div.append(input)
  })
}
_renderFunnelNameInputField()

function _addNavigationLayout() {
  if (window.location.pathname.startsWith("/toolbox/")) document.body.append(new NavigationLayout())
}
_addNavigationLayout()


function _renderGetyourAccountInputField() {
  const fields = document.querySelectorAll("div[class*='overlap-group7'")

  if (fields.length === 0) return

  fields.forEach(field => {
    field.innerHTML = ""
    const input = document.createElement("input")

    input.setAttribute("type", "text")
    input.setAttribute("name", "accountId")
    input.setAttribute("pattern", "\\d.\\d.\\d{4,}")
    input.setAttribute("required", "true")
    input.setAttribute("title", "Geben Sie hier Ihre Account Id an.")
    input.setAttribute("placeholder", "Account ID")
    input.setAttribute("style", `
      background-color: transparent;
      border-radius: 15px;
      border-color: #d1d1d1;
      width: 100%;
      height: 100%;
      padding-left: 5%;
      color: #d1d1d1;
    `)

    input.addEventListener("keyup", (event) => {
      input.setAttribute("style", `
        border-radius: 15px;
        border-color: red;
        background-color: transparent;
        width: 100%;
        height: 100%;
        padding-left: 5%;
        color: #d1d1d1;
      `)
      input.setAttribute("title", "Dieses Feld ist notwendig.")

      if (input.checkValidity()) {
        input.setAttribute("style", `
          border-radius: 15px;
          border-color: green;
          background-color: transparent;
          width: 100%;
          height: 100%;
          padding-left: 5%;
          color: #d1d1d1;
        `)
        input.setAttribute("title", "✅")
      }
    })
    field.appendChild(input)
  })
}
_renderGetyourAccountInputField()

function _renderGetyourPrivatekeyInputField() {
  const fields = document.querySelectorAll("div[class*='overlap-group10']")

  if (fields.length === 0) return

  fields.forEach(field => {
    field.innerHTML = ""
    const input = document.createElement("input")

    input.setAttribute("type", "password")
    input.setAttribute("name", "privateKey")
    input.setAttribute("required", "true")
    input.setAttribute("title", "Bitte geben Sie Ihren Private Key an.")
    input.setAttribute("placeholder", "Private Key")
    input.setAttribute("style", `
      background-color: transparent;
      border-radius: 15px;
      border-color: #d1d1d1;
      width: 100%;
      height: 100%;
      padding-left: 5%;
      color: #d1d1d1;
    `)

    input.addEventListener("keyup", (event) => {
      input.setAttribute("style", `
        border-radius: 15px;
        border-color: red;
        background-color: transparent;
        width: 100%;
        height: 100%;
        padding-left: 5%;
        color: #d1d1d1;
      `)
      input.setAttribute("title", "Dieses Feld ist notwendig.")

      if (input.checkValidity()) {
        input.setAttribute("style", `
          border-radius: 15px;
          border-color: green;
          background-color: transparent;
          width: 100%;
          height: 100%;
          padding-left: 5%;
          color: #d1d1d1;
        `)
        input.setAttribute("title", "✅")
      }
    })
    field.appendChild(input)
  })
}
_renderGetyourPrivatekeyInputField()

// Sicherheitstufen anhand user rollen
/**
 *
 * admin
 * member
 * open
 *
 *
 * sichtbarkeit
 *
 * nur für mich
 * nur für mitglieder
 * für alle sichtbar
 */

// function _removePlatformFromDesktopDevices() {

//   if (!isMobile()) document.querySelectorAll("div[class*='navbar-link-plattform']").forEach(button => button.remove())

//   if (window.location.pathname === "/plattform/") {
//     if (!isMobile()) {
//       _removeDocument()
//       alert("Die Plattform ist nur über Mobilgeräte erreichbar.")
//       window.history.back()
//     }
//   }
// }
// _removePlatformFromDesktopDevices()

// function _removeDocumentFrom(path) {
//   if (window.location.pathname === path) {
//     if (!isMobile()) {
//       _removeDocument()
//       alert(`${path} ist nur über Mobilgeräte erreichbar.`)
//       window.location.assign("/")
//     }
//   }
// }
// _removeDocumentFrom("/dashboard/")
// _removeDocumentFrom("/toolbox/")
// _removeDocumentFrom("/notifications/")
// _removeDocumentFrom("/more/")


// function isMobile() {
//   const mql = window.matchMedia("(min-width: 1280px)")
//   let widthMatch = mql.matches
//   mql.addEventListener("change", (event) => widthMatch = event.matches)

//   const mql2 = window.matchMedia("(pointer: coarse)")
//   let pointerMatch = mql2.matches
//   mql2.addEventListener("change", (event) => pointerMatch = event.matches)

//   const mql3 = window.matchMedia("(hover: none)")
//   let hoverMatch = mql3.matches
//   mql3.addEventListener("change", (event) => hoverMatch = event.matches)

//   return widthMatch && pointerMatch && hoverMatch
// }

function _removeDocument() {
  const documentTags = document.getElementsByTagName("*")
  for (let tag of documentTags) tag.remove()
}

async function _renderAccountBalance() {
  const accountBalances = document.querySelectorAll("p[class*='accountBalance']")

  if (accountBalances.length === 0) return

  const userSession = await _getUserSession()

  if (userSession === undefined) return

  const result = JSON.parse(userSession.signInResponse).accounts[0].balance.balance / 100000000

  accountBalances.forEach(balance => {
    balance.innerHTML = `${result} ℏ`
    balance.setAttribute("style", `
      color: green;
      font-size: 32px;
    `)
  })
}
_renderAccountBalance()

async function _renderAccountId() {
  const accountIds = document.querySelectorAll("p[class*='accountId']")

  if (accountIds.length === 0) return

  const userSession = await _getUserSession()

  if (userSession === undefined) return

  accountIds.forEach(id => id.innerHTML = userSession.accountId)
}
_renderAccountId()

function _renderNavigationLayout() {
  const navigationLayouts = document.querySelectorAll("div[class*='getyour-navigation-layout']")

  if (navigationLayouts.length === 0) return

  navigationLayouts.forEach(div => div.append(new NavigationLayout()))
}
_renderNavigationLayout()

function _renderGetyourToolboxLogo() {
  const toolboxLogos = document.querySelectorAll("div[class*='getyour-toolbox-logo']")

  if (toolboxLogos.length === 0) return

  toolboxLogos.forEach(div => div.append(new ToolboxLogo()))
}
_renderGetyourToolboxLogo()

function _renderAddInteractionButton() {
  const interactionButtons = document.querySelectorAll("div[class*='getyour-interaction-button']")

  if (interactionButtons.length === 0) return

  interactionButtons.forEach(div => div.append(new AddInteractionButton()))
}
_renderAddInteractionButton()

function _renderInteractionList() {
  const interactionList = document.querySelectorAll("div[class*='getyour-interaction-list']")

  if (interactionList.length === 0) return

  interactionList.forEach(div => div.append(new InteractionList()))
}
_renderInteractionList()

function _renderMoreList() {
  const divs = document.querySelectorAll("div[class=getyour-more-list]")

  if (divs.length === 0) return

  divs.forEach(div => div.append(new MoreList()))
}
_renderMoreList()

function _renderPlatformList() {
  const divs = document.querySelectorAll("div[class=getyour-platform-list]")

  if (divs.length === 0) return

  const platforms = _getPlatformsFromLocalStorage()

  divs.forEach(div => {
    div.append(new PlatformList())
  })

}
_renderPlatformList()

function _renderFunnelTitle() {
  const divs = document.querySelectorAll("div[class=getyour-funnel-title]")

  if (divs.length === 0) return

  const modalHeader = new ModalHeader()
  modalHeader.withTitle("FUNNEL auswählen")
  modalHeader.withIcon("funnel-icon.png")

  divs.forEach(div => div.append(modalHeader))
}
_renderFunnelTitle()

function _renderFunnelButton() {
  const divs = document.querySelectorAll("div[class=getyour-funnel-button]")


  if (divs.length === 0) return



  divs.forEach(div => div.append(new FunnelButton()))

}
_renderFunnelButton()

