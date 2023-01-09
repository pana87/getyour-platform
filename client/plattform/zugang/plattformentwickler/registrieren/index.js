import {TextField} from "../../../../js/TextField.js"
import {ButtonField} from "../../../../js/ButtonField.js"
import {PasswordField} from "../../../../js/PasswordField.js"
import {Helper} from "../../../../js/Helper.js"
import {Request} from "../../../../js/Request.js"

const nameField = new TextField("div[class*='create-name']")
  .withPlaceholder("Nutzername..")
  .withPattern("[a-z]+")
  .withMaxLength(13)
  .withRequired()
  .withInputEventListener(() => {
    nameField.withValidValue((value) => {
      document.querySelectorAll("div[class*='preview-url']").forEach(field => field.innerHTML = `https://get-your.de/${value}`)
    })
  })

const createPasswordField = new PasswordField("div[class*='create-password']")
  .withPlaceholder("Passwort..")
  .withMinLength(8)
  .withRequired()
  .withInputEventListener(() => createPasswordField.withValidStyle())

const confirmPasswordField = new PasswordField("div[class*='confirm-password']")
  .withPlaceholder("Passwort bestätigen..")
  .withMinLength(8)
  .withRequired()
  .withInputEventListener(() => confirmPasswordField.withValidStyle())

new ButtonField("div[class*='register-button']").withInnerHtml("Registrieren").withOnclick(async () => {

  let name
  nameField.withValidValue((value) => name = value)

  let createPassword
  createPasswordField.withValidValue((value) => createPassword = value)

  let confirmPassword
  confirmPasswordField.withValidValue((value) => confirmPassword = value)

  if (
    name !== undefined &&
    createPassword !== undefined &&
    confirmPassword !== undefined
  ) {
    const createPasswordHash = await Helper.digest(createPassword)
    const confirmPasswordHash = await Helper.digest(confirmPassword)
    if (createPasswordHash === confirmPasswordHash) {
      await Request.storeName(name)
      await Request.storePassword(createPasswordHash)
      window.location.assign(`/${name}/`)
    }
  }
})
