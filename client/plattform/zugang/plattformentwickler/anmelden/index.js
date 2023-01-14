import { EmailField } from "../../../../js/EmailField.js"
import { ButtonField } from "../../../../js/ButtonField.js"
import { Request } from "../../../../js/Request.js"
import { UserRole } from "../../../../js/UserRole.js"
import { Helper } from "../../../../js/Helper.js"

const emailField = new EmailField("div[class*='create-email']")
  .withPlaceholder("meine.email@get-your.de")
  .withPattern(".+@get-your.de")
  .withRequired()
  .withInputEventListener(() => {
    emailField.withValidValue()
  })

new ButtonField("div[class*='login-button']").withInnerHtml("Anmelden").withOnclick(async () => {

  emailField.withValidValue( async (value) => {
    await Request.verifyEmail(value)
    // const pin = prompt(`Herzlich Willkommen bei getyour plattform.\n\nIch bin Droid, dein persönlicher Assistent. Ich habe dir gerade eine E-Mail an '${value}' gesendet.\n\nBestätige die PIN aus der E-Mail um fortzufahren.`)
    // await Request.verifyPin(pin)


    // await Request.registerPlatformDeveloper()
    // await Request.storeId(value)
    // await Request.storeRole(UserRole.PLATFORM_DEVELOPER)


    await Request.sessionToken()

    window.location.assign("/plattform/zugang/plattformentwickler/registrieren/")
  })
})
