import { AnchorField } from "../../js/AnchorField.js"

new AnchorField("div[class*='operator-entry-anchor']")
.withType((a) => {
  a.innerHTML = "Anlagenbetreiber"
  a.href = "/felix/shs/funnel/qualifizierung/"
})
