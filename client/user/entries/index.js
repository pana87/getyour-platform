import { AnchorField } from "../../js/AnchorField.js"

// new AnchorField("div[class*='platform-developer-entry-anchor']")
// .withAnchor((a) => {
//   a.innerHTML = "Plattformentwickler"
//   a.href = "/user/register/platform-developer/"
// })

new AnchorField("div[class*='operator-entry-anchor']")
.withAnchor((a) => {
  a.innerHTML = "Anlagenbetreiber"
  a.href = "/felix/shs/funnel/qualifizierung/"
})
