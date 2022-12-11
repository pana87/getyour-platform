// import { Request } from "../../../../../js/Request.js"

const COMPONENT_PATHNAME = "/shs/funnel/view/"

export class Funnel extends HTMLElement {

  appendAnswer(answer, image) {
    const answers = [] // get from db???
    answers.push({
      answer: answer,
      image: image,
    })
    return answers
  }

  appendQuestion(funnel, question, answers) {
    funnel.push({
      question: question,
      answers: answers,
    })
    return questions
  }

  build(questionIndex) {
    if (questionIndex >= this.questions.length) {
      // onfinish
      return
    }

    const divs = this.shadowRoot.querySelectorAll("div[class*=funnel-placeholder]")

    if (divs.length === 0) return

    const container = document.createElement("div")
    container.classList.add("question-container")
    container.style.backgroundColor = "#cecece"
    container.style.margin = "0 auto"
    container.style.padding = "5% 0"
    container.style.width = "90%"
    container.style.borderRadius = "5px"
    container.style.fontFamily = "var(--font-family-applebraille-regular)"
    container.addEventListener("nextQuestion", (event) => this.nextQuestion(event))

    const questionText = document.createElement("p")
    questionText.classList.add("question-text")
    questionText.innerHTML = this.questions[questionIndex].question
    questionText.style.margin = "0 13%"
    questionText.style.textAlign = "center"
    questionText.style.lineHeight = "2.5"

    const answerContainer = document.createElement("div")
    answerContainer.classList.add("answer-container")
    answerContainer.style.display = "flex"
    answerContainer.style.flexWrap = "wrap"
    answerContainer.style.justifyContent = "space-around"
    answerContainer.style.alignItems = "center"
    answerContainer.style.marginTop = "5%"

    this.questions[questionIndex].answers.forEach((answer, index) => { /// change index
      const answerBox = document.createElement("div")
      answerBox.classList.add("answer-box")
      answerBox.style.display = "flex"
      answerBox.style.flexDirection = "column"
      answerBox.style.alignItems = "center"
      answerBox.style.width = "25vw"
      answerBox.style.marginTop = "55px"
      answerBox.style.cursor = "pointer"

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
      answerImage.src = answer.img
      answerImage.style.backgroundColor = "white"
      answerImage.style.borderRadius = "5px"
      // answerImage.style.padding = "21px"
      answerImage.style.boxShadow = "0px 2px 4px #00000029"

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

    divs.forEach(div => {
      div.innerHTML = ""
      div.append(container)
    })
  }

  nextQuestion(event) {
    console.log(event.detail);
    const {questionIndex} = event.detail

    if (questionIndex === 0) window.localStorage.removeItem("answers")

    const answers = JSON.parse(window.localStorage.getItem("answers")) || []
    answers.push(event.detail)
    window.localStorage.setItem("answers", JSON.stringify(answers))

    this.changeQuestion(questionIndex + 1)
  }

  async connectedCallback() {
    const styleguide = `${window.__PLATFORM_LOCATION__.origin}/felix/shs/angebot/funnel/view/styleguide.css`
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = styleguide
    const links = this.shadowRoot.querySelectorAll("link[rel='shortcut icon']")
    links.forEach(link => link.href = pathToFavicon)
    this.append(link)

    // const {html} = await Request.component(COMPONENT_PATHNAME)
    // this.shadowRoot.innerHTML = html

    this.build(0)
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    // this.questions = questions
  }
}
window.customElements.define("getyour-funnel", Funnel)
