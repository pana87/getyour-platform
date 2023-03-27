import { Helper } from "/js/Helper.js"

export class FunnelField {

  onWindowUnload(callback) {
    window.addEventListener("unload", (event) => callback(event))
    return this
  }

  withFunnelCompleted(callback) {
    this.withFunnelCompletedCallback = callback
    return this
  }

  withFunnel(funnel) {
    this.funnel = funnel
    document.querySelectorAll(this.fieldSelector).forEach(field => this.#setFunnel(field))
    return this
  }

  withClickOnAnswerEventListener(callback) {
    this.clickOnAnswer = callback
    return this
  }

  #setFunnel(field) {
    field.innerHTML = ""

    if (this.funnel.questions[this.funnel.questionIndex] === undefined) {
      if (this.withFunnelCompletedCallback !== undefined) this.withFunnelCompletedCallback()
      return
    }

    const container = document.createElement("div")
    // container.classList.add("question-container")
    container.style.backgroundColor = "#cecece"
    container.style.padding = "5% 5%"
    container.style.borderRadius = "13px"
    container.style.margin = "34px"
    // container.style.overflow = "auto"
    // container.style.height = "100%"
    // container.style.fontFamily = "var(--font-family-applebraille-regular)"

    const questionText = document.createElement("p")
    // questionText.classList.add("question-text")
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
      // answerBox.classList.add("answer-box")
      answerBox.style.display = "flex"
      answerBox.style.flexDirection = "column"
      answerBox.style.alignItems = "center"
      answerBox.style.width = "40%"
      answerBox.style.marginTop = "55px"
      answerBox.style.cursor = "pointer"
      // answerBox.style.padding = "21px"

      window.addEventListener("resize", () => {
        if (window.innerWidth < 767) {
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
        // save to storage
        if (this.funnel.value === undefined) this.funnel.value = {}
        this.funnel.value[`q${this.funnel.questionIndex}`] = index
        // Helper.setFunnel(this.funnel)
        window.localStorage.setItem(this.funnel.storage, JSON.stringify(this.funnel))

        if (this.clickOnAnswer !== undefined) {
          this.clickOnAnswer(this.funnel.questionIndex, index)
        } else {
          this.funnel.questionIndex = this.funnel.questionIndex + 1
          this.#setFunnel(field)
        }
      })

      const answerImage = document.createElement("img")
      // answerImage.classList.add("answer-image")
      answerImage.src = answer.image
      answerImage.style.borderRadius = "5px"
      // answerImage.style.padding = "144px"
      // answerImage.style.width = "100%"

      const answerText = document.createElement("p")
      // answerText.classList.add("answer-text")
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

    field.append(container)
  }

  constructor(name) {
    try {
      if (Helper.stringIsEmpty(name)) throw new Error("field name is empty")
      this.name = name
      this.fieldSelector = `div[class='${this.name}']`
      this.type = "funnel"
      const fields = document.querySelectorAll(this.fieldSelector)
      // this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
      if (fields.length <= 0) throw new Error(`field '${this.name}' not found`)
    } catch (error) {
      console.error(error)
    }
  }
}
