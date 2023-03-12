import { CheckboxField } from "./CheckboxField.js";
import { DateField } from "./DateField.js";
import { DateTimeField } from "./DateTimeField.js";
import { EmailField } from "./EmailField.js";
import { FileField } from "./FileField.js";
import { Helper } from "./Helper.js"
import { NumberField } from "./NumberField.js";
import { PasswordField } from "./PasswordField.js";
import { SelectionField } from "./SelectionField.js";
import { TelField } from "./TelField.js";
import { TextAreaField } from "./TextAreaField.js";
import { TextField } from "./TextField.js";

export class FunnelField {

  fields = []

  async checkValidity() {
    // this.validityCheck = true
    for (let i = 0; i < this.fields.length; i++) {
      await this.fields[i].withValidValue()
    }
    return this
  }

  withStorage(name) {
    if (name !== undefined) this.withStorageName = name
    return this
  }

  #setFields(field) {
    field.innerHTML = ""

    for (let i = 0; i < this.withFieldsList.length; i++) {

      if (this.withFieldsList[i].type === "textarea") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const textAreaField = new TextAreaField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          textAreaField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          textAreaField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          textAreaField.fromStorage(this.withStorageName)
          textAreaField.withStorage(this.withStorageName)
          textAreaField.onInput(() => textAreaField.withStorage(this.withStorageName))
        }
        if (this.withFieldsList[i].onChange !== undefined) {
          textAreaField.onChange(this.withFieldsList[i].onChange)
        }
        this.createReference(textAreaField)
        this.fields.push(textAreaField)
        textAreaField.withValidValue()

      }


      if (this.withFieldsList[i].type === "date") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const dateField = new DateField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          dateField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          dateField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          dateField.fromStorage(this.withStorageName)
          dateField.withStorage(this.withStorageName)
          dateField.onInput(() => dateField.withStorage(this.withStorageName))
        }
        if (this.withFieldsList[i].onChange !== undefined) {
          dateField.onChange(this.withFieldsList[i].onChange)
        }
        this.createReference(dateField)
        this.fields.push(dateField)
        dateField.withValidValue()
      }


      if (this.withFieldsList[i].type === "datetime") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const dateTimeField = new DateTimeField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          dateTimeField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          dateTimeField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          dateTimeField.fromStorage(this.withStorageName)
          dateTimeField.withStorage(this.withStorageName)
          dateTimeField.onInput(() => dateTimeField.withStorage(this.withStorageName))
        }
        if (this.withFieldsList[i].onChange !== undefined) {
          dateTimeField.onChange(this.withFieldsList[i].onChange)
        }
        this.createReference(dateTimeField)
        this.fields.push(dateTimeField)
        dateTimeField.withValidValue()

      }

      if (this.withFieldsList[i].type === "tel") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const telField = new TelField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          telField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          telField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          telField.fromStorage(this.withStorageName)
          telField.withStorage(this.withStorageName)
          telField.onInput(() => telField.withStorage(this.withStorageName))
        }
        if (this.withFieldsList[i].onChange !== undefined) {
          telField.onChange(this.withFieldsList[i].onChange)
        }
        if (this.withFieldsList[i].onInput !== undefined) {
          telField.onInput(this.withFieldsList[i].onInput)
        }
        this.fields.push(telField)
        this.createReference(telField)
        telField.withValidValue()
      }


      if (this.withFieldsList[i].type === "text") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const textField = new TextField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          textField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          textField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          textField.fromStorage(this.withStorageName)
          textField.withStorage(this.withStorageName)
          textField.onInput(() => textField.withStorage(this.withStorageName))
        }
        if (this.withFieldsList[i].onChange !== undefined) {
          textField.onChange(this.withFieldsList[i].onChange)
        }
        this.createReference(textField)
        this.fields.push(textField)
        textField.withValidValue()

      }


      if (this.withFieldsList[i].type === "file") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const fileField = new FileField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          fileField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          fileField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          fileField.fromStorage(this.withStorageName)
          fileField.withStorage(this.withStorageName)
          fileField.onInput(() => fileField.withStorage(this.withStorageName))
        }
        if (this.withFieldsList[i].onChange !== undefined) {
          fileField.onChange(this.withFieldsList[i].onChange)
        }
        this.createReference(fileField)
        this.fields.push(fileField)
        fileField.withValidValue()

      }


      if (this.withFieldsList[i].type === "checkbox") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const checkboxField = new CheckboxField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          checkboxField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].afterCheckbox !== undefined) {
          checkboxField.afterCheckbox(this.withFieldsList[i].afterCheckbox)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          checkboxField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          checkboxField.fromStorage(this.withStorageName)
          checkboxField.withStorage(this.withStorageName)
          checkboxField.onInput(() => checkboxField.withStorage(this.withStorageName))
        }
        if (this.withFieldsList[i].onChange !== undefined) {
          checkboxField.onChange(this.withFieldsList[i].onChange)
        }
        this.createReference(checkboxField)
        this.fields.push(checkboxField)
        checkboxField.withValidValue()

      }

      if (this.withFieldsList[i].type === "password") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const passwordField = new PasswordField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          passwordField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          passwordField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          // passwordField.fromStorage(this.withStorageName)
          passwordField.withStorage(this.withStorageName)
          passwordField.onInput(() => passwordField.withStorage(this.withStorageName))
        }
        this.createReference(passwordField)
        this.fields.push(passwordField)
        passwordField.withValidValue()

      }



      if (this.withFieldsList[i].type === "email") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const emailField = new EmailField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          emailField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          emailField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          const email = window.localStorage.getItem("email")
          // console.log(email);
          if (email !== null) {
            emailField.fromStorage("email")
          }
          emailField.withStorage(this.withStorageName)
          emailField.onInput(() => emailField.withStorage(this.withStorageName))
        }
        this.createReference(emailField)
        this.fields.push(emailField)
        emailField.withValidValue()

      }



      if (this.withFieldsList[i].type === "number") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const numberField = new NumberField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withLabel !== undefined) {
          numberField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          numberField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          numberField.fromStorage(this.withStorageName)
          numberField.withStorage(this.withStorageName)
          numberField.onInput(() => numberField.withStorage(this.withStorageName))
        }
        this.createReference(numberField)
        this.fields.push(numberField)
        numberField.withValidValue()

      }

      if (this.withFieldsList[i].type === "select") {
        const div = document.createElement("div")
        div.classList.add(this.withFieldsList[i].class)
        field.append(div)

        const selectField = new SelectionField(this.withFieldsList[i].class)
        if (this.withFieldsList[i].withRequired !== undefined) {
          selectField.withRequired(this.withFieldsList[i].withRequired)
        }
        if (this.withFieldsList[i].withOptions !== undefined) {
          selectField.withOptions(this.withFieldsList[i].withOptions)
        }
        if (this.withFieldsList[i].withLabel !== undefined) {
          selectField.withLabel(this.withFieldsList[i].withLabel)
        }
        if (this.withFieldsList[i].withType !== undefined) {
          selectField.withType(this.withFieldsList[i].withType)
        }
        if (this.withStorageName !== undefined) {
          selectField.fromStorage(this.withStorageName)
          selectField.withStorage(this.withStorageName)
          selectField.onInput(() => selectField.withStorage(this.withStorageName))
        }
        if (this.withFieldsList[i].onChange !== undefined) {
          selectField.onChange(this.withFieldsList[i].onChange)
        }
        if (this.withFieldsList[i].onWindowLoad !== undefined) {
          selectField.onWindowLoad(this.withFieldsList[i].onWindowLoad)
        }
        if (this.withFieldsList[i].onInput !== undefined) {
          selectField.onInput(this.withFieldsList[i].onInput)
        }
        this.createReference(selectField)
        this.fields.push(selectField)
        selectField.withValidValue()

      }
    }
  }

  withFields(list) {
    if (list !== undefined) {
      this.withFieldsList = list
      // document.querySelectorAll(this.fieldSelector).forEach(field => this.#setFields(field))
      // this.createReference(this.fields)
    }
    return this
  }

  buildFields() {
    document.querySelectorAll(this.fieldSelector).forEach(field => this.#setFields(field))
    // console.log(this.fields);
    // this.createReference(this.fields)
    return this
  }

  createReference(object) {
    this[object.className] = object
    // for (let i = 0; i < array.length; i++) {
    //   // const element = array[i];
    // }
  }


  // createReference(array) {
  //   for (let i = 0; i < array.length; i++) {
  //     // const element = array[i];
  //     this[array[i].className] = array[i]
  //   }
  // }

  withUnloadEventListener() {
    window.addEventListener("unload", () => {
      if (this.funnel.questionIndex <= (this.funnel.questions.length - 1)) {
        const funnels = JSON.parse(window.localStorage.getItem("funnels"))
        if (funnels !== null) {
          const newFunnels = funnels.filter(it => it.storage !== this.funnel.storage)
          window.localStorage.setItem("funnels", JSON.stringify(newFunnels))
        }
      }
    })
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

  withType(callback) {
    if (callback !== undefined) callback(this.funnel)
    return this
  }

  #setStorage(questionIndex, answerIndex) {

    if (this.funnel.value === undefined) this.funnel.value = {}
    this.funnel.value[`q${questionIndex}`] = answerIndex
    // const funnel = Helper.getFunnel(this.funnel.storage)
    Helper.setFunnel({
      name: this.funnel.storage,
      key: `q${questionIndex}`,
      value: answerIndex
    })



    // try {






    //   const funnels = JSON.parse(window.localStorage.getItem("funnels"))
    //   if (funnels === null) window.localStorage.setItem("funnels", JSON.stringify([]))
    //   if (funnels !== null) {
    //     if (funnels.length === 0) {
    //       this.funnel.value[`q${questionIndex}`] = answerIndex
    //       funnels.push(this.funnel)
    //       window.localStorage.setItem("funnels", JSON.stringify(funnels))
    //     } else if (funnels.length > 0) {
    //       for (let i = 0; i < funnels.length; i++) {
    //         if (funnels[i].storage === this.funnel.storage) {
    //           funnels[i] = this.funnel
    //           window.localStorage.setItem("funnels", JSON.stringify(funnels))
    //         }
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.error(error)
    // }
    return this
  }

  withClickOnAnswerEventListener(callback) {
    this.clickOnAnswer = callback
    return this
  }

  #nextQuestion(index) {
    this.funnel.questionIndex = index + 1
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
        this.answerIndex = index
        this.#setStorage(this.funnel.questionIndex, this.answerIndex)
        // console.log("fqi", this.funnel.questionIndex)
        if (this.clickOnAnswer !== undefined) this.clickOnAnswer(this.funnel.questionIndex, this.answerIndex)
        else this.#nextQuestion(this.funnel.questionIndex)
        this.#setFunnel(field)
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

  constructor(className) {
    try {
      if (Helper.stringIsEmpty(className)) throw new Error("class name is empty")
      this.className = className
      this.fieldSelector = `[class='${this.className}']`
      this.type = "funnel"
      const fields = document.querySelectorAll(this.fieldSelector)
      if (fields.length <= 0) throw new Error(`field '${this.className}' not found`)
    } catch (error) {
      console.error(error)
    }
  }
}
