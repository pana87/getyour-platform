export class FunnelField {

  #setStorage(questionIndex, answerIndex) {
    this.storage = JSON.parse(window.sessionStorage.getItem(this.storageName)) || {}
    this.storage[`q${questionIndex}`] = answerIndex
    window.sessionStorage.setItem(this.storageName, JSON.stringify(this.storage))
  }

  withStorage(name) {
    this.storageName = name
    return this
  }

  #setQuestion(index) {
    this.questionIndex = index
    if (index >= this.questions.length) {
      window.location.assign(this.nextFunnelPath)
      return
    }
    const divs = document.body.querySelectorAll(this.fieldSelector)
    divs.forEach(div => this.#appendSHSClickAndProceedFunnel(div))
  }

  withQuestions(array) {
    this.questions = array
    this.questionIndex = 0
    document.body.querySelectorAll(this.fieldSelector).forEach(div => this.#appendSHSClickAndProceedFunnel(div))
    return this
  }

  withFirstQuestion(index) {
    this.questionIndex = index
    document.body.querySelectorAll(this.fieldSelector).forEach(div => this.#appendSHSClickAndProceedFunnel(div))
    return this
  }

  withNextFunnelPath(nextFunnelPath) {
    this.nextFunnelPath = nextFunnelPath
    return this
  }

  #nextQuestion(event) {
    const {questionIndex, answerIndex} = event.detail

    if (questionIndex === 0) window.sessionStorage.removeItem(this.storageName)

    if (this.storageName) {
      this.#setStorage(questionIndex, answerIndex)
    }

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
      const q7 = JSON.parse(window.sessionStorage.getItem(this.storageName)).q7
      const q8 = JSON.parse(window.sessionStorage.getItem(this.storageName)).q8
      const q9 = JSON.parse(window.sessionStorage.getItem(this.storageName)).q9

      if (q7 === 1 && q8 === 1 && q9 === 1) {
        window.location.assign("/felix/shs/")
        return
      }
    }

    if (questionIndex === 11 && answerIndex === 1) {
      window.location.assign("/felix/shs/")
      return
    }

    if (questionIndex === 12 && answerIndex === 0) {
      this.#setQuestion(questionIndex + 2)
      return
    }

    this.#setQuestion(questionIndex + 1)
  }

  #appendSHSClickAndProceedFunnel(div) {
    div.innerHTML = ""

    const container = document.createElement("div")
    container.classList.add("question-container")
    container.style.backgroundColor = "#cecece"
    container.style.padding = "5% 5%"
    container.style.borderRadius = "5px"
    container.style.overflow = "auto"
    container.style.height = "100%"
    container.style.fontFamily = "var(--font-family-applebraille-regular)"
    container.addEventListener("nextQuestion", (event) => this.#nextQuestion(event))

    const questionText = document.createElement("p")
    questionText.classList.add("question-text")
    questionText.innerHTML = this.questions[this.questionIndex].question
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

    this.questions[this.questionIndex].answers.forEach((answer, index) => {
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
          questionIndex: this.questionIndex,
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

    div.append(container)
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    const divs = document.body.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) return
    console.error("FIELD_NOT_FOUND")
  }
}
