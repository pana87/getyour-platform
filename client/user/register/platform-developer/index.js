import {TextField} from "../../../js/TextField.js"
import {ButtonField} from "../../../js/ButtonField.js"
import {PasswordField} from "../../../js/PasswordField.js"
import {Helper} from "../../../js/Helper.js"
import {Request} from "../../../js/Request.js"

const nameField = new TextField("div[class*='create-name']")
.withInput((input) => {
  input.placeholder = "Nutzername.."
  input.pattern = "[a-z]+"
  input.maxLength = 13
  input.required = true
})
.withInputEventListener(() => {
  nameField.withValidValue((value) => {
    document.querySelectorAll("div[class*='preview-url']").forEach(field => field.innerHTML = `https://get-your.de/${value}`)
  })
})

const createPasswordField = new PasswordField("div[class*='create-password']")
.withInput((input) => {
  input.placeholder = "Passwort.."
  input.minLength = 8
  input.required = true
})
.withInputEventListener(() => createPasswordField.withValidStyle())

const confirmPasswordField = new PasswordField("div[class*='confirm-password']")
.withInput((input) => {
  input.placeholder = "Passwort bestätigen.."
  input.minLength = 8
  input.required = true
})
.withInputEventListener(() => createPasswordField.withValidStyle())

new ButtonField("div[class*='register-button']")
.withButton((button) => {
  button.innerHTML = "Registrieren"
  button.addEventListener("click", async () => {

    const name = await nameField.withValidValue()
    const createPassword = await createPasswordField.withValidValue()
    const confirmPassword = await confirmPasswordField.withValidValue()

    const createPasswordHash = await Helper.digest(createPassword)
    const confirmPasswordHash = await Helper.digest(confirmPassword)
    if (createPasswordHash === confirmPasswordHash) {
      const registerPlatformDeveloperRx = await Request.registerPlatformDeveloper({
        name,
        password: createPasswordHash,
      })
      if (registerPlatformDeveloperRx.status === 200) {
        window.location.assign(`/${name}/`)
      }
    }
  })
})
