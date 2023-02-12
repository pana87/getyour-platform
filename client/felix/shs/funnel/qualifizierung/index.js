import { FunnelField } from "../../../../js/FunnelField.js"
import { Helper } from "../../../../js/Helper.js"
import { Request } from "../../../../js/Request.js"

const getFunnel = {}
getFunnel.url = window.__DB_LOCATION__ + "/"
getFunnel.method = "get"
getFunnel.security = "open"
getFunnel.type = "funnel"
getFunnel.name = "shs"

const res = await Request.middleware(getFunnel)
if (res.status === 200) {
  const funnel = JSON.parse(res.response)

  const storage = JSON.parse(window.localStorage.getItem(funnel.storage))
  if (storage !== null) {
    Helper.nextFunnel(funnel.paths)
  } else {

    document.querySelectorAll("img[class*='logo']").forEach(logo => {
      logo.addEventListener("click", () => {
        window.location.reload()
      })
    })

    const funnelField = new FunnelField("div[class*='funnel-placeholder']")
    .withFunnel(funnel)
    .withUnloadEventListener()
    .withClickOnAnswerEventListener((questionIndex, answerIndex) => {

      if (questionIndex === 0 && answerIndex === 1) {
        window.location.assign("/felix/shs/")
        return
      }

      if (questionIndex === 1 && answerIndex === 1) {
        window.location.assign("/felix/shs/")
        return
      }

      if (questionIndex === 1 && answerIndex === 3) {
        window.location.assign("/felix/shs/")
        return
      }

      if (questionIndex === 10 && answerIndex === 1) {
        const q7 = JSON.parse(window.localStorage.getItem(funnel.storage)).value.q7
        const q8 = JSON.parse(window.localStorage.getItem(funnel.storage)).value.q8
        const q9 = JSON.parse(window.localStorage.getItem(funnel.storage)).value.q9

        if (q7 === 1 && q8 === 1 && q9 === 1) {
          window.location.assign("/felix/shs/")
          return
        }
      }

      if (questionIndex === 11 && answerIndex === 1) {
        window.location.assign("/felix/shs/")
        return
      }

      funnel.questionIndex = funnel.questionIndex + 1
      funnelField.withFunnel(funnel)

    })
  }
}



