import { EmailField } from "../../../../js/EmailField.js"
import { ButtonField } from "../../../../js/ButtonField.js"
import { Request } from "../../../../js/Request.js"
import { UserRoles } from "../../../../js/UserRoles.js"
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
    const pin = prompt(`Herzlich Willkommen bei getyour plattform.\n\nIch bin Droid, dein persönlicher Assistent. Ich habe dir gerade eine E-Mail an '${value}' gesendet.\n\nBestätige die PIN aus der E-Mail um fortzufahren.`)
    await Request.verifyPin(pin)

    window.sessionStorage.setItem("email", value)

    const digest = await Helper.digestSessionStorage()

    await Request.storeEmail(value)
    await Request.storeRoles([
      UserRoles.PLATFORM_DEVELOPER
    ])
    await Request.storeDigest(digest)
    await Request.sessionToken({
      email: value,
      digest: digest,
    })

    // window.location.assign("/plattform/zugang/plattformentwickler/registrieren/")
  })
})
