import { EmailField } from "../../../../js/EmailField.js"
import { ButtonField } from "../../../../js/ButtonField.js"
import { Request } from "../../../../js/Request.js"
import { UserRoles } from "../../../../js/UserRoles.js"

const emailField = new EmailField("div[class*='create-email']")
  .withPlaceholder("meine.email@get-your.de")
  .withPattern(".+@get-your.de")
  .withInputEventListener(() => {
    emailField.withValidValue((value) => emailField.withValidStyle())
  })


new ButtonField("div[class*='login-button']").withInnerHtml("Anmelden").withOnclick(async () => {

  const userEmail = emailField.getValue()
  if (userEmail !== undefined) {
    await Request.verifyEmail(userEmail)

    const pin = prompt(`Herzlich Willkommen bei getyour plattform.\n\nIch bin Droid, dein persönlicher Assistent. Ich habe dir gerade eine E-Mail an '${userEmail}' gesendet.\n\nBestätige die PIN aus der E-Mail um fortzufahren.`)
    await Request.verifyPin(pin)

    Request.storeToLocalstorage("email", userEmail)
    await Request.storeEmail(userEmail)
    await Request.storeRoles([
      UserRoles.PLATFORM_DEVELOPER
    ])

    window.location.assign("/zugang/plattformentwickler/registrieren/")
    return
  }

  emailField.withNotValidStyle()
  console.error("NO_VALID_INPUT")
})
