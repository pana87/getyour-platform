import {textToClipboard, textToHtml, pathToId, textToH1, textToH2, textToTitle, idToScript, textToNote, textToHr, textToAction, textToLink, textToLine, tagToAllFirstUpper, textToTag, millisToIso, millisToSince, nodeToSelector} from "/js/convert.js"
import {removeDoubleFrontSlash, removeEmptyLine, removeNoSave, removeOverlays, removeSemicolon} from "/js/remove.js"
import {bashButton, goBackButton, toolboxButton, left, leftRight, addSaveButton} from "/js/button.js"
import {verifyInputs, verifyFunnel, pathIsValid, verifyInputValue, textIsEmpty} from "/js/verify.js"
import {observeDuplicateIds} from "/js/observer.js"
import {post} from "/js/request.js"
import {registerHtml, replaceInBody} from "/js/events.js"
import {alertNok, alertSaved} from "/js/alert.js"
import {pop, lock} from "/js/overlay.js"
import {downloadFile} from "/js/download.js"
import {addLoading} from "/js/events.js"
import {prettifyHtml} from "/js/prettify.js"
import {select, textarea, text} from "/js/input.js"
import {link, div, h1, p, h2} from "/js/html-tags.js"

const res = await post("/verify/user/closed/")
if (res.status === 200) {
  const res = await post("/verify/user/location-expert/")
  if (res.status === 200) {
    addToolbox()
  }
  if (res.status !== 200) {
    const res = await post("/verify/user/location-writable/")
    if (res.status === 200) {
      addToolbox()
    }
  }
}
function addToolboxButtons() {
  const back = goBackButton(document.body)
  const toolbox = toolboxButton(document.body)
  toolbox.onclick = () => toolboxOverlay({type: "expert"})
}
async function addToolbox() {
  if (pathIsValid()) {
    observeDuplicateIds()
    const save = (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') {
        ev.preventDefault()
        registerHtml()
      }
    }
    window.addEventListener('keydown', save)
    if (document.body) {
      await addToolboxGetter()
      addToolboxButtons()
      link("stylesheet", "/public/classes.css")
    } else {
      await sleep(3000)
      await addToolbox()
    }
  }
}
async function addToolboxGetter() {
  return new Promise(async(resolve) => {
    if (document.body) {
      document.querySelectorAll("#toolbox-getter").forEach(getter => getter.remove())
      const script = document.createElement("script")
      script.id = "toolbox-getter"
      script.src = `/js/toolbox-getter.js`
      script.type = "module"
      document.body.appendChild(script)
      resolve()
    } else {
      await sleep(3000)
      await addToolboxGetter()
    }
  })
}
function toolboxOverlay(callback = {}) {
  return pop(async o1 => {
    addSaveButton(callback.type, o1)
    const buttons = o1.content
    const appendBtn = leftRight({left: ".append", right: "Inhalte schnell und einfach anhängen"}, buttons)
    appendBtn.onclick = () => {
      pop(o2 => {
        const content = o2.content
        const bashBtn = leftRight({left: ".bash", right: "Füge einen Bash Befehl hinzu"}, content)
        bashBtn.onclick = () => {
          const textContent = window.prompt("Gebe deinen Bash Befehl ein:")
          if (textIsEmpty(textContent)) return
          const copyBtn = bashButton(textContent, document.body)
          removeOverlays()
        }
        const h2Btn = leftRight({left: ".h2", right: "Füge einen Untertitel hinzu"}, content)
        h2Btn.onclick = () => {
          const textContent = window.prompt("Gebe deinen Untertitel ein:")
          if (textIsEmpty(textContent)) return
          const node = h2("sans-serif fw-normal", document.body)
          node.textContent = textContent
          removeOverlays()
        }
        if (callback.type === "expert") {
          const innerHtmlBtn = leftRight({left: ".innerHTML", right: "Füge HTML hinzu"}, content)
          innerHtmlBtn.onclick = () => {
            const textContent = window.prompt("Gebe dein HTML ein:")
            if (textIsEmpty(textContent)) return
            textToHtml(textContent, document.body)
            removeOverlays()
          }
        }
        const paragraphBtn = leftRight({left: ".p", right: "Füge einen Paragraph hinzu"}, content)
        paragraphBtn.onclick = () => {
          const textContent = window.prompt("Gebe deinen Paragraph ein:")
          if (textIsEmpty(textContent)) return
          const node = p("sans-serif", document.body)
          node.textContent = textContent
          removeOverlays()
        }
        const titleBtn = leftRight({left: ".title", right: "Füge einen Titel hinzu"}, content)
        titleBtn.onclick = () => {
          const textContent = window.prompt("Gebe deinen Titel ein:")
          if (textIsEmpty(textContent)) return
          textToTitle(textContent)
          const titleH1 = h1("sans-serif fw-normal", document.body)
          titleH1.textContent = textContent
          removeOverlays()
        }
      })
    }
    const clearBtn = leftRight({left: ".clear", right: "Inhalt entfernen"}, buttons)
    clearBtn.onclick = () => {
      const nodes = Array.from(document.body.childNodes)
      nodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (!node.classList.contains("no-save") && node.id !== "toolbox-getter") node.remove()
        } else {
          node.remove()
        }
        removeOverlays()
      })
    }
    const convertText = leftRight({left: "convert.text", right: "Konvertiere Texte schnell und einfach"}, buttons)
    convertText.onclick = () => {
      pop(o2 => {
        addSaveButton(callback.type, o2)
        const content = o2.content
        function createInputField(placeholder) {
          const field = textarea(content)
          field.input.classList.add("fs13")
          field.input.placeholder = placeholder
          field.input.setAttribute("required", "true")
          verifyInputValue(field.input)
          return field
        }
        {
          const inputField = createInputField("Entferne alle JavaScript Kommentare (//)")
          inputField.input.oninput = () => {
            inputField.input.value = removeDoubleFrontSlash(inputField.input.value)
            verifyInputValue(inputField.input)
          }
        }
        {
          const inputField = createInputField("Entferne alle leeren Zeilen (\\n)")
          inputField.input.oninput = () => {
            inputField.input.value = removeEmptyLine(inputField.input.value)
            verifyInputValue(inputField.input)
          }
        }
        {
          const inputField = createInputField("Entferne alle Semicolon (;)")
          inputField.input.oninput = () => {
            inputField.input.value = removeSemicolon(inputField.input.value)
            verifyInputValue(inputField.input)
          }
        }
        {
          const field = createInputField("Konvertiere (text/line)")
          field.input.oninput = () => {
            field.input.value = textToLine(field.input.value)
            verifyInputValue(field.input)
          }
        }
        {
          const inputField = createInputField("Konvertiere (tag/Text)")
          inputField.input.oninput = () => {
            inputField.input.value = tagToAllFirstUpper(inputField.input.value)
            verifyInputValue(inputField.input)
          }
        }
        {
          const inputField = createInputField("Konvertiere (text/tag)")
          inputField.input.oninput = () => {
            inputField.input.value = textToTag(inputField.input.value)
            verifyInputValue(inputField.input)
          }
        }
        {
          const inputField = createInputField(`Konvertiere (millis/iso)`)
          inputField.input.oninput = () => {
            inputField.input.value = millisToIso(inputField.input.value)
            verifyInputValue(inputField.input)
          }
        }
        {
          const inputField = createInputField("Konvertiere (millis/since)")
          inputField.input.oninput = () => {
            inputField.input.value = millisToSince(inputField.input.value)
            verifyInputValue(inputField.input)
          }
        }
      })
    }
    const copyBtn = leftRight({left: ".copy", right: "Einfache Kopier Funktionen"}, buttons)
    copyBtn.onclick = () => {
      pop(o2 => {
        o1.addInfo(".copy")
        const content = o2.content
        const bashBtn = leftRight({left: ".bash", right: "Kopiert alle Bash Kommandos zum One Liner"}, content)
        bashBtn.onclick = () => {
          const bashes = Array.from(document.querySelectorAll(".bash"))
          .map(node => node.textContent)
          .join(" && ")
          textToClipboard(bashes).then(alertSaved).catch(alertNok)
          console.log(bashes)
        }
        const documentBtn = leftRight({left: ".document", right: "Kopiert das Dokument"}, content)
        documentBtn.onclick = () => {
          navigator.clipboard.writeText(document.documentElement.outerHTML)
          .then(() => window.alert("Dokument erfolgreich in die Zwischenablage kopiert."))
        }
      })
    }
    const documentBtn = leftRight({left: ".document", right: "Ein schneller Überblick"}, buttons)
    documentBtn.onclick = () => {
      pop(o2 => {
        addSaveButton(callback.type, o2)
        const content = o2.content
        const pre = document.createElement("pre")
        pre.className = "p8 pre-wrap monospace color-theme fs13"
        const prettified = prettifyHtml(document.documentElement.outerHTML)
        pre.textContent = prettified
        content.appendChild(pre)
      })
    }
    const documentBackup = leftRight({left: "document.backup", right: "Lade dein HTML Dokument herunter"}, buttons)
    documentBackup.onclick = async ev => {
      removeOverlays()
      removeNoSave()
      await downloadFile(document.documentElement.outerHTML, "text/html")
    }
    const documentChildren = leftRight({left: "document.children", right: "Dokumenten Inhalt"}, buttons)
    documentChildren.onclick = () => {
      children({node: document.documentElement, type: callback.type, info: ".children"})
    }
    const documentDesignMode = leftRight({left: "document.designMode"}, buttons)
    if (document.designMode === "on") {
      const green = div("bg-green color-dark br55 p8", documentDesignMode.right)
      green.textContent = "on"
    } else {
      const red = div("bg-red color-light br55 p8", documentDesignMode.right)
      red.textContent = "off"
    }
    documentDesignMode.onclick = () => {
      const currentMode = document.designMode
      document.designMode = currentMode === "on" ? "off" : "on"
      window.alert("Design Modus wurde erfolgreich umgeschaltet.")
      removeOverlays()
    }
    if (callback.type === "expert") {
      const button = leftRight({left: "document.write", right: "Aktuelles Dokument ersetzen"}, buttons)
      button.right.addEventListener("click", ev => {
        ev.stopPropagation()
        pop(overlay => {
          const content = overlay.content
          this.render("text/h3", "Aktuelles Dokument ersetzen", content)
          this.render("a", {className: "mlr34 link-theme sans-serif fs21", href: "https://developer.mozilla.org/en-US/docs/Web/API/Document/write", text: "Mozilla Developer Network write() Methode", target: "_blank"}, content)
        })
      })
      button.addEventListener("click", () => {
        pop(overlay => {
          const content = overlay.content
          const html = this.create("input/html", content)
          const button = textToAction("Dokument jetzt ersetzen", content)
          button.addEventListener("click", async () => {
            const confirm = window.confirm("Achtung! Diese Funktion wird dein aktuelles HTML Dokument mit deinem neuen HTML Import ersetzen. Der Inhalt deines aktuellen Dokuments wird unwideruflich gelöscht, sobald du deine Werteinheit abspeicherst.\n\nMöchtest du dein aktuelles HTML Dokument wirklich ersetzen?")
            if (confirm === true) {
              document.open()
              document.write(html.input.value)
              document.close()
              const toolboxGetter = await this.toolboxGetter()
              await toolboxGetter.addToolboxOnBody()
              removeOverlays()
            }
          })
        })
      })
    }
    const forEachBtn = leftRight({left: ".forEach", right: "Anwendungen für jedes HTML Element"}, buttons)
    forEachBtn.onclick = () => {
      pop(o2 => {
        const content = o2.content
        const removeStyle = leftRight({left: ".remove-style", right: "Style Attribut entfernen"}, content)
        removeStyle.onclick = () => {
          document.querySelectorAll("*").forEach(node => node.removeAttribute("style"))
          removeOverlays()
        }
        const removeClass = leftRight({left: ".remove-class", right: "Class Attribut entfernen"}, content)
        removeClass.onclick = () => {
          document.querySelectorAll("*").forEach(node => node.removeAttribute("class"))
          removeOverlays()
        }
      })
    }
    if (callback.type === "expert") {
      const funnelBtn = leftRight({left: ".funnel", right: "Meine Funnel"}, buttons)
      funnelBtn.onclick = () => this.fn("openFunnelOverlay")(document.body)
    }
    const imageButton = leftRight({left: ".image", right: "Für die Bildbearbeitung"}, buttons)
    imageButton.onclick = () => {
      pop(o2 => {
        const content = o2.content
        o2.addInfo(".image")
        if (callback.type === "expert") {
          const myImages = leftRight({left: ".images", right: "Meine Bilder"}, content)
          myImages.onclick = () => this.fn("openImagesOverlay")(document.body)
        }
        this.render("text/hr", "Bildbearbeitung", content)
        const image = this.create("input/file", content)
        image.input.setAttribute("accept", "image/*")
        image.input.oninput = () => verifyInputValue(image.input)
        const imageToDataUrl = this.render("text/link", "DataURL", content)
        imageToDataUrl.onclick = async () => {
          const imageFile = image.input.files[0]
          if (!imageFile) {
            this.add("style/not-valid", image.input)
            return
          }
          const reader = new FileReader()
          reader.onload = ev => {
            const dataUrl = ev.target.result
            img.src = dataUrl
            output.textContent = dataUrl
            output.onclick = () => {
              navigator?.clipboard?.writeText(dataUrl).then(() => {
                window.alert("Data URL wurde erfolgreich in die Zwischenablage gespeichert.")  
              })
              .catch(e => {
                window.alert("Fehler.. Bitte wiederholen.")
                console.error(e)
              })
            }
              
          }
          reader.readAsDataURL(imageFile)
        }
        const imagePreview = div("btn-theme color-theme m21 p8 break-word", content)
        const img = document.createElement("img")
        imagePreview.appendChild(img)
        const output = div("btn-theme color-theme m21 p8 break-word", content)
        this.add("hover-outline", output)
      })
    }
    {
      const button = leftRight({left: ".open", right: "Ein Platz für Integrationen"}, buttons)
      button.onclick = () => {
        pop(o2 => {
          o2.addInfo(".open")
          function createIntegration(type, integrations) {
            const button = leftRight({left: type}, o2.content)
            button.addEventListener("click", () => {
              integrations.sort((a, b) => a.name.localeCompare(b.name))
              pop(o3 => {
                o3.addInfo(`.open${type}`)
                const content = o3.content
                for (let i = 0; i < integrations.length; i++) {
                  const integration = integrations[i]
                  const button = leftRight({left: integration.name}, content)
                  button.right.remove()
                  button.onclick = () => window.open(integration.url, "_blank")
                }
              })
            })
          }
          const aiIntegrations = [
            {name: "ollama.com", url: "https://ollama.com/"},
            {name: "huggingface.co", url: "https://huggingface.co/"},
            {name: "nomic.ai", url: "https://www.nomic.ai/gpt4all"},
            {name: "blackbox.ai", url: "https://www.blackbox.ai/"},
            {name: 'duck.ai', url: 'https://duck.ai/'},
            {name: "chatgpt.com", url: "https://chatgpt.com"},
            {name: "deepai.org", url: "https://www.deepai.org/chat/text-generator"},
            {name: "futurepedia.io", url: "https://www.futurepedia.io"},
          ]
          createIntegration(".ai", aiIntegrations)
          const currencyIntegrations = [
            {name: "getmonero.org", url: "https://www.getmonero.org/"},
            {name: "minepi.com", url: "https://minepi.com/pnts"},
          ]
          createIntegration(".currency", currencyIntegrations)
          const infoIntegrations = [
            {name: "html-tags", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element"},
          ]
          createIntegration(".info", infoIntegrations)
          const mailIntegrations = [
            {name: "yopmail.com", url: "https://www.yopmail.com/"},
          ]
          createIntegration(".mail", mailIntegrations)

          const mathIntegrations = [
            {name: "wolframalpha.com", url: "https://www.wolframalpha.com/"},
            {name: "integral-calculator.com", url: "https://www.integral-calculator.com/"},
            {name: "gamma.sympy.org", url: "https://gamma.sympy.org/"},
            {name: "calculatorsoup.com", url: "https://www.calculatorsoup.com/"},
            {name: "mathway.com", url: "https://www.mathway.com/"},
          ]
          createIntegration(".math", mathIntegrations)

          const musicIntegrations = [
            {name: "web-audio-api", url: "https://webaudio.github.io/web-audio-api/"},
            {name: "hydrogen-music.org", url: "http://hydrogen-music.org/"},
            {name: "freesound.org", url: "https://freesound.org/"},
            {name: "tidalcycles.org", url: "https://tidalcycles.org/"},
          ]
          createIntegration(".music", musicIntegrations)

          const regexIntegrations = [
            { name: "debuggex.com", url: "https://www.debuggex.com/" },
            { name: "regex101.com", url: "https://regex101.com/" },
            { name: "regexr.com", url: "https://regexr.com/" },
            { name: "regextester.com", url: "https://www.regextester.com/" },
          ]
          createIntegration(".regex", regexIntegrations)

          const svgIntegrations = [
            {name: "svgviewer.dev", url: "https://www.svgviewer.dev/"},
            {name: "svg-path-editor", url: "https://yqnn.github.io/svg-path-editor/"},
          ]
          createIntegration(".svg", svgIntegrations)
          const translationIntegrations = [
            {name: "deepl.com", url: "https://www.deepl.com/de/translator"},
            {name: "libretranslate.com", url: "https://libretranslate.com/"},
          ]
          createIntegration(".translation", translationIntegrations)

          const uxIntegrations = [
            {name: "penpot.app", url: "https://penpot.app/"},
            {name: "mockflow.com", url: "https://www.mockflow.com/"},
            {name: "canva.com", url: "https://www.canva.com/"},
            {name: "draw.io", url: "https://app.diagrams.net/"},
            {name: "uizard.io", url: "https://uizard.io/"},
            {name: "excalidraw.com", url: "https://excalidraw.com/"},
            {name: "moqups.com", url: "https://moqups.com/"},
            {name: "uxpin.com", url: "https://www.uxpin.com/"},
            {name: "wireframe.cc", url: "https://wireframe.cc/"},
          ]
          createIntegration(".ux", uxIntegrations)
        })
      }
    }

    {
      const controls = div("controls fixed top right z3")
      const pauseBtn = textToLink("Pause", controls)
      const stopBtn = textToLink("Stop", controls)
      const resetBtn = textToLink("Reset Cam", controls)
      const timerDisplay = textToLink("Aufnahmezeit: 00:00", controls)
      const cameraDiv = div("fullscreen flex align center z2")
      let seconds = 0
      function playSound() {

        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(528, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.008, audioContext.currentTime + 1)
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 4)
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 5)
      }
      function updateControlsTimer() {

        seconds++
        timerDisplay.textContent = `Aufnahmezeit: ${Helper.convert("seconds/hh:mm:ss", seconds)}`
        if (seconds === 300) playSound()
      }
      function animateCameraDiv() {

        Helper.classes(cameraDiv, {remove: "fullscreen", add: "to-bottom-left"})
      }
      const button = leftRight({left: ".record", right: "Beginne eine Aufnahme"}, buttons)
      button.onclick = ev => {
        pop(o => {
          const content = o.content
          const screenWithMic = leftRight({left: ".screen-with-mic", right: "Bildschirmaufnahme mit Ton"}, content)
          screenWithMic.onclick = async () => {

            try {
              let mediaRecorder
              let chunks = []
              let timerInterval
              if (!document.querySelector("div.controls")) document.body.appendChild(controls)
              pauseBtn.addEventListener("click", () => {

                if (mediaRecorder.state === "recording") {
                  mediaRecorder.pause()
                  clearInterval(timerInterval)
                  Helper.add("style/green", pauseBtn)
                  return
                }
                if (mediaRecorder.state === "paused") {
                  mediaRecorder.resume()
                  timerInterval = setInterval(updateControlsTimer, 1000)
                  Helper.add("style/dark-light", pauseBtn)
                  return
                }
              })
              stopBtn.addEventListener('click', () => {

                mediaRecorder.stop()
              })
              removeOverlays()
              async function startRecording() {

                const screenStream = await navigator.mediaDevices.getDisplayMedia({video: true})
                const audioStream = await navigator.mediaDevices.getUserMedia({audio: true})
                const combinedStream = new MediaStream([
                  ...screenStream.getVideoTracks(),
                  ...audioStream.getAudioTracks(),
                ])
                mediaRecorder = new MediaRecorder(combinedStream)
                chunks = []
                mediaRecorder.ondataavailable = function (event) {
                  if (event.data.size > 0) {
                    chunks.push(event.data)
                  }
                }
                mediaRecorder.onstop = async () => {
                  Helper.create("div/loading", stopBtn)
                  clearInterval(timerInterval)
                  const blob = new Blob(chunks, { type: 'video/webm' })
                  const hashHex = await Helper.digest(blob)
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${hashHex}.webm`
                  document.body.appendChild(a)
                  a.click()
                  setTimeout(() => {
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    combinedStream.getTracks().forEach(track => track.stop())
                    controls.remove()
                    window.location.reload()
                  }, 100)
                }
                mediaRecorder.start()
                timerInterval = setInterval(updateControlsTimer, 1000)
                Helper.add("style/red", timerDisplay)
              }
              await startRecording()
            } catch (error) {
              window.alert("Fehler.. Bitte wiederholen.")
              console.error(error)
              controls.remove()
            }
          }
          const screenWithoutMic = leftRight({left: ".screen-without-mic", right: "Bildschirmaufnahme ohne Ton"}, content)
          screenWithoutMic.onclick = async () => {

            try {
              let mediaRecorder
              let chunks = []
              let timerInterval
              if (!document.querySelector("div.controls")) document.body.appendChild(controls)
              async function startRecording() {

                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
                mediaRecorder = new MediaRecorder(stream)
                chunks = []
                mediaRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                    chunks.push(event.data)
                  }
                }
                mediaRecorder.onstop = async () => {
                  Helper.create("div/loading", stopBtn)
                  clearInterval(timerInterval)
                  const blob = new Blob(chunks, { type: 'video/webm' })
                  const hashHex = await Helper.digest(blob)
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${hashHex}.webm`
                  document.body.appendChild(a)
                  a.click()
                  setTimeout(() => {
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    stream.getTracks().forEach(track => track.stop())
                    controls.remove()
                    window.location.reload()
                  }, 100)
                }
                mediaRecorder.start()
                timerInterval = setInterval(updateControlsTimer, 1000)
                Helper.add("style/red", timerDisplay)
              }
              pauseBtn.addEventListener('click', () => {

                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.pause()
                  clearInterval(timerInterval)
                  Helper.add("style/green", pauseBtn)
                  return
                }

                if (mediaRecorder.state === 'paused') {
                  mediaRecorder.resume()
                  timerInterval = setInterval(updateControlsTimer, 1000)
                  Helper.add("style/dark-light", pauseBtn)
                  return
                }

              })
              stopBtn.addEventListener('click', () => {

                mediaRecorder.stop()
              })
              removeOverlays()
              await startRecording()
            } catch (error) {
              window.alert("Fehler.. Bitte wiederholen.")
              console.error(error)
              controls.remove()
            }
          }
          const selfie = leftRight({left: ".selfie", right: "Frontkameraaufnahme mit Ton"}, content)
          selfie.onclick = async () => {

            try {
              let mediaRecorder
              let chunks = []
              let timerInterval
              if (!document.querySelector("div.controls")) document.body.appendChild(controls)
              pauseBtn.addEventListener("click", () => {

                if (mediaRecorder.state === "recording") {
                  mediaRecorder.pause()
                  clearInterval(timerInterval)
                  Helper.add("style/green", pauseBtn)
                  return
                }
                if (mediaRecorder.state === "paused") {
                  mediaRecorder.resume()
                  timerInterval = setInterval(updateControlsTimer, 1000)
                  Helper.add("style/dark-light", pauseBtn)
                  return
                }
              })
              stopBtn.addEventListener('click', () => {

                mediaRecorder.stop()
              })
              removeOverlays()
              async function startRecording() {

                const audioStream = await navigator.mediaDevices.getUserMedia({audio: true})
                const cameraStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: "user"}})
                const combinedStream = new MediaStream([
                  ...cameraStream.getVideoTracks(),
                  ...audioStream.getAudioTracks(),
                ])
                mediaRecorder = new MediaRecorder(combinedStream)
                chunks = []

                Helper.append(cameraDiv, document.body)
                const cameraVideo = document.createElement("video")
                cameraVideo.srcObject = cameraStream
                cameraVideo.autoplay = true
                Helper.append(cameraVideo, cameraDiv)

                mediaRecorder.ondataavailable = function (event) {

                  if (event.data.size > 0) {
                    chunks.push(event.data)
                  }
                }
                mediaRecorder.onstop = async () => {

                  Helper.create("div/loading", stopBtn)
                  clearInterval(timerInterval)
                  const blob = new Blob(chunks, { type: 'video/webm' })
                  const hashHex = await Helper.digest(blob)
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${hashHex}.webm`
                  document.body.appendChild(a)
                  a.click()
                  setTimeout(() => {
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    combinedStream.getTracks().forEach(track => track.stop())
                    controls.remove()
                    cameraDiv.remove()
                    window.location.reload()
                  }, 100)
                }
                mediaRecorder.start()
                timerInterval = setInterval(updateControlsTimer, 1000)
                Helper.add("style/red", timerDisplay)
              }
              await startRecording()
            } catch (error) {
              window.alert("Fehler.. Bitte wiederholen.")
              console.error(error)
              controls.remove()
            }
          }
          const screenWithZoom = leftRight({left: ".zoom-to-screen", right: "Bildschirmaufnahme mit Ton und Frontkamera"}, content)
          screenWithZoom.onclick = async () => {

            try {
              const prompt = window.prompt("Nach wieviel Sekunden soll dein Bildschirm angezeigt werden: (text/number)")
              if (!Helper.verifyIs("text/number", prompt)) return window.alert("Nummer ungültig.")
              const duration = Helper.convert("seconds/millis", prompt)
              let timeoutId
              let startTime
              let remainingTime = duration
              let mediaRecorder
              let chunks = []
              let timerInterval
              if (!document.querySelector("div.controls")) document.body.appendChild(controls)
              pauseBtn.addEventListener("click", () => {

                if (mediaRecorder.state === "recording") {
                  mediaRecorder.pause()
                  clearInterval(timerInterval)
                  clearTimeout(timeoutId)
                  remainingTime -= Date.now() - startTime
                  Helper.add("style/green", pauseBtn)
                  return
                }
                if (mediaRecorder.state === "paused") {
                  mediaRecorder.resume()
                  timerInterval = setInterval(updateControlsTimer, 1000)
                  startTime = Date.now()
                  timeoutId = setTimeout(animateCameraDiv, remainingTime)
                  Helper.add("style/dark-light", pauseBtn)
                  return
                }
              })
              stopBtn.addEventListener('click', () => {

                mediaRecorder.stop()
              })
              removeOverlays()
              async function startRecording() {

                const screenStream = await navigator.mediaDevices.getDisplayMedia({video: true})
                const audioStream = await navigator.mediaDevices.getUserMedia({audio: {
                  noiseSuppression: true,
                  echoCancellation: true
                }})
                let cameraStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: "user"}})
                const combinedStream = new MediaStream([
                  ...screenStream.getVideoTracks(),
                  ...audioStream.getAudioTracks(),
                ])
                mediaRecorder = new MediaRecorder(combinedStream)
                chunks = []

                Helper.append(cameraDiv, document.body)
                const cameraVideo = document.createElement("video")
                cameraVideo.srcObject = cameraStream
                cameraVideo.autoplay = true
                Helper.append(cameraVideo, cameraDiv)
                if (Number(prompt) === 0) {
                  Helper.classes(cameraDiv, {remove: "fullscreen", add: "bottom-left"})
                }

                startTime = Date.now()
                timeoutId = setTimeout(animateCameraDiv, duration)

                mediaRecorder.ondataavailable = function (event) {

                  if (event.data.size > 0) {
                    chunks.push(event.data)
                  }
                }
                mediaRecorder.onstop = async () => {

                  Helper.create("div/loading", stopBtn)
                  clearInterval(timerInterval)
                  const blob = new Blob(chunks, { type: 'video/webm' })
                  const hashHex = await Helper.digest(blob)
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${hashHex}.webm`
                  document.body.appendChild(a)
                  a.click()
                  setTimeout(() => {
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    combinedStream.getTracks().forEach(track => track.stop())
                    cameraStream.getTracks().forEach(track => track.stop())
                    controls.remove()
                    cameraDiv.remove()
                    window.location.reload()
                  }, 100)
                }
                mediaRecorder.start()
                timerInterval = setInterval(updateControlsTimer, 1000)
                Helper.add("style/red", timerDisplay)
                async function resetCamera() {
                  try {
                    if (cameraStream) {
                      cameraStream.getTracks().forEach(track => track.stop())
                    }
                    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
                    const cameraVideo = document.querySelector("video")
                    if (cameraVideo) {
                      cameraVideo.srcObject = cameraStream
                    }
                    console.log("Kamera zurückgesetzt")
                  } catch (error) {
                    console.error("Fehler beim Zurücksetzen der Kamera:", error)
                  }
                }
                resetBtn.addEventListener("click", resetCamera)
              }
              await startRecording()
            } catch (error) {
              window.alert("Fehler.. Bitte wiederholen.")
              console.error(error)
              controls.remove()
            }
          }
        })
      }
    }
    if (callback.type === "expert") {
      const button = leftRight({left: ".role-login", right: "Rollen Zugang anhängen"}, buttons)
      button.onclick = () => {
        pop(async o2 => {
          const content = o2.content
          textToH1("Rolle wählen", content)
          const loading = addLoading(content)
          const rolesDiv = div("", content)
          function updateRoles(roles, node) {
            loading.remove()
            Helper.reset("node", node)
            for (let i = 0; i < roles.length; i++) {
              const role = roles[i]
              const button = leftRight({left: role.text, right: `erstellt vor ${Helper.convert("millis/since", role.value)}`}, node)
              button.onclick = () => {
                const script = document.createElement("script")
                script.id = "role-login"
                script.type = "module"
                script.src = "/js/role-login.js"
                script.setAttribute("role-created", role.value)
                script.setAttribute("role-name", role.text)
                replaceInBody(script)
                window.alert("Zugang wurde erfolgreich angehängt.")
                removeOverlays()
              }
            }
          }
          const res = await post("/location-expert/get/platform/roles/text-value/")
          if (res.status === 200) {
            const roles = JSON.parse(res.response)
            updateRoles(roles, rolesDiv)
          } else {
            const res = await post("/location-writable/get/platform/roles/text-value/")
            if (res.status === 200) {
              const roles = JSON.parse(res.response)
              updateRoles(roles, rolesDiv)
            } else {
              this.render("text/note", "Keine Rollen gefunden.", rolesDiv)
            }
          }
        })
      }
    }
    if (callback.type === "expert") {
      const scriptButton = leftRight({left: ".script", right: "Lade ein Skript mit einer Id"}, buttons)
      scriptButton.onclick = async () => {
        pop(o2 => {
          addSaveButton(callback.type, o2)
          const content = o2.content
          const prompt = leftRight({left: ".prompt", right: "Id eingeben"}, content)
          prompt.onclick = ev => {
            const prompt = window.prompt("Gebe eine Skript Id ein: (text/tag)")
            if (!textIsEmpty(prompt)) {
              const id = textToTag(prompt)
              const script = idToScript(id)
              replaceInBody(script)
              window.alert("Skript erfolgreich angehängt.")
            } else {
              window.alert("Fehler.. Bitte wiederholen.")
            }
          }
          textToHr("Verfügbare Skripte", content)
          const scriptDiv = div("", content)
          post("/expert/get/js/paths/").then(res => {
            try {
              const paths = JSON.parse(res.response)
              console.log(paths)
              paths.forEach(path => {
                const id = pathToId(path) 
                if (textIsEmpty(id)) return
                const button = leftRight({left: `.${id}`, right: "Skript wählen"}, scriptDiv)
                button.onclick = ev => {
                  if (path === "chat.js") {
                    const chatId = window.prompt("Gebe die Chat Id ein:")
                    if (textIsEmpty(chatId)) return
                    const script = document.createElement("script")
                    script.id = id
                    script.src = `/js/${id}.js`
                    script.type = "module"
                    script.setAttribute("chatId", chatId)
                    document.body.appendChild(script)
                    return
                  }
                  if (path === "feed.js") {
                    pop(o2 => {
                      const content = o2.content
                      o2.addInfo(".feed")
                      const feedScript = document.getElementById("feed")
                      let feedFunnel
                      let feedAlgo
                      if (feedScript) {
                        feedFunnel = feedScript.getAttribute("funnel")
                        feedAlgo = feedScript.getAttribute("algo")
                      }
                      const title = text(content)
                      title.input.placeholder = "Titel"
                      title.input.maxLength = "55"
                      title.input.setAttribute("required", "true")
                      const h1 = document.querySelector("h1")
                      if (h1) title.input.value = h1.textContent
                      const description = textarea(content)
                      description.input.placeholder = "Beschreibung"
                      description.input.maxLength = "144"
                      description.input.setAttribute("required", "true")
                      const h2 = document.querySelector("h2")
                      if (h2) description.input.value = h2.textContent
                      const funnelSelect = select(content)
                      funnelSelect.input.setAttribute("required", "true")
                      funnelSelect.addOption("Wähle einen Funnel")
                      post("/jwt/get/funnel/").then(res => {
                        if (res.status === 200) {
                          const funnel = JSON.parse(res.response)
                          funnel.forEach(it => funnelSelect.addOption(it.id, it.created))
                          if (feedFunnel) {
                            funnelSelect.selectByValue([feedFunnel])
                            verifyInputValue(funnelSelect.input)
                          }
                        }
                      })
                      const algoSelect = select(content)
                      algoSelect.input.setAttribute("required", "true")
                      algoSelect.addOption("Wähle einen Algorithmus")
                      algoSelect.addOption("shuffle", "shuffle")
                      if (feedAlgo) {
                        algoSelect.selectByText([feedAlgo])
                      }
                      verifyInputs(content)
                      const submit = textToAction("Feed jetzt erstellen", content)
                      submit.onclick = async () => {
                        await verifyFunnel(content)
                        const feedTitle = title.input.value
                        const feedDescription = description.input.value
                        const feedFunnel = funnelSelect.input.value
                        const feedAlgo = algoSelect.input.value
                        if (!h1) textToH1(feedTitle, document.body)
                        textToTitle(feedTitle, document.head)
                        if (!h2) textToH2(feedDescription, document.body)
                        const script = document.createElement("script")
                        script.id = "feed"
                        script.src = `/js/${script.id}.js`
                        script.type = "module"
                        script.setAttribute("funnel", feedFunnel)
                        script.setAttribute("algo", feedAlgo)
                        replaceInBody(script)
                        removeOverlays()
                      }
                    })
                    return
                  }
                  if (path === "submit-to-ids.js") {
                    pop(o3 => {
                      const content = o3.content
                      const selectorField = Helper.create("input/text", content)
                      selectorField.input.placeholder = "Selector zu deinem Funnel"
                      selectorField.input.setAttribute("required", "true")
                      verifyInputValue(selectorField.input)
                      const contactsSelect = Helper.create("input/contacts", content)
                      addNotValidSign(contactsSelect.input)
                      const submit = div("action", content)
                      submit.textContent = "Skript jetzt anhängen"
                      submit.onclick = async () => {
                        await verifyInputValue(selectorField.input)
                        const selector = selectorField.input.value
                        const ids = contactsSelect.selectedIds()
                        if (ids.length <= 0) {
                          addNotValidSign(contactsSelect.input)
                          return
                        }
                        const script = document.createElement("script")
                        script.id = "submit-to-ids"
                        script.src = `/js/${script.id}.js`
                        script.type = "module"
                        script.setAttribute("funnel", selector)
                        script.setAttribute("ids", ids.join(","))
                        replaceInBody(script)
                        window.alert("Skript wurde erfolgreich angehängt.")
                        removeOverlays()
                      }
                    })
                    return
                  }
                  window.alert("Skript erfolgreich angehängt.")
                  const script = idToScript(id)
                  replaceInBody(script)
                }
              })
            } catch (error) {
              console.log(error)
              textToNote("Keine Skripte gefunden", scriptDiv)
            }
          })
        })
      }
    }
    {
      const button = leftRight({left: ".share", right: "Sende diese URL an dein Netzwerk"}, buttons)
      button.onclick = async () => {
        try {
          await navigator.share({
            url: window.location.href
          })
          console.log("URL share successfully");
        } catch (err) {
          console.error(err)
        }
      }
    }

    {
      const button = leftRight({left: ".start", right: "Schnell zum Start zurück"}, buttons)
      button.addEventListener("click", async () => window.open("/", "_blank"))
    }
  })
}
function children(callback = {}) {
  pop(overlay => {
    addSaveButton(callback.type, overlay)
    if (callback.info) overlay.addInfo(callback.info)
    const childrenContainer = overlay.content
    function addScript(id) {
      const script = idToScript(id)
      replaceInBody(script)
      window.alert("Skript erfolgreich angehängt.")
      removeOverlays()
    }
    childrenLoop: for (let i = 0; i < callback.node.children.length; i++) {
      let child = callback.node.children[i]
      if (child.id === "toolbox") continue
      if (child.id === "toolbox-getter") continue
      if (child.classList.contains("overlay")) continue
      for (let i = 0; i < child.classList.length; i++) {
        if (child.classList[i].startsWith("overlay")) continue childrenLoop
      }
      const childrenButton = leftRight({left: child.tagName, right: "Element bearbeiten"}, childrenContainer)
      function updateNodeAlias(node) {
        childrenButton.left.textContent = ""
        childrenButton.left.append(Helper.convert("element/alias", node))
      }
      childrenButton.onclick = () => {
        pop(async o1 => {
          addSaveButton(callback.type, o1)
          o1.addInfo(`<${nodeToSelector(child)}`)
          const buttons = o1.content
          if (["BODY", "DIV", "P"].includes(child.tagName)) {
            const aBtn = leftRight({left: ".a", right: "Anker anhängen"}, buttons)
            aBtn.onclick = () => {
              pop(o2 => {
                const content = o2.content
                const href = text(content)
                href.input.placeholder = "href"
                href.input.setAttribute("required", "true")
                const textContent = text(content)
                textContent.input.placeholder = "textContent"
                const target = select(content)
                target.addOption("-- target")
                const options = ["_blank", "_self", "_parent", "_top"]
                target.append(options)
                const tooltip = text(content)
                tooltip.input.placeholder = "tooltip"
                const download = text(content)
                download.input.placeholder = "download"
                verifyInputs(content)
                const submit = textToAction("Anker jetzt anhängen", content)
                submit.onclick = async () => {
                  await verifyFunnel(content)
                  const a = document.createElement("a")
                  a.className = "break-word sans-serif"
                  const hrefValue = href.input.value
                  a.href = hrefValue
                  const targetValue = target.input.value
                  if (!textIsEmpty(targetValue)) {
                    a.target = targetValue
                  }
                  const tooltipValue = tooltip.input.value
                  if (!textIsEmpty(tooltipValue)) {
                    a.title = tooltipValue
                  }
                  const downloadValue = download.input.value
                  if (!textIsEmpty(downloadValue)) {
                    a.download = downloadValue
                  }
                  const textValue = textContent.input.value
                  if (!textIsEmpty(textValue)) {
                    a.textContent = textValue
                  } else {
                    a.textContent = hrefValue
                  }
                  child.appendChild(a)
                  removeOverlays()
                }
              })
            }
          }
          const appendChildBtn = leftRight({left: ".appendChild", right: "HTML Element anhängen"}, buttons)
          appendChildBtn.onclick = () => {
            const prompt = window.prompt("Gebe ein HTML Element Tag ein:")
            try {
              const element = document.createElement(prompt)
              if (!element) throw new Error("HTML Element Tag ist ungültig.")
              child.appendChild(element)
              removeOverlays()
            } catch (e) {
              window.alert(e)
            }
          }
          if (child.tagName !== "SCRIPT") {
            const childrenBtn = leftRight({left: ".children", right: "Element Inhalt"}, buttons)
            childrenBtn.onclick = async () => {
              const realLength = Array.from(child.children).filter(it => !it.classList.contains("no-save") && !it.classList.contains("overlay") && it.id !== "toolbox-getter").length
              if (realLength > 0) {
                children({node: child, type: callback.type, info: `${nodeToSelector(child)}`})
              } else alert("Das HTML Element ist leer.")
            }
          }
          const classBtn = leftRight({left: ".class", right: "Klassen definieren"}, buttons)
          classBtn.onclick = () => {
            pop(o2 => {
              addSaveButton(callback.type, o2)
              o2.addInfo(`<${nodeToSelector(child)}`)
              const content = o2.content
              const classField = textarea(content)
              classField.input.placeholder = "mehrere klassen werden mit einem leerzeichen getrennt"
              classField.input.style.fontFamily = "monospace"
              classField.input.style.height = "34vh"
              if (child.hasAttribute("class")) {
                classField.input.value = child.getAttribute("class")
              }
              verifyInputValue(classField.input)
              classField.input.oninput = () => {
                const value = classField.input.value
                if (textIsEmpty(value)) {
                  child.removeAttribute("class")
                } else {
                  child.setAttribute("class", value)
                }
                o2.info.textContent = `<${nodeToSelector(child)}`
                updateNodeAlias(child)
              }
            })
          }
          if (!["BODY"].includes(child.tagName)) {
            const copyBtn = leftRight({left: ".copy", right: "Element kopieren"}, buttons)
            copyBtn.onclick = async () => {
              await this.convert("text/clipboard", child.outerHTML)
              window.alert(`${child.tagName} wurde erfolgreich in deine Zwischenablage kopiert.`)
            }
          }
          {
            if (!["SCRIPT", "HEAD"].includes(child.tagName)) {
              const darkLightBtn = leftRight({left: ".dark-light", right: "Dark Light Modus umschalten"}, buttons)
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".dark-light"
              button.right.textContent = "Dark Light Modus umschalten"
              button.onclick = () => {

                this.convert("node/dark-light-toggle", child)
                window.alert("Dark Light Modus erfolgreich umgeschaltet.")
                removeOverlays()
              }
            }
            if (child.tagName === "DIV") {
              if (["closed", "expert"].includes(callback.type)) {
                const button = leftRight({left: "", right: ""}, buttons)
                button.left.textContent = ".div-creator"
                button.right.textContent = "Bearbeite dein Element schnell und einfach"
                button.onclick = () => {
                  pop(async overlay => {
                    const saveBtn = addSaveButton(callback.type, overlay)
                    if (saveBtn) {
                      saveBtn.onclick = async () => {
                        this.remove("contenteditable", clone)
                        this.remove("selected-node", clone)
                        child.replaceWith(clone)
                        this.add("register-html")
                      }
                    }

                    const content = overlay.content
                    content.className = "vh100p"
                    content.style.touchAction = "manipulation"

                    const preview = document.createElement("div")
                    preview.style.height = `${window.innerHeight * 0.4}px`
                    preview.style.overflow = "auto"
                    content.append(preview)

                    const backgroundColor = child.parentElement.style.backgroundColor
                    if (!backgroundColor || backgroundColor === "transparent") {
                      preview.style.backgroundColor = "white"
                    } else {
                      preview.style.backgroundColor = backgroundColor
                    }

                    let clone = child.cloneNode(true)
                    clone.setAttribute("contenteditable", "true")
                    preview.append(clone)

                    let selectedNode = clone

                    preview.addEventListener("keydown", ev => {
                      if (ev.metaKey && ev.key === 'c') {
                        ev.preventDefault()
                        if (selectedNode) {
                          this.convert("text/clipboard", selectedNode.outerHTML).then(() => window.alert("Dein HTML Element wurde erfolgreich in die Zwischenablage gespeichert."))
                        }
                      }
                    })

                    preview.addEventListener("keydown", ev => {
                      if (ev.metaKey && ev.key === 'v') {
                        ev.preventDefault()
                        if (selectedNode) {
                          this.convert("clipboard/text").then(text => {
                            const node = this.convert("text/first-child", text)
                            selectedNode.append(node)
                          })
                        }
                      }
                    })

                    let rememberSelectedNodes = []
                    preview.addEventListener("keydown", ev => {
                      if (ev.metaKey && ev.key === 'Backspace') {
                        ev.preventDefault()
                        if (selectedNode) {
                          rememberSelectedNodes.push({ node: selectedNode, parent: selectedNode.parentElement, index: Array.from(selectedNode.parentElement.children).indexOf(selectedNode)})
                          selectedNode.remove()
                        }
                      }
                    })

                    preview.addEventListener("keydown", ev => {
                      if (ev.metaKey && ev.key === 'z') {
                        ev.preventDefault()
                        if (selectedNode) {
                          if (rememberSelectedNodes.length > 0) {
                            const { node, parent, index } = rememberSelectedNodes.pop()
                            const children = Array.from(parent.children)
                            if (index >= 0 && index < children.length) {
                              parent.insertBefore(node, children[index])
                            } else {
                              parent.appendChild(node)
                            }
                          }

                        }
                      }
                    })

                    selectedNode.onclick = async (ev) => {
                      ev.preventDefault()
                      ev.stopPropagation()
                      await this.remove("element/selected-node", preview)
                      selectedNode = clone
                      this.add("element/selected-node", selectedNode)
                    }

                    preview.onclick = async (ev) => {
                      ev.preventDefault()
                      ev.stopPropagation()
                      await this.remove("element/selected-node", preview)
                      selectedNode = clone
                    }

                    for (let i = 0; i < clone.children.length; i++) {
                      const cloneChild = clone.children[i]

                      this.add("event/dbltouch", {node: cloneChild, callback: async ev => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        await this.remove("element/selected-node", preview)
                        selectedNode = ev.target.parentElement
                        this.add("element/selected-node", selectedNode)
                      }})

                      cloneChild.ondblclick = async (ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        await this.remove("element/selected-node", preview)
                        selectedNode = ev.target.parentElement
                        this.add("element/selected-node", selectedNode)
                      }

                      cloneChild.onclick = async (ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()

                        if (ev.target.hasAttribute("selected-node")) {
                          await this.remove("element/selected-node", preview)
                          selectedNode = clone
                          this.add("element/selected-node", selectedNode)
                        } else {
                          await this.remove("element/selected-node", preview)
                          selectedNode = ev.target
                          this.add("element/selected-node", selectedNode)
                        }

                      }

                    }

                    const observer = new MutationObserver((mutationsList) => {
                      mutationsList.forEach((mutation) => {
                        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {

                          mutation.addedNodes.forEach(async (node) => {

                            if (node.nodeType === Node.ELEMENT_NODE) {


                              this.add("event/dbltouch", {node: node, callback: async ev => {
                                ev.preventDefault()
                                ev.stopPropagation()
                                await this.remove("element/selected-node", preview)
                                selectedNode = ev.target.parentElement
                                this.add("element/selected-node", selectedNode)
                              }})

                              node.ondblclick = async (ev) => {
                                ev.preventDefault()
                                ev.stopPropagation()
                                await this.remove("element/selected-node", preview)
                                selectedNode = ev.target.parentElement
                                this.add("element/selected-node", selectedNode)
                              }

                              node.onclick = async (ev) => {
                                ev.preventDefault()
                                ev.stopPropagation()

                                if (ev.target.hasAttribute("selected-node")) {
                                  await this.remove("element/selected-node", preview)
                                  selectedNode = clone
                                  this.add("element/selected-node", selectedNode)
                                } else {
                                  await this.remove("element/selected-node", preview)
                                  selectedNode = ev.target
                                  this.add("element/selected-node", selectedNode)
                                }

                              }

                            }
                          })
                        }
                      })
                    })
                    observer.observe(selectedNode, { childList: true, subtree: true })

                    const buttons = this.fn("creator-buttons", {parent: content, type: callback.type})

                    buttons.convertTextContentToH1Button.onclick = () => {
                      const h1 = buttons.convertTextContentToH1(selectedNode)
                      selectedNode = h1
                    }
                    buttons.convertTextContentToH2Button.onclick = () => {
                      const h2 = buttons.convertTextContentToH2(selectedNode)
                      selectedNode = h2
                    }
                    buttons.convertTextContentToH3Button.onclick = () => {
                      const h3 = buttons.convertTextContentToH3(selectedNode)
                      selectedNode = h3
                    }

                    buttons.videoSeriesButton.onclick = () => buttons.createVideoSeriesBox(selectedNode)
                    buttons.openVideosOverlayButton.onclick = () => buttons.openVideosOverlay(selectedNode, callback.type)
                    buttons.openAudiosOverlayButton.onclick = () => buttons.openAudiosOverlay(selectedNode, callback.type)
                    buttons.openPdfOverlayButton.onclick = () => buttons.openPdfOverlay(selectedNode, callback.type)
                    buttons.openFunnelOverlayButton.onclick = () => this.fn("openFunnelOverlay")(selectedNode)
                    buttons.styleBackgroundImageButton.onclick = () => buttons.styleBackgroundImage(selectedNode)
                    buttons.appendImageButton.onclick = () => buttons.appendImage(selectedNode)
                    buttons.trimLinesButton.onclick = () => buttons.trimLines(selectedNode)
                    buttons.openUrlButton.onclick = () => buttons.openUrl(selectedNode)
                    buttons.convertToInlineCiteButton.onclick = () => buttons.convertToInlineCite(selectedNode)
                    buttons.convertToFullCiteButton.onclick = () => buttons.convertToFullCite(selectedNode)
                    buttons.removeCiteMarksButton.onclick = () => buttons.removeCiteMarks(selectedNode)
                    buttons.myValueUnitsButton.onclick = () => buttons.createMyValueUnitsBox(selectedNode)
                    buttons.profileSurveysButton.onclick = () => buttons.createProfileSurveysBox(selectedNode)
                    buttons.imageTextAndActionButton.onclick = () => buttons.createImageTextAndActionBox(selectedNode)
                    buttons.backgroundImageWithTitlesButton.onclick = () => buttons.createBackgroundImageWithTitles(selectedNode)
                    buttons.duckDuckGoButton.onclick = () => buttons.convertTextContentToDuckDuckGoLink(selectedNode)
                    buttons.pointerButton.onclick = () => buttons.pointer(selectedNode)
                    buttons.sourcesButton.onclick = () => buttons.openSourcesOverlay(selectedNode, callback.type)
                    buttons.templatesButton.onclick = () => buttons.openTemplatesOverlay(selectedNode)
                    if (callback.type === "expert") {
                      buttons.openScriptsOverlayButton.onclick = () => buttons.openScriptsOverlay(selectedNode, callback.type)
                    }
                    buttons.openImagesOverlayButton.onclick = () => buttons.openImagesOverlay(selectedNode)
                    buttons.createFlexButton.onclick = () => buttons.createFlexWidthWithPrompt(selectedNode)
                    buttons.createGridButton.onclick = () => buttons.createGridMatrixWithPrompt(selectedNode)
                    buttons.appendDivButton.onclick = () => buttons.appendDiv(selectedNode)
                    buttons.rowContainerButton.onclick = () => buttons.createFlexRow(selectedNode)
                    buttons.columnContainerButton.onclick = () => buttons.createFlexColumn(selectedNode)
                    buttons.imageTextButton.onclick = () => buttons.createImageText(selectedNode)
                    buttons.keyValueButton.onclick = () => buttons.createKeyValue(selectedNode)
                    buttons.actionBtnButton.onclick = () => buttons.createActionButton(selectedNode)
                    buttons.horizontalHrButton.onclick = () => buttons.createHr(selectedNode)
                    buttons.simpleHeaderButton.onclick = () => buttons.createLeftImageHeader(selectedNode)
                    buttons.h1Button.onclick = () => buttons.createH1withPrompt(selectedNode)
                    buttons.h2Button.onclick = () => buttons.createH2withPrompt(selectedNode)
                    buttons.h3Button.onclick = () => buttons.createH3withPrompt(selectedNode)
                    buttons.pButton.onclick = () => buttons.createPwithPrompt(selectedNode)
                    buttons.imageButton.onclick = () => buttons.createImagePlaceholder(selectedNode)
                    buttons.tableHeaderButton.onclick = () => buttons.createTableWithMatrixPrompt(selectedNode)
                    buttons.pdfLinkButton.onclick = async () => await buttons.createPdfLinkWithPrompt(selectedNode)
                    buttons.wrapLinkButton.onclick = async () => {
                      const link = await buttons.wrapAnchorWithPrompt(selectedNode)
                      clone = link
                    }
                    buttons.aLinkButton.onclick = () => buttons.createAnchorWithPrompt(selectedNode)
                    buttons.locationAssignButton.onclick = () => buttons.addLocationAssign(selectedNode)
                    buttons.windowOpenBlankButton.onclick = () => buttons.addWindowOpenBlank(selectedNode)
                    buttons.spanButton.onclick = () => buttons.createSpanWithTextContent(selectedNode)
                    buttons.changeSiButton.onclick = () => buttons.createSpanWithSiPrompt(selectedNode)
                    buttons.addSpaceButton.onclick = () => buttons.createSpaceWithHeightPrompt(selectedNode)
                    buttons.arrowRightButton.onclick = () => buttons.createArrowRightWithColorPrompt(selectedNode)
                    buttons.divScrollableButton.onclick = () => buttons.createScrollableY(selectedNode)
                    buttons.packDivButton.onclick = async () => {
                      const div = await buttons.createDivPackOuter(selectedNode)
                      clone = div
                    }
                    buttons.textInputButton.onclick = () => buttons.createTextInput(selectedNode)
                    buttons.numberInputButton.onclick = () => buttons.createTelInput(selectedNode)
                    buttons.checkboxInputButton.onclick = () => buttons.createCheckboxInput(selectedNode)
                    buttons.passwordInputButton.onclick = () => buttons.createPasswordInput(selectedNode)
                    buttons.selectInputButton.onclick = () => buttons.createSelectInput(selectedNode)
                    buttons.createDateInputButton.onclick = () => buttons.createDateInput(selectedNode)
                    buttons.growWidthButton.onclick = () => buttons.toggleStyle({key: "width", value: "100%", node: selectedNode})
                    buttons.maxWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "maxWidth", node: selectedNode, message: "Gebe die maximale Breite deines Elements ein: (z.B., 900px)"})
                    buttons.minWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "minWidth", node: selectedNode, message: "Gebe die minimale Breite deines Elements ein: (z.B., 300px)"})
                    buttons.exactWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "width", node: selectedNode, message: "Gebe die exakte Breite deines Elements ein: (z.B., 350px)"})
                    buttons.increaseWidthButton.onclick = () => buttons.incrementStyle({key: "width", node: selectedNode, delta: 1})
                    buttons.decreaseWidthButton.onclick = () => buttons.decrementStyle({key: "width", node: selectedNode, delta: 1})
                    buttons.growHeightButton.onclick = () => buttons.toggleStyle({key: "height", value: "100%", node: selectedNode})
                    buttons.maxHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "maxHeight", node: selectedNode, message: "Gebe die maximale Höhe deines Elements ein: (z.B., 89vh)"})
                    buttons.minHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "minHeight", node: selectedNode, message: "Gebe die minimale Höhe deines Elements ein: (z.B., 21px)"})
                    buttons.exactHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "height", node: selectedNode, message: "Gebe die exakte Höhe deines Elements ein: (z.B., 21vh)"})
                    buttons.increaseHeightButton.onclick = () => buttons.incrementStyle({key: "height", node: selectedNode, delta: 1})
                    buttons.decreaseHeightButton.onclick = () => buttons.decrementStyle({key: "height", node: selectedNode, delta: 1})
                    buttons.exactDisplayButton.onclick = () => buttons.setStyleWithPrompt({key: "display", node: selectedNode, message: "Gebe den exakten Display Wert ein: (z.B., flex)"})
                    buttons.displayBlockButton.onclick = () => buttons.toggleStyle({key: "display", value: "block", node: selectedNode})
                    buttons.displayInlineButton.onclick = () => buttons.toggleStyle({key: "display", value: "inline", node: selectedNode})
                    buttons.toggleDisplayGridButton.onclick = () => buttons.toggleStyle({key: "display", value: "grid", node: selectedNode})
                    buttons.toggleDisplayFlexButton.onclick = () => buttons.toggleStyle({key: "display", value: "flex", node: selectedNode})
                    buttons.toggleDisplayTableButton.onclick = () => buttons.toggleStyle({key: "display", value: "table", node: selectedNode})
                    buttons.gridMobileButton.onclick = () => buttons.toggleStyles({styles: {display: "grid", gridTemplateColumns: "1fr", gridGap: "21px"}, node: selectedNode})
                    buttons.gridFullDisplayButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
                    buttons.gridTwoColumnsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr 1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
                    buttons.gridThreeColumnsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
                    buttons.gridFixedButton.onclick = () => buttons.fixedGridPrompt({node: selectedNode})
                    buttons.gridListRowsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "89px 1fr", gridTemplateRows: `repeat(auto-fit, 55px)`, gridGap: "21px"}, childrenStyle: {height: "55px"}, node: selectedNode})
                    buttons.gridSpanColumnButton.onclick = () => buttons.spanColumnWithPrompt(selectedNode)
                    buttons.gridSpanRowButton.onclick = () => buttons.spanRowWithPrompt(selectedNode)
                    buttons.exactGridGapButton.onclick = () => buttons.setStyleWithPrompt({key: "gap", node: selectedNode, message: "Gebe den exakten Abstand zwischen deinen Grid Elementen ein: (z.B., 13px)"})
                    buttons.gridAddColumnButton.onclick = () => buttons.addGridColumn(selectedNode)
                    buttons.gridRemoveColumnButton.onclick = () => buttons.removeGridColumn(selectedNode)
                    buttons.gridAddRowButton.onclick = () => buttons.addGridRow(selectedNode)
                    buttons.gridRemoveRowButton.onclick = () => buttons.removeGridRow(selectedNode)
                    buttons.alignColumnButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexDirection: "column", flexWrap: null}, node: selectedNode})
                    buttons.alignLeftButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "flex-start"}, node: selectedNode})
                    buttons.alignCenterButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "center"}, node: selectedNode})
                    buttons.alignRightButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "flex-end"}, node: selectedNode})
                    buttons.alignRowButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexDirection: null, flexWrap: "wrap"}, node: selectedNode})
                    buttons.alignTopButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "flex-start"}, node: selectedNode})
                    buttons.alignVerticalButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "center"}, node: selectedNode})
                    buttons.alignBottomButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "flex-end"}, node: selectedNode})
                    buttons.flexButton.onclick = () => buttons.setStyleWithPrompt({key: "flex", node: selectedNode, message: "Gebe die Flex Matrix für dein Element ein: (z.B., 1 1 55px)"})
                    buttons.spaceBetweenButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap", justifyContent: "space-between"}, node: selectedNode})
                    buttons.spaceAroundButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap", justifyContent: "space-around"}, node: selectedNode})
                    buttons.toggleWrapButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap"}, node: selectedNode})
                    const onLayerClick = async layer => {
                      await this.remove("element/selected-node", preview)
                      selectedNode = layer
                      this.add("selected/node", layer)
                    }
                    buttons.layerButton.onclick = () => buttons.openLayerOverlay(onLayerClick, selectedNode)
                    buttons.positiveLayerButton.onclick = () => buttons.addLayerAbove(selectedNode)
                    buttons.negativeLayerButton.onclick = () => buttons.addLayerBelow(selectedNode)
                    buttons.exactLayerButton.onclick = async () => buttons.addLayerPrompt(selectedNode)
                    buttons.removeLayerButton.onclick = () => buttons.removeAllLayer(selectedNode)
                    buttons.positionAbsoluteButton.onclick = () => buttons.toggleStyle({key: "position", value: "absolute", node: selectedNode})
                    buttons.positionTopButton.onclick = () => buttons.setStyleWithPrompt({key: "top", node: selectedNode, message: "Geben den exakten Abstand nach oben ein: (z.B., 300px)"})
                    buttons.positionRightButton.onclick = () => buttons.setStyleWithPrompt({key: "right", node: selectedNode, message: "Geben den exakten Abstand nach rechts ein: (z.B., 300px)"})
                    buttons.positionBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "bottom", node: selectedNode, message: "Geben den exakten Abstand nach unten ein: (z.B., 300px)"})
                    buttons.positionLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "left", node: selectedNode, message: "Geben den exakten Abstand nach links ein: (z.B., 300px)"})
                    buttons.transformTranslateButton.onclick = () => buttons.translateWithPrompt(selectedNode)
                    buttons.transformTranslateXButton.onclick = () => buttons.translateXWithPrompt(selectedNode)
                    buttons.transformTranslateYButton.onclick = () => buttons.translateYWithPrompt(selectedNode)
                    buttons.zIndexButton.onclick = () => buttons.setStyleWithPrompt({key: "zIndex", node: selectedNode, message: "Gebe deinen Z-Index ein: (z.B., -1)"})
                    buttons.scaleButton.onclick = () => buttons.scaleWithPrompt(selectedNode)
                    buttons.rotateRightButton.onclick = () => buttons.rotateNode({degree: 90, node: selectedNode})
                    buttons.exactRotateRightButton.onclick = () => buttons.rotateNodeRightWithPrompt(selectedNode)
                    buttons.rotateLeftButton.onclick = () => buttons.rotateNode({degree: -90, node: selectedNode})
                    buttons.exactRotateLeftButton.onclick = () => buttons.rotateNodeLeftWithPrompt(selectedNode)
                    buttons.whiteSpaceNoWrapButton.onclick = () => buttons.toggleStyle({key: "whiteSpace", value: "nowrap", node: selectedNode})
                    buttons.fontFamilyButton.onclick = () => buttons.toggleStyle({key: "fontFamily", value: "sans-serif", node: selectedNode})
                    buttons.fontWeightNormalButton.onclick = () => buttons.toggleStyle({key: "fontWeight", value: "normal", node: selectedNode})
                    buttons.fontWeightButton.onclick = () => buttons.toggleStyle({key: "fontWeight", value: "bold", node: selectedNode})
                    buttons.fontStyleButton.onclick = () => buttons.toggleStyle({key: "fontStyle", value: "italic", node: selectedNode})
                    buttons.textDecorationButton.onclick = () => buttons.toggleStyle({key: "textDecoration", value: "underline", node: selectedNode})
                    buttons.fontSizeButton.onclick = () => buttons.setStyleWithPrompt({key: "fontSize", node: selectedNode, message: "Gebe deine Schriftgröße ein: (z.B., 34px)"})
                    buttons.fontColorButton.onclick = () => buttons.setStyleWithPrompt({key: "color", node: selectedNode, message: "Gebe deine Schriftfarbe ein: (z.B., (#888, grey, rgb(88, 88, 88), rgba(0, 0, 0, 0.5)))"})
                    buttons.fontColorButton.onclick = () => buttons.setStyleWithPrompt({key: "backgroundColor", node: selectedNode, message: "Gebe deine Hintergrundfarbe ein: (z.B., (#888, grey, rgb(88, 88, 88), rgba(0, 0, 0, 0.5)))"})
                    buttons.unorderedListButton.onclick = () => buttons.appendUnorderedListItem(selectedNode)
                    buttons.orderedListButton.onclick = () => buttons.appendOrderedListItem(selectedNode)
                    buttons.lineHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "lineHeight", node: selectedNode, message: "Gebe die exakte Linien Höhe ein: (z.B., 1.8)"})
                    buttons.overflowYButton.onclick = () => buttons.toggleStyle({key: "overflowY", value: "auto", node: selectedNode})
                    buttons.overflowXButton.onclick = () => buttons.toggleStyle({key: "overflowX", value: "auto", node: selectedNode})
                    buttons.toggleDisplayNoneButton.onclick = () => buttons.toggleStyle({key: "display", value: "none", node: selectedNode})
                    buttons.toggleVisibilityHiddenButton.onclick = () => buttons.toggleStyle({key: "visibility", value: "hidden", node: selectedNode})
                    buttons.exactOpacityButton.onclick = () => buttons.addOpacityWithPrompt(selectedNode)
                    buttons.toggleMarginButton.onclick = () => buttons.toggleStyle({key: "margin", value: "21px 34px", node: selectedNode})
                    buttons.toggleMarginTopButton.onclick = () => buttons.toggleStyle({key: "marginTop", value: "21px", node: selectedNode})
                    buttons.toggleMarginRightButton.onclick = () => buttons.toggleStyle({key: "marginRight", value: "34px", node: selectedNode})
                    buttons.toggleMarginTopButton.onclick = () => buttons.toggleStyle({key: "marginBottom", value: "21px", node: selectedNode})
                    buttons.toggleMarginLeftButton.onclick = () => buttons.toggleStyle({key: "marginLeft", value: "34px", node: selectedNode})
                    buttons.exactMarginButton.onclick = () => buttons.setStyleWithPrompt({key: "margin", node: selectedNode, message: "Gebe den exakten Außenabstand ein: (z.B., 21px 34px 13px 144px)"})
                    buttons.exactMarginTopButton.onclick = () => buttons.setStyleWithPrompt({key: "marginTop", node: selectedNode, message: "Gebe den exakten Außenabstand nach oben ein: (z.B., 21px)"})
                    buttons.exactMarginRightButton.onclick = () => buttons.setStyleWithPrompt({key: "marginRight", node: selectedNode, message: "Gebe den exakten Außenabstand nach rechts ein: (z.B., 21px)"})
                    buttons.exactMarginBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "marginRight", node: selectedNode, message: "Gebe den exakten Außenabstand nach unten ein: (z.B., 21px)"})
                    buttons.exactMarginLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "marginLeft", node: selectedNode, message: "Gebe den exakten Außenabstand nach links ein: (z.B., 21px)"})
                    buttons.togglePaddingButton.onclick = () => buttons.toggleStyle({key: "padding", value: "21px 34px", node: selectedNode})
                    buttons.togglePaddingTopButton.onclick = () => buttons.toggleStyle({key: "paddingTop", value: "21px", node: selectedNode})
                    buttons.togglePaddingRightButton.onclick = () => buttons.toggleStyle({key: "paddingRight", value: "34px", node: selectedNode})
                    buttons.togglePaddingBottomButton.onclick = () => buttons.toggleStyle({key: "paddingBottom", value: "21px", node: selectedNode})
                    buttons.togglePaddingLeftButton.onclick = () => buttons.toggleStyle({key: "paddingLeft", value: "34px", node: selectedNode})
                    buttons.exactPaddingButton.onclick = () => buttons.setStyleWithPrompt({key: "padding", node: selectedNode, message: "Gebe den exakten Innenabstand ein: (z.B., 21px 34px 13px 144px)"})
                    buttons.exactPaddingTopButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingTop", node: selectedNode, message: "Gebe den exakten Innenabstand nach oben ein: (z.B., 21px)"})
                    buttons.exactPaddingRightButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingRight", node: selectedNode, message: "Gebe den exakten Innenabstand nach rechts ein: (z.B., 21px)"})
                    buttons.exactPaddingBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingRight", node: selectedNode, message: "Gebe den exakten Innenabstand nach unten ein: (z.B., 21px)"})
                    buttons.exactPaddingLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingLeft", node: selectedNode, message: "Gebe den exakten Innenabstand nach links ein: (z.B., 21px)"})
                    buttons.toggleBorderButton.onclick = () => buttons.toggleStyle({key: "border", value: "1px solid black", node: selectedNode})
                    buttons.toggleBorderTopButton.onclick = () => buttons.toggleStyle({key: "borderTop", value: "1px solid black", node: selectedNode})
                    buttons.toggleBorderRightButton.onclick = () => buttons.toggleStyle({key: "borderTop", value: "1px solid black", node: selectedNode})
                    buttons.toggleBorderBottomButton.onclick = () => buttons.toggleStyle({key: "borderBottom", value: "1px solid black", node: selectedNode})
                    buttons.toggleBorderLeftButton.onclick = () => buttons.toggleStyle({key: "borderLeft", value: "1px solid black", node: selectedNode})
                    buttons.exactBorderButton.onclick = () => buttons.setStyleWithPrompt({key: "border", node: selectedNode, message: "Gebe die exakten Grenzlinien ein: (z.B., 3px solid red)"})
                    buttons.exactBorderTopButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTop", node: selectedNode, message: "Gebe die exakten Grenzlinien nach oben ein: (z.B., 3px solid red)"})
                    buttons.exactBorderRightButton.onclick = () => buttons.setStyleWithPrompt({key: "borderRight", node: selectedNode, message: "Gebe die exakten Grenzlinien nach rechts ein: (z.B., 3px solid red)"})
                    buttons.exactBorderBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottom", node: selectedNode, message: "Gebe die exakten Grenzlinien nach unten ein: (z.B., 3px solid red)"})
                    buttons.exactBorderLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "borderLeft", node: selectedNode, message: "Gebe die exakten Grenzlinien nach links ein: (z.B., 3px solid red)"})
                    buttons.toggleBorderRadiusButton.onclick = () => buttons.toggleStyle({key: "borderRadius", value: "3px", node: selectedNode})
                    buttons.toggleBorderTopLeftRadiusButton.onclick = () => buttons.toggleStyle({key: "borderTopLeftRadius", value: "3px", node: selectedNode})
                    buttons.toggleBorderTopRightRadiusButton.onclick = () => buttons.toggleStyle({key: "borderTopRightRadius", value: "3px", node: selectedNode})
                    buttons.toggleBorderBottomRightRadiusButton.onclick = () => buttons.toggleStyle({key: "borderBottomRightRadius", value: "3px", node: selectedNode})
                    buttons.toggleBorderBottomLeftRadiusButton.onclick = () => buttons.toggleStyle({key: "borderBottomLeftRadius", value: "3px", node: selectedNode})
                    buttons.exactBorderRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderRadius", node: selectedNode, message: "Gebe den exakten Radius, für alle Ecken, ein: (z.B. 13px)"})
                    buttons.exactBorderTopLeftRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTopLeftRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Oben-Links, ein: (z.B., 13px)"})
                    buttons.exactBorderTopRightRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTopRightRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Oben-Rechts, ein: (z.B., 13px)"})
                    buttons.exactBorderBottomLeftRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottomRightRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Unten-Links, ein: (z.B., 13px)"})
                    buttons.exactBorderBottomRightRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottomLeftRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Unten-Rechts, ein: (z.B., 13px)"})
                    buttons.toggleBorderNoneButton.onclick = () => buttons.toggleStyle({key: "border", value: "none", node: selectedNode})
                    buttons.boxButton.onclick = () => buttons.toggleStyles({styles: {margin: "21px 34px", padding: "8px", borderRadius: "3px", boxShadow: "rgba(0, 0, 0, 0.13) 0px 1px 3px"}, node: selectedNode})
                    buttons.exactBoxShadowButton.onclick = () => buttons.setStyleWithPrompt({key: "boxShadow", node: selectedNode, message: "Geben den exakten Schatten ein: (z.B., rgba(0, 0, 0, 0.13) 0px 1px 3px)"})
                    buttons.mediaQueriesOverviewButton.onclick = () => buttons.openMediaQueriesOverlay()
                    buttons.largeDeviceButton.onclick = () => buttons.addLargeStyle(selectedNode)
                    buttons.middleDeviceButton.onclick = () => buttons.addMiddleStyle(selectedNode)
                    buttons.smallDeviceButton.onclick = () => buttons.addSmallStyle(selectedNode)
                    buttons.printerDeviceButton.onclick = () => buttons.addPrinterStyle(selectedNode)

                    let rememberCuttedNodes = []
                    buttons.insertAfterButton.onclick =  () => buttons.insertAfter(selectedNode, rememberCuttedNodes)
                    buttons.insertBeforeButton.onclick =  () => buttons.insertBefore(selectedNode, rememberCuttedNodes)
                    buttons.insertLeftButton.onclick =  () => buttons.insertLeft(selectedNode, rememberCuttedNodes)
                    buttons.insertRightButton.onclick =  () => buttons.insertRight(selectedNode, rememberCuttedNodes)
                    buttons.cutOuterHtmlButton.onclick = () => {
                      if (selectedNode) {
                        rememberCuttedNodes.push({ node: selectedNode, parent: selectedNode.parentElement, index: this.convert("node/index", selectedNode)})
                        selectedNode.remove()
                      }
                    }
                    buttons.copyOuterHtmlButton.onclick = () => buttons.addOuterHtmlToClipboard(selectedNode)
                    buttons.pasteOuterHtmlButton.onclick = () => buttons.appendClipboardToNode(selectedNode)
                    buttons.copyStyleButton.onclick = () => buttons.addStyleToClipboard(selectedNode)
                    buttons.pasteStyleButton.onclick = () => buttons.addClipboardToStyle(selectedNode)
                    buttons.removeStyleButton.onclick = () => buttons.toggleAttribute("style", selectedNode)
                    buttons.removeInnerButton.onclick = () => buttons.toggleInnerHtml(selectedNode)
                    buttons.removeInnerWithTextButton.onclick = async () => await buttons.replaceInnerHtmlWithPrompt(selectedNode)
                    buttons.removeNodeButton.onclick = () => buttons.toggleNode(selectedNode)
                    buttons.idButton.onclick = () => buttons.setIdWithPrompt(selectedNode)
                    buttons.addClassButton.onclick = () => buttons.setClassWithPrompt(selectedNode)
                    buttons.setAttributeButton.onclick = () => buttons.setAttributeWithPrompt(selectedNode)
                    buttons.appendStyleButton.onclick = () => buttons.appendStyleWithPrompt(selectedNode)
                    buttons.fontSizeForEachChildButton.onclick = () => buttons.setChildrenStyleWithPrompt("fontSize", selectedNode, "Gebe die Schriftgrüße für alle Kind Elemente: (z.B., 21px)")

                    const svgIconsFragment = await buttons.svgIcons.appendSvgIconsFragment(buttons.svgPickerOptions, (button) => {
                      selectedNode.appendChild(button.querySelector(".icon").cloneNode(true))
                    })

                  })
                }
              }
            }
            if (child.closest("svg") !== null) {
              {
                const button = leftRight({left: "", right: ""}, buttons)
                button.left.textContent = ".fill"
                button.right.textContent = "Passe die Farbe deine SVG Elements an"
                button.onclick = () => {

                  pop(colorsOverlay => {
                    colorsOverlay.addInfo(".fill.colors")
                    const container = this.div("flex wrap pb144 of-auto", colorsOverlay)
                    this.fn("renderColors")(container, (value) => {
                      child.setAttribute("fill", value)
                      window.alert(`Das 'fill'-Attribut wurde erfolgreich im ${child.tagName.toUpperCase()} gesetzt.`)
                      removeOverlays()
                    })
                  })
                }
              }

              {
                const button = leftRight({left: "", right: ""}, buttons)
                button.left.textContent = ".fixed-bottom-center"
                button.right.textContent = "Positioniere dein SVG fixiert-unten-mittig"
                button.onclick = () => {

                  child.className += " fixed bottom left50p translateX-50p"
                  removeOverlays()
                }
              }


            }

            {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".html"
              button.right.textContent = "HTML anhängen"
              button.onclick = () => {

                pop(overlay => {
                  overlay.addInfo(`<${nodeToSelector(child)}.html`)
                  const funnel = overlay.content
                  const field = textarea(funnel)
                  field.input.placeholder = `<div>..</div>`
                  field.input.style.fontSize = "13px"
                  field.input.style.fontFamily = `monospace`
                  field.input.style.height = "55vh"
                  field.input.setAttribute("required", "true")
                  verifyInputValue(field.input)
                  field.input.oninput = () => verifyInputValue(field.input)
                  const submit = textToAction("HTML jetzt anhängen", funnel)
                  submit.onclick = async () => {

                    const html = await this.convert("text/purified", field.input.value)
                    if (!textIsEmpty(html)) {
                      child.appendChild(html)
                      removeOverlays()
                    } else {
                      window.alert("Kein gültiges HTML.")
                    }
                  }
                })
              }
            }
            {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".id"
              button.right.textContent = "Element Id definieren"
              button.onclick = async () => {

                pop(async overlay => {
                  overlay.addInfo(`<${nodeToSelector(child)}`)
                  const content = overlay.content
                  const idField = text(content)
                  idField.input.setAttribute("accept", "text/tag")
                  idField.input.placeholder = "Id (text/tag)"
                  if (child.hasAttribute("id")) {
                    idField.input.value = child.getAttribute("id")
                  }
                  this.add("hover-outline", idField.input)
                  verifyInputValue(idField.input)
                  idField.input.oninput = async () => {

                    await verifyInputValue(idField.input)
                    const value = idField.input.value
                    if (textIsEmpty(value)) {
                      child.removeAttribute("id")
                    } else {
                      if (!document.getElementById(value)) {
                        child.setAttribute("id", value)
                      } else {
                        this.add("style/not-valid", idField.input)
                      }
                    }
                    overlay.info.textContent = `<${nodeToSelector(child)}`
                    updateNodeAlias(child)
                  }
                })



              }
            }
            {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".innerHTML"
              button.right.textContent = "HTML Inhalt ersetzen"
              button.onclick = async () => {

                pop(overlay => {
                  overlay.addInfo(this.convert("element/alias", document.body))
                  const funnel = overlay.content
                  const htmlField = textarea(funnel)
                  htmlField.input.style.height = "55vh"
                  htmlField.input.style.fontFamily = "monospace"
                  htmlField.input.style.fontSize = "13px"
                  htmlField.input.placeholder = "<body>..</body>"
                  verifyInputValue(htmlField.input)
                  const submit = textToAction("Inhalte jetzt ersetzen", funnel)
                  submit.onclick = async () => {

                    const purified = await Helper.convert("text/purified", htmlField.input.value)
                    if (!this.verifyIs("text/emtpy", purified)) {
                      child.innerHTML = purified
                      removeOverlays()
                    } else {
                      window.alert("Kein gültiges HTML.")
                    }
                  }
                })
              }
            }
            if (child.tagName === "BODY") {
              if (callback.type === "expert") {
                const button = leftRight({left: "", right: ""}, buttons)
                button.left.textContent = ".location-list"
                button.right.textContent = "Definiere eine Liste, für deine Nutzer"
                button.onclick = () => {

                  pop(async o1 => {
                    const content = o1.content
                    const funnel = this.div("", content)
                    funnel.idField = this.create("input/id", funnel)
                    this.render("label", {for: "path", text: "Funnel wählen"}, funnel)
                    funnel.path = select(funnel)
                    funnel.path.input.id = "path"
                    const tree = "getyour.expert.platforms"
                    post("/get/users/trees/", {trees: [tree]}).then(res => {

                      if (res.status === 200) {
                        const users = JSON.parse(res.response)
                        funnel.path.input.textContent = ""
                        for (let i = 0; i < users.length; i++) {
                          const user = users[i]
                          const platforms = user[tree] || []
                          const values = platforms.flatMap(it => it.values || [])
                          for (let i = 0; i < values.length; i++) {
                            const value = values[i]
                            const option = document.createElement("option")
                            option.text = value.path
                            option.value = value.path
                            this.append(option, funnel.path.input)
                          }
                        }
                      }
                    })
                    this.add("style/valid", funnel.path.input)
                    funnel.path.input.oninput = async ev => {

                      const path = ev.target.value
                      const funnels = await this.convert("path/funnels", path)
                      pop(o2 => {
                        const content = o2.content
                        textToH1("Verfügbare Funnel Ids", content)
                        const buttons = this.create("div", content)
                        for (let i = 0; i < funnels.length; i++) {
                          const it = funnels[i]
                          const button = leftRight({left: it.id, right: "Auswählen"}, buttons)
                          button.onclick = () => {

                            funnel.idField.input.value = it.id
                            verifyInputValue(funnel.idField.input)
                            o2.remove()
                          }
                        }
                      })
                    }
                    funnel.submit = textToAction("Skript jetzt anhängen", funnel)
                    funnel.submit.onclick = async () => {

                      await verifyInputValue(funnel.idField.input)
                      const tag = funnel.idField.input.value
                      const path = funnel.path.input.value
                      const script = this.create("script/id", `location-list`)
                      script.setAttribute("tag", tag)
                      script.setAttribute("path", path)
                      this.add("script-onbody", script)
                      window.alert("Skript wurde erfolgreich angehängt.")
                      removeOverlays()
                    }
                  })
                }
              }
            }
            if (child.tagName === "BODY") {
              if (callback.type === "expert") {
                const button = leftRight({left: ".match-maker", right: "Match Maker Skripte anhängen"}, buttons)
                button.onclick = () => {

                  pop(async o2 => {
                    o2.addInfo(".match-maker")
                    o2.load()
                    const content = o2.content
                    const res = await post("/get/match-maker/location-expert/")
                    if (res.status === 200) {
                      const matchMaker = JSON.parse(res.response)
                      // console.log(matchMaker);

                      // this.convert("parent/scrollable", content)
                      this.render("match-maker/buttons", matchMaker, content)
                    } else {
                      const res = await post("/get/match-maker/location-writable/")
                      if (res.status === 200) {
                        const matchMaker = JSON.parse(res.response)
                        // this.convert("parent/scrollable", content)
                        this.render("match-maker/buttons", matchMaker, content)
                      } else {
                        this.convert("parent/note", content)
                        content.textContent = "Keine Match Maker gefunden"
                      }
                    }
                  })
                }
              }
            }
            if (["BODY", "DIV"].includes(child.tagName)) {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".md"
              button.right.textContent = "Markdown konvertieren und anhängen"
              button.onclick = async () => {
                pop(o2 => {
                  o2.addInfo(this.convert("element/alias", child))
                  const funnel = o2.content
                  const field = textarea(funnel)
                  field.input.placeholder = "Markdown zu HTML konvertieren (md/html)\n\n# Hello, Markdown! .. "
                  field.input.style.fontSize = "13px"
                  field.input.style.height = "55vh"
                  field.input.setAttribute("required", "true")
                  field.input.oninput = () => verifyInputValue(field.input)
                  verifyInputValue(field.input)
                  const submit = textToAction("Markdown jetzt anhängen", funnel)
                  submit.onclick = async () => {
                    await verifyInputValue(field.input)
                    const markdown = field.input.value
                    const html = this.convert("markdown/html", markdown)
                    const purified = await this.convert("text/purified", html)
                    const div = this.div("markdown")
                    div.innerHTML = purified
                    this.append(div, child)
                    removeOverlays()
                  }
                })
              }
            }
            const prependChildBtn = leftRight({left: ".prependChild", right: "HTML Element anhängen"}, buttons)
            prependChildBtn.onclick = () => {
              const prompt = window.prompt("Gebe ein HTML Element Tag ein:")
              try {
                const element = document.createElement(prompt)
                if (!element) throw new Error("HTML Element Tag ist ungültig.")
                child.prepend(element)
                removeOverlays()
              } catch (e) {
                window.alert(e)
              }
            }
            if (!["SCRIPT", "HEAD", "BODY"].includes(child.tagName)) {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".paste"
              button.right.textContent = "Kopiertes Element anhängen"
              button.onclick = async () => {

                const text = await this.convert("clipboard/text")
                const purified = await this.convert("text/purified", text)
                if (textIsEmpty(purified)) {
                  window.alert("Kein gültiges HTML.")
                  return
                }
                const fragment = document.createDocumentFragment()
                const html = this.convert("text/html", purified)
                fragment.appendChild(html)
                child.appendChild(fragment)
                window.alert(`Zwischenablage wurde erfolgreich in '${child.tagName}' angehängt.`)
                removeOverlays()
              }
            }
            if (!["BODY", "HEAD"].includes(child.tagName)) {
              {
                const button = leftRight({left: "", right: ""}, buttons)
                button.left.textContent = ".remove"
                button.right.textContent = "Element entfernen"
                button.onclick = async () => {
                  child.remove()
                  removeOverlays()
                }
              }
            }
            {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".setAttribute"
              button.right.textContent = "Neues Attribut setzen"
              button.onclick = () => {

                const attribute = window.prompt("Gebe dein neues Attribut ein: (z.B., width)")
                if (!textIsEmpty(attribute)) {
                  const value = window.prompt("Gebe den Wert ein: (z.B., 100%)")
                  if (!textIsEmpty(value)) {
                    child.setAttribute(attribute, value)
                    window.alert(`Attribut erfolgreich gesetzt.`)
                  }
                }
              }
            }
            if (child.tagName === "BODY") {
              if (callback.type === "expert") {
                const button = leftRight({left: "", right: ""}, buttons)
                button.left.textContent = ".scripts"
                button.right.textContent = "Nutze geprüfte HTML Skripte"
                button.onclick = () => {

                  pop(async overlay => {
                    overlay.addInfo(".scripts")
                    const content = overlay.content
                    const res = await post("/get/scripts/toolbox/")
                    if (res.status === 200) {
                      const scripts = JSON.parse(res.response)
                      await this.render("toolbox-scripts", scripts, content)
                    } else {
                      const res = await post("/get/scripts/writable/")
                      if (res.status === 200) {
                        const scripts = JSON.parse(res.response)
                        await this.render("toolbox-scripts", scripts, content)
                      } else {
                        this.convert("parent/info", content)
                        content.textContent = "Keine Skripte gefunden"
                        this.style(content, {margin: "21px 34px"})
                      }
                    }
                  })

                }
              }
            }
            if (child.tagName === "HEAD") {
              {
                const button = leftRight({left: "", right: ""}, buttons)
                button.left.textContent = ".style"
                button.right.textContent = "Design als Style Tag anhängen"
                button.onclick = () => {

                  pop(overlay => {
                    overlay.addInfo(`<${nodeToSelector(child)}.style`)
                    const funnel = overlay.content
                    const cssField = textarea(funnel)
                    cssField.input.placeholder = `.class {..}`
                    cssField.input.style.fontFamily = "monospace"
                    cssField.input.style.fontSize = "13px"
                    cssField.input.style.height = "55vh"
                    cssField.input.setAttribute("required", "true")
                    cssField.input.oninput = () => verifyInputValue(cssField.input)
                    const submit = textToAction("Style jetzt anhängen", funnel)
                    submit.onclick = async () => {

                      await verifyInputValue(cssField.input)
                      const style = document.createElement("style")
                      style.textContent = cssField.input.value
                      this.append(style, child)
                      removeOverlays()
                    }
                  })
                }
              }
            }
            if (!["SCRIPT", "BODY", "HEAD"].includes(child.tagName)) {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".style"
              button.right.textContent = "CSS Import mit Vorschau bearbeiten"
              button.onclick = () => {

                pop(overlay => {
                  overlay.addInfo(`<${nodeToSelector(child)}.style`)
                  const content = overlay.content
                  const preview = document.createElement("div")
                  preview.style.height = `${window.innerHeight * 0.4}px`
                  preview.style.overflow = "auto"
                  const clone = child.cloneNode(true)
                  clone.id = Date.now()
                  clone.name = `${Date.now()}`
                  preview.append(clone)
                  content.append(preview)
                  this.render("text/hr", "Vorschau", content)
                  const cssField = this.create("field/textarea", content)
                  cssField.label.textContent = "CSS Eigenschaften"
                  cssField.input.style.height = "233px"
                  cssField.input.style.fontFamily = "monospace"
                  cssField.input.style.fontSize = "13px"
                  cssField.input.placeholder = "color: blue;\nborder: 1px solid black;\n\n  ..\n\nkey: value;"
                  this.add("hover-outline", cssField.input)
                  if (child.hasAttribute("style")) {
                    cssField.input.value = this.convert("styles/text", child)
                  }
                  verifyInputValue(cssField.input)
                  cssField.input.oninput = () => {

                    const css = cssField.input.value
                    clone.setAttribute("style", css)
                    child.setAttribute("style", css)
                  }
                })
              }
            }
            if (child.tagName === "BODY") {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".style"
              button.right.textContent = "CSS Import"
              button.onclick = () => {

                pop(overlay => {
                  overlay.addInfo(`${this.convert("element/alias", child).textContent}.style`)
                  const content = overlay.content
                  const cssField = textarea(content)
                  cssField.input.style.height = "55vh"
                  cssField.input.style.fontFamily = "monospace"
                  cssField.input.style.fontSize = "13px"
                  cssField.input.placeholder = "color: blue;\nborder: 1px solid black;\n\n  ..\n\nkey: value;"
                  if (child.hasAttribute("style")) {
                    cssField.input.value = this.convert("styles/text", child)
                  }
                  verifyInputValue(cssField.input)
                  cssField.input.oninput = async () => {

                    await verifyInputValue(cssField.input)
                    const css = cssField.input.value
                    if (textIsEmpty(css)) {
                      child.removeAttribute("style")
                    } else {
                      child.setAttribute("style", css)
                    }
                  }
                })
              }
            }
            if (!["SCRIPT", "HEAD"].includes(child.tagName)) {
              const button = leftRight({left: "", right: ""}, buttons)
              button.left.textContent = ".svg"
              button.right.textContent = "Bringe deine Kreativität zum Ausdruck"
              button.onclick = () => {

                const svg = this.fn("svg")
                pop(o2 => {
                  o2.addInfo(".svg.options")
                  const buttons = o2.content
                  {
                    const button = leftRight({left: "", right: ""}, buttons)
                    button.left.textContent = ".icons"
                    button.right.textContent = "Füge vorgefertigte Icons deinem Element hinzu"
                    button.onclick = () => {

                      pop(async svgIconsOverlay => {
                        svgIconsOverlay.info.textContent = ".svg.icons"
                        const container = this.create("div/flex-row", svgIconsOverlay)
                        container.style.overflow = "auto"
                        await svg.icons(container, (iconButton, svgIcon) => {
                          iconButton.onclick = () => {
                            child.appendChild(svgIcon.cloneNode(true))
                            window.alert(`SVG wurde erfolgreich im ${child.tagName} angehängt.`)
                            removeOverlays()
                          }
                        })
                      })
                    }
                  }

                  {
                    const button = leftRight({left: ".upload", right: "Lade dein eigenes SVG und füge es deinem Element hinzu"}, buttons)
                    button.onclick = () => {

                      pop(overlay => {
                        const inputField = this.create("input/file", overlay)
                        inputField.input.setAttribute("accept", "image/svg+xml")
                        this.add("style/not-valid", inputField.input)
                        inputField.input.oninput = async () => {
                          const file = inputField.input.files[0]
                          if (file.type === "image/svg+xml") {
                            this.add("style/valid", inputField.input)
                            const svg = await this.convert("file/svg", file)
                            child.appendChild(svg)
                            removeOverlays()
                          } else {
                            window.alert("Falsches Format. Es sind nur .svg Dateien erlaubt.")
                          }
                        }
                      })
                    }
                  }

                })
              }
            }
            if (child.tagName !== "BODY") {
              {
                const button = leftRight({left: ".textContent", right: "Text Inhalt aktualisieren"}, buttons)
                button.onclick = () => {

                  const editors = [
                    { name: 'codepen.io', url: 'https://codepen.io/pen/?editors=1100' },
                    { name: 'jsfiddle.net', url: 'https://jsfiddle.net/' },
                    { name: 'codesandbox.io', url: 'https://codesandbox.io/s/new' },
                    { name: 'jsbin.com', url: 'https://jsbin.com/?js' },
                    { name: 'playcode.io', url: 'https://playcode.io/javascript' },
                    { name: 'blackbox.ai', url: 'https://blackbox.ai/' },
                    { name: 'duck.ai', url: 'https://duck.ai/' },
                    { name: 'beautifier.io', url: 'https://beautifier.io/' },
                  ]

                  pop(overlay => {
                    overlay.info.textContent = `<${nodeToSelector(child)}.textContent`
                    const content = this.create("div/scrollable", overlay)
                    const htmlField = textarea(content)
                    htmlField.input.style.height = "55vh"
                    htmlField.input.style.fontFamily = "monospace"
                    htmlField.input.style.fontSize = "13px"
                    htmlField.input.placeholder = "Mein Text Inhalt"
                    htmlField.input.value = child.textContent
                    this.add("hover-outline", htmlField.input)
                    verifyInputValue(htmlField.input)
                    htmlField.input.oninput = () => {
                      child.textContent = htmlField.input.value
                    }

                    for (let i = 0; i < editors.length; i++) {
                      const editor = editors[i]
                      const button = leftRight({left: "", right: ""}, content)
                      button.left.textContent = `.${editor.name}`
                      button.right.textContent = "Öffnet einen Editor in einem neuen Fenster"
                      button.onclick = () => window.open(editor.url, "_blank")
                    }

                  })
                }
              }
            }
            if (child.tagName === "HEAD") {
              const button = leftRight({left: ".title", right: "Dokument Titel definieren"}, buttons)
              button.onclick = async () => {
                pop(async overlay => {
                  addSaveButton(callback.type, overlay)
                  overlay.addInfo(`<${nodeToSelector(child)}.title`)
                  const funnel = overlay.content
                  const titleField = text(funnel)
                  titleField.input.placeholder = "<title>..</title>"
                  titleField.input.addEventListener("input", ev => {
                    const text = ev.target.value
                    if (textIsEmpty(text)) {
                      document.querySelector("title").remove()
                      return
                    }
                    let title = document.querySelector("title")
                    if (title) {
                      title.textContent = text
                    } else {
                      title = document.createElement("title")
                      title.textContent = text
                      document.head.appendChild(title)
                    }
                  })
                })
              }
            }
            if (child.tagName === "BODY") {
              // das muss irgendwie anders passieren ??
              // ein skript mit einem tag ??
              // kombiniert mit dem design tree?
              // ddas ist das skript das individuelle designs mit daten füllen kann
              if (callback.type === "expert") {
                const button = leftRight({left: ".users-trees-open", right: "Hol dir eine Liste mit Nutzern"}, buttons)
                button.onclick = () => {

                  pop(overlay => {
                    const funnel = this.create("div/scrollable", overlay)
                    createIdTreesFunnel(funnel)
                    funnel.submit.onclick = async () => {
                      await this.verify("field-funnel", funnel)
                      const script = this.create("script/id", funnel.idField.input.value)
                      if (!this.verifyIs("id/unique", script.id)) {
                        this.add("style/not-valid", funnel.idField.input)
                      }
                      this.add("id-onbody", script)
                    }
                  })
                }
              }

              function createIdTreesFunnel(node) {
                const fragment = document.createDocumentFragment()
                node.idField = Helper.create("field/tag", fragment)
                node.idField.label.textContent = "Vordefiniertes Design mit einer Id finden"
                node.idField.input.placeholder = "meine-element"
                Helper.add("hover-outline", node.idField.input)
                verifyInputValue(node.idField.input)
                node.idField.input.oninput = () => verifyInputValue(node.idField.input)
                node.treesField = Helper.create("field/trees", fragment)
                node.treesField.label.textContent = "Liste mit Datenstrukturen eingeben"
                node.treesField.input.placeholder = `[\n  "getyour.expert.name",\n  "platform.company.name",\n  "email"\n]`
                node.treesField.input.style.height = "144px"
                Helper.add("hover-outline", node.treesField.input)
                verifyInputValue(node.treesField.input)
                node.treesField.input.oninput = () => verifyInputValue(node.treesField.input)
                node.submit = Helper.create("button/action", fragment)
                node.submit.textContent = "Skript jetzt anhängen"
                node?.appendChild(fragment)
                return node
              }

              if (callback.type === "expert") {
                const button = leftRight({left: ".user-trees-closed", right: "Hol dir Datensätze vom Nutzer"}, buttons)
                button.onclick = () => {
                  pop(overlay => {
                    overlay.info.textContent = "script.user-trees-closed"
                    const funnel = this.create("div/scrollable", overlay)
                    createIdTreesFunnel(funnel)
                    funnel.submit.onclick = async () => {
                      await this.verify("field-funnel", funnel)
                      const script = this.create("script/id", funnel.idField.input.value)
                      if (!this.verifyIs("id/unique", script.id)) {
                        this.add("style/not-valid", funnel.idField.input)
                      }
                      this.add("id-onbody", script)
                    }
                  })
                }
              }
            }
          }
        })
      }
    }
  })
}
export const openToolbox = toolboxOverlay
