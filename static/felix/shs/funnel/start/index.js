import { SHSFunnelQuestionList } from "../../angebot/funnel/view/SHSFunnelQuestionList.js"

const questions = SHSFunnelQuestionList

changeQuestion(0)

function changeQuestion(questionIndex) {
  if (questionIndex >= questions.length) {
    window.location.assign("/felix/shs/funnel/haus/")
    return
  }

  const divs = document.body.querySelectorAll("div[class*=funnel-placeholder]")

  if (divs.length === 0) return

  divs.forEach(div => {

    const container = document.createElement("div")
    container.classList.add("question-container")
    container.style.backgroundColor = "#cecece"
    container.style.padding = "5% 5%"
    container.style.borderRadius = "5px"
    container.style.overflow = "auto"
    container.style.height = "100%"
    container.style.fontFamily = "var(--font-family-applebraille-regular)"
    container.addEventListener("nextQuestion", (event) => nextQuestion(event))

    const questionText = document.createElement("p")
    questionText.classList.add("question-text")
    questionText.innerHTML = questions[questionIndex].question
    questionText.style.textAlign = "center"
    questionText.style.lineHeight = "2"

    const answerContainer = document.createElement("div")
    answerContainer.classList.add("answer-container")
    answerContainer.style.display = "flex"

    const mql = window.matchMedia("(max-width: 900px)")
    if (mql.matches) {
      answerContainer.style.flexDirection = "column"
    }
    answerContainer.style.flexWrap = "wrap"
    answerContainer.style.justifyContent = "space-around"
    answerContainer.style.alignItems = "center"
    answerContainer.style.marginTop = "5%"

    questions[questionIndex].answers.forEach((answer, index) => {
      const answerBox = document.createElement("div")
      answerBox.classList.add("answer-box")
      answerBox.style.display = "flex"
      answerBox.style.flexDirection = "column"
      answerBox.style.alignItems = "center"
      answerBox.style.width = "40%"
      answerBox.style.marginTop = "55px"
      answerBox.style.cursor = "pointer"

      if (mql.matches) {
        answerBox.style.width = "100%"
      }

      const customEvent = new CustomEvent('nextQuestion', {
        bubbles: true,
        detail: {
          questionIndex: questionIndex,
          answerIndex: index,
        },
      })

      answerBox.addEventListener("click", () => answerBox.dispatchEvent(customEvent))

      const answerImage = document.createElement("img")
      answerImage.classList.add("answer-image")
      answerImage.src = answer.image
      answerImage.style.borderRadius = "5px"

      const answerText = document.createElement("p")
      answerText.classList.add("answer-text")
      answerText.innerHTML = answer.answer
      answerText.style.fontSize = "20px"
      answerText.style.fontWeight = "400"
      answerText.style.marginTop = "5%"

      answerBox.append(answerImage)
      answerBox.append(answerText)
      answerContainer.append(answerBox)
    })

    container.append(questionText)
    container.append(answerContainer)

    div.innerHTML = ""
    div.append(container)
  })
}

function nextQuestion(event) {
  const {questionIndex, answerIndex} = event.detail

  if (questionIndex === 0) window.localStorage.removeItem("shsFunnel")

  const shsFunnel = JSON.parse(window.localStorage.getItem("shsFunnel")) || {}
  shsFunnel[`funnelStartQuestion${questionIndex}`] = answerIndex
  window.localStorage.setItem("shsFunnel", JSON.stringify(shsFunnel))

  changeQuestion(questionIndex + 1)
}

