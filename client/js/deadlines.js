import {Helper} from "/js/Helper.js"

export const deadlines = {}
deadlines.openOverlay = () => {

  Helper.overlay("pop", async o1 => {
    o1.appendAddButton()
    o1.removeOverlayButton.addEventListener("click", () => clearInterval(interval))
    const content = o1.content
    const container = Helper.div("", content)
    await renderDeadlines(container)
    o1.addButton.onclick = () => {

      Helper.overlay("pop", o2 => {
        const content = o2.content
        const form = renderDeadlineForm(content)
        Helper.verify("funnel", form)
        form.submit.onclick = async () => {

          await Helper.verify("funnel", form)
          await form.date.verifyValue()
          await form.reminder.verifyValue()
          const date = form.date.getTime()
          const alias = form.alias.input.value
          const notes = form.notes.input.value
          const reminder = form.reminder.getTime()
          Helper.overlay("lock", async o3 => {
            const res = await Helper.request("/jwt/register/deadline/", {alias, date, notes, reminder})
            if (res.status === 200) {
              o3.alert.saved()
              await renderDeadlines(container)
              o1.remove()
              o2.remove()
            } else {
              o3.alert.nok()
            }
            o3.remove()
          })
        }
      })
    }

  })
}
function renderDeadlineButton(deadline, node) {

  const button = Helper.create("button/left-right", node)

  function updateCountdown() {
    const now = new Date()
    const endTime = new Date(deadline.date)
    const timeLeft = endTime - now

    Helper.add("style/green", button)

    const threeDays = 3 * 24 * 60 * 60 * 1000
    if (timeLeft < threeDays) {
      Helper.add("style/yellow", button)
    }

    if (timeLeft <= 0) {
      button.right.textContent = "Zeit abgelaufen!"
      Helper.add("style/red", button)
      clearInterval(interval)
      return
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

    button.right.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`
  }
  const interval = setInterval(updateCountdown, 1000)
  updateCountdown()

  const title = document.createElement("h1")
  title.textContent = deadline.alias
  button.left.appendChild(title)

  const notes = document.createElement("p")
  notes.textContent = deadline.notes
  button.left.appendChild(notes)

  button.onclick = () => {

    Helper.overlay("pop", o1 => {

      const content = o1.content
      const form = renderDeadlineForm(content)
      form.date.input.removeAttribute("required")
      form.reminder.input.removeAttribute("required")
      Helper.verify("funnel", form)

      form.date.input.value = deadline.date
      form.alias.input.value = deadline.alias
      form.notes.input.value = deadline.notes
      form.reminder.input.value = deadline.reminder
      form.submit.addEventListener("click", async () => {

        const date = form.date.getTime()
        const alias = form.alias.input.value
        const notes = form.notes.input.value
        const reminder = form.reminder.getTime()
        Helper.overlay("lock", async o2 => {
          const res = await Helper.request("/jwt/update/deadline/", {created: deadline.created, date, alias, notes, reminder})
          if (res.status === 200) {
            o2.alert.saved()
            await renderDeadlines(node)
            o1.remove()
          } else {
            o2.alert.nok()
          }
          o2.remove()
        })
      })
      {
        const button = Helper.create("button/left-right", content)
        button.left.textContent = ".remove"
        button.right.textContent = "Frist entfernen"
        button.onclick = () => {

          const confirm = window.confirm("Möchtest du diese Frist wirklich entfernen?")
          if (confirm === true) {
            Helper.overlay("lock", async o2 => {
              const res = await Helper.request("/remove/deadline/closed/", {id: deadline.created})
              if (res.status === 200) {
                o2.alert.removed()
                await renderDeadlines(node)
                o1.remove()
              } else {
                o2.alert.nok()
              }
              o2.remove()
            })
          }
        }
      }
    })
  }


}
function renderDeadlineForm(node) {

  const form = document.createElement("div")
  form.id = "deadline"
  const dateLabel = Helper.render("label", {for: "date", text: "Neue Frist am:"}, form)
  dateLabel.classList.add("mt21")
  form.date = Helper.create("input/date-time", form)
  form.date.input.id = "date"
  form.date.getTime = () => {

    return new Date(form.date.input.value).getTime()
  }
  form.date.verifyValue = async () => {

    await form.date.stopIfPast()
    await form.date.stopIfNotInRange()
  }
  form.date.stopIfPast = () => {

    return new Promise(async(resolve, reject) => {
      try {
        const millis = new Date(form.date.input.value)
        if (Helper.verifyIs("millis/past", millis)) {
          Helper.add("style/not-valid", form.date.input)
          throw new Error("deadline not in future")
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  form.date.input.addEventListener("input", async ev => {

    await form.date.verifyValue()
  })
  form.date.stopIfNotInRange = () => {

    return new Promise(async(resolve, reject) => {
      try {
        const dateTime = new Date(form.date.input.value).getTime()
        const reminderTime = new Date(form.reminder.input.value).getTime()
        if (!Helper.verifyIs("number/empty", reminderTime)) {
          if (dateTime > reminderTime) {
            Helper.add("style/valid", form.reminder.input)
            Helper.add("style/valid", form.date.input)
            resolve()
          } else {
            Helper.add("style/not-valid", form.date.input)
            Helper.add("style/not-valid", form.reminder.input)
            throw new Error("deadline not in range")
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  form.alias = Helper.create("input/alias", form)
  form.alias.input.removeAttribute("required")
  form.alias.input.id = "alias"
  form.notes = Helper.create("input/textarea", form)
  form.notes.input.placeholder = "Notizen"
  form.notes.input.id = "notes"
  Helper.render("label", {for: "reminder", text: "Erinnerung am:"}, form)
  form.reminder = Helper.create("input/date-time", form)
  form.reminder.getTime = () => {

    return new Date(form.reminder.input.value).getTime()
  }
  form.reminder.input.id = "reminder"
  form.reminder.input.addEventListener("input", async ev => {

    await form.reminder.verifyValue()
  })
  form.reminder.verifyValue = async () => {

    await form.reminder.stopIfFuture()
    await form.reminder.stopIfPast()
  }
  form.reminder.stopIfFuture = () => {

    return new Promise(async(resolve, reject) => {
      try {
        const dateTime = new Date(form.date.input.value).getTime()
        const reminderTime = new Date(form.reminder.input.value).getTime()
        if (dateTime > reminderTime) {
          Helper.add("style/valid", form.date.input)
          Helper.add("style/valid", form.reminder.input)
          resolve()
        } else {
          Helper.add("style/not-valid", form.reminder.input)
          Helper.add("style/not-valid", form.date.input)
          throw new Error("reminder not in past")
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  form.reminder.stopIfPast = () => {

    return new Promise(async(resolve, reject) => {
      try {
        const millis = new Date(form.reminder.input.value)
        if (Helper.verifyIs("millis/past", millis)) {
          Helper.add("style/not-valid", form.reminder.input)
          throw new Error("reminder not in future")
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  form.submit = Helper.create("button/action")
  form.submit.classList.add("submit")
  form.submit.textContent = "Daten jetzt speichern"
  Helper.append(form.submit, form)
  if (node) Helper.append(form, node)
  return form
}
async function renderDeadlines(node) {

  node.textContent = ""
  const loading = Helper.create("div/loading", node)
  const title = Helper.render("text/h1", "Deadlines", node)
  const res = await Helper.request("/jwt/get/user/deadlines/")
  loading.remove()
  if (res.status === 200) {
    const deadlines = JSON.parse(res.response)
    sortByDate(deadlines)
    for (let i = 0; i < deadlines.length; i++) {
      const deadline = deadlines[i]
      renderDeadlineButton(deadline, node)
    }
  } else {
    Helper.render("text/note", "Keine Fristen gefunden", node)
  }
}
function sortByDate(deadlines) {

  const now = new Date()
  deadlines.sort((a, b) => {
    const timeLeftA = new Date(a.date) - now
    const timeLeftB = new Date(b.date) - now
    return timeLeftA - timeLeftB
  })
}
