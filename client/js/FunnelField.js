import { Helper } from "./Helper.js"

export class FunnelField {

  withUnloadEventListener() {
    window.addEventListener("unload", () => {
      if (this.funnel.questionIndex <= (this.funnel.questions.length - 1)) {
        window.localStorage.removeItem(this.funnel.storage)
      }
    })
    return this
  }

  withFunnelCompletedEventListener(callback) {
    this.onFunnelCompleted = callback
    return this
  }

  withFunnel(funnel) {
    this.funnel = funnel
    document.body.querySelectorAll(this.fieldSelector).forEach(div => this.#setFunnel(div))
    return this
  }

  withType(callback) {
    if (callback !== undefined) callback(this.funnel)
    return this
  }

  #setStorage(questionIndex, answerIndex) {
    try {
      this.funnel.value[`q${questionIndex}`] = answerIndex
      window.localStorage.setItem(this.funnel.storage, JSON.stringify(this.funnel))
    } catch (error) {
      console.error(error)
    }
    return this
  }

  withClickOnAnswerEventListener(callback) {
    this.clickOnAnswer = callback
    return this
  }

  #nextQuestion(index) {
    this.funnel.questionIndex = index + 1
  }

  #setFunnel(div) {
    div.innerHTML = ""

    if (this.funnel.questions[this.funnel.questionIndex] === undefined) {
      // funnel finished callback
      if (this.onFunnelCompleted !== undefined) this.onFunnelCompleted()
      Helper.nextFunnel(this.funnel.paths)
      return
    }

    const container = document.createElement("div")
    container.classList.add("question-container")
    container.style.backgroundColor = "#cecece"
    container.style.padding = "5% 5%"
    container.style.borderRadius = "5px"
    container.style.overflow = "auto"
    container.style.height = "100%"
    container.style.fontFamily = "var(--font-family-applebraille-regular)"

    const questionText = document.createElement("p")
    questionText.classList.add("question-text")
    questionText.innerHTML = this.funnel.questions[this.funnel.questionIndex].question
    questionText.style.textAlign = "center"
    questionText.style.lineHeight = "2"

    const answerContainer = document.createElement("div")
    answerContainer.classList.add("answer-container")
    answerContainer.style.display = "flex"

    const mql = window.matchMedia("(max-width: 610px)")
    if (mql.matches) {
      answerContainer.style.flexDirection = "column"
    }

    answerContainer.style.flexWrap = "wrap"
    answerContainer.style.justifyContent = "space-around"
    answerContainer.style.alignItems = "center"
    answerContainer.style.marginTop = "5%"

    this.funnel.questions[this.funnel.questionIndex].answers.forEach((answer, index) => {
      const answerBox = document.createElement("div")
      answerBox.classList.add("answer-box")
      answerBox.style.display = "flex"
      answerBox.style.flexDirection = "column"
      answerBox.style.alignItems = "center"
      answerBox.style.width = "40%"
      answerBox.style.marginTop = "55px"
      answerBox.style.cursor = "pointer"

      window.addEventListener("resize", () => {
        if (window.innerWidth < 610) {
          answerContainer.style.flexDirection = "column"
          answerBox.style.width = "100%"
        } else {
          answerContainer.style.flexDirection = "row"
          answerBox.style.width = "40%"
        }
      })
      if (mql.matches) {
        answerBox.style.width = "100%"
      }

      answerBox.addEventListener("click", () => {
        this.answerIndex = index
        this.#setStorage(this.funnel.questionIndex, this.answerIndex)
        if (this.clickOnAnswer !== undefined) this.clickOnAnswer(this.funnel.questionIndex, this.answerIndex)
        else this.#nextQuestion(this.funnel.questionIndex)
        this.#setFunnel(div)
      })

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

    div.append(container)
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.type = "funnel"
    const divs = document.body.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) return
    console.warn(`class='${this.className}' - field not found`)
  }
}
