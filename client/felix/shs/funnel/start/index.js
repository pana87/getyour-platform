const pathToAssets = "/felix/shs/funnel/start/"

const questions = [
  { question: "Um ein individuelles Angebot erstellen zu können, schenken Sie uns bitte vorab 10 Minuten Ihrer wertvollen Zeit für die Beantwortung der Fragen. Damit wir herausfinden können, ob unser Konzept auch etwas für Sie ist und um Ihre Bedürfnisse noch besser verstehen zu können. <br/><br/>Einverstanden und bereit?", answers: [
    { answer: "JA! Ich bin bereit!", image: `${pathToAssets}img/ja.svg`},
    { answer: "Nein, das ist mir zu aufwendig.", image: `${pathToAssets}img/nein.svg`}
  ]},
  { question: "Wo möchten Sie die Photovoltaik installieren?", answers: [
    { answer: "Ein-Zweifamilienhaus", image: `${pathToAssets}/img/einfamilienhaus.svg`},
    { answer: "Mehrfamilienhaus", image: `${pathToAssets}/img/mehrfamilien.svg`},
    { answer: "Firmengebäude", image: `${pathToAssets}/img/firmen.svg`},
    { answer: "Freilandfläche", image: `${pathToAssets}/img/freiland.svg`},
    { answer: "Sonstiges", image: `${pathToAssets}/img/sonstige.svg`}
  ]},
  { question: "Um welchen Gebäudetyp handelt es sich?", answers: [
    { answer: "freistehendes Haus", image: `${pathToAssets}/img/freistehend.svg`},
    { answer: "Doppelhaushälfte", image: `${pathToAssets}/img/doppelhaus.svg`},
    { answer: "Reihenhaus", image: `${pathToAssets}/img/reihenhaus.svg`}
  ]},
  { question: "Bewohnen Sie die Immobilie selbst?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/bewohnen.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/nichtbewohnen.svg`}
  ]},
  { question: "Sind Sie Eigentümer der Immobilie?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/eigentuemer.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/nichteigentuemer.svg`}
  ]},
  { question: "Welche Dachform hat das Haus?", answers: [
    { answer: "Satteldach", image: `${pathToAssets}/img/satteldach.svg`},
    { answer: "Pultdach", image: `${pathToAssets}/img/pultdach.svg`},
    { answer: "Flachdach", image: `${pathToAssets}/img/flachdach.svg`},
    { answer: "Walmdach", image: `${pathToAssets}/img/walmdach.svg`},
    { answer: "Sonstiges", image: `${pathToAssets}/img/sonstige.svg`}
  ]},
  { question: "Die Dacheindeckung ist..", answers: [
    { answer: "Steineindeckung", image: `${pathToAssets}/img/steineindeckung.svg`},
    { answer: "Faserzement", image: `${pathToAssets}/img/faserzement.svg`},
    { answer: "Blechdach", image: `${pathToAssets}/img/blechdach.svg`},
    { answer: "Schiefer", image: `${pathToAssets}/img/schiefer.svg`},
    { answer: "Dachpfannen", image: `${pathToAssets}/img/dachpfannen.svg`},
    { answer: "Bieberschwanz", image: `${pathToAssets}/img/bieberschwanz.svg`},
    { answer: "Sonstiges", image: `${pathToAssets}/img/sonstige.svg`},
  ]},
  { question: "Möchten Sie Ihr Energiekonzept durch eine Photovoltaikanlage ergänzen?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/photovoltaik.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/keinphotovoltaik.svg`}
  ]},
  { question: "Möchten Sie Ihr Energiekonzept durch einen Stromspeicher ergänzen?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/speicher.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/keinspeicher.svg`}
  ]},
  { question: "Möchten Sie Ihr Energiekonzept durch einen Wärmepumpe ergänzen?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/waermepumpe.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/keinewaermepumpe.svg`}
  ]},
  { question: "Möchten Sie Ihr Energiekonzept durch eine Solarthermie ergänzen?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/solar.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/keinsolar.svg`}
  ]},
  { question: "Möchten Sie die Anlage mieten oder kaufen?", answers: [
    { answer: "Kaufen", image: `${pathToAssets}/img/kaufen.svg`},
    { answer: "Mieten", image: `${pathToAssets}/img/mieten.svg`}
  ]},
  { question: "Wollen Sie Bar bezahlen oder finanzieren?", answers: [
    { answer: "Bar bezahlen", image: `${pathToAssets}/img/bar.svg`},
    { answer: "Ich möchte finanzieren", image: `${pathToAssets}/img/finanzieren.svg`}
  ]},
  { question: "Wie alt sind Sie?", answers: [
    { answer: "20 - 40 Jahre", image: `${pathToAssets}/img/20jahre.svg`},
    { answer: "41 - 50 Jahre", image: `${pathToAssets}/img/41jahre.svg`},
    { answer: "51 - 70 Jahre", image: `${pathToAssets}/img/51jahre.svg`},
    { answer: "über 70 Jahre", image: `${pathToAssets}/img/ueber70.svg`},
  ]},
  { question: "Wann soll die Photovoltaik installiert werden?", answers: [
    { answer: "so schnell wie möglich", image: `${pathToAssets}/img/sofort.svg`},
    { answer: "in 1-3 Monate", image: `${pathToAssets}/img/ab1.svg`},
    { answer: "in 4-6 Monate", image: `${pathToAssets}/img/ab4.svg`},
    { answer: "mehr als 6 Monate", image: `${pathToAssets}/img/mehrals6.svg`},
  ]},
]

export class SHSClickAndProceedFunnel {

  withFirstQuestion(index = 0) {
    this.questionIndex = index

    const divs = document.body.querySelectorAll("div[class*=funnel-placeholder]")

    divs.forEach(div => this.#appendSHSClickAndProceedFunnel(div))

    return this
  }

  #setQuestion(index) {
    this.questionIndex = index

    if (index >= this.questions.length) {
      window.location.assign("/felix/shs/funnel/haus/")
      return
    }

    const divs = document.body.querySelectorAll("div[class*=funnel-placeholder]")

    divs.forEach(div => this.#appendSHSClickAndProceedFunnel(div))
  }

  #nextQuestion(event) {
    const {questionIndex, answerIndex} = event.detail

    if (questionIndex === 0) window.localStorage.removeItem("shsFunnel")

    const shsFunnel = JSON.parse(window.localStorage.getItem("shsFunnel")) || {}
    shsFunnel[`q${questionIndex}`] = answerIndex
    window.localStorage.setItem("shsFunnel", JSON.stringify(shsFunnel))

    if (questionIndex === 1 && answerIndex === 1) {
      this.#setQuestion(questionIndex + 2)
      return
    }
    if (questionIndex === 1 && answerIndex === 3) {
      this.#setQuestion(questionIndex + 2)
      return
    }
    if (questionIndex === 1 && answerIndex === 4) {
      this.#setQuestion(questionIndex + 2)
      return
    }
    if (questionIndex === 11 && answerIndex === 1) {
      this.#setQuestion(questionIndex + 3)
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

  constructor(questions) {
    this.questions = questions
    this.questionIndex = 0

    const divs = document.body.querySelectorAll("div[class*=funnel-placeholder]")

    if (divs.length === 0) return

    divs.forEach(div => this.#appendSHSClickAndProceedFunnel(div))
  }
}

new SHSClickAndProceedFunnel(questions)


