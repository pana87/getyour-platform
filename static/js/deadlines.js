import {addLoading} from "/js/events.js"
import {alertNok, alertSaved} from "/js/alert.js"
import {textToAction, textToNote, textToH1} from "/js/convert.js"
import {dateTime, alias, textarea} from "/js/input.js"
import {labelFor, div} from "/js/html-tags.js"
import {add, leftRight, addSubmitButton} from "/js/button.js"
import {millisIsPast, verifyFunnel, verifyInputs, addValidSign, addNotValidSign, numberIsEmpty} from "/js/verify.js"
import {post} from "/js/request.js"
import {pop, lock} from "/js/overlay.js"

export const openDeadlines = () => {
  pop(async o1 => {
    o1.leftButton.addEventListener("click", () => {
      if (interval) clearInterval(interval)
    })
    const content = o1.content
    const container = div("", content)
    await renderDeadlines(container)
    const addButton = add("+", o1)
    addButton.onclick = () => {
      pop(o2 => {
        const content = o2.content
        const form = renderDeadlineForm(content)
        verifyInputs(form)
        form.submit.onclick = async () => {
          await verifyFunnel(form)
          await form.date.verifyValue()
          await form.reminder.verifyValue()
          const date = form.date.getTime()
          const alias = form.alias.input.value
          const notes = form.notes.input.value
          const reminder = form.reminder.getTime()
          lock(async o3 => {
            const res = await post("/jwt/register/deadline/", {alias, date, notes, reminder})
            if (res.status === 200) {
              alertSaved()
              await renderDeadlines(container)
              o2.remove()
            } else {
              alertNok()
            }
            o3.remove()
          })
        }
      })
    }
  })
}
function renderDeadlineButton(deadline, node) {
  const button = leftRight(node)
  button.classList.remove("btn-theme")
  button.classList.remove("color-theme")
  function updateCountdown() {
    const now = new Date()
    const endTime = new Date(deadline.date)
    const timeLeft = endTime - now
    button.classList.add("color-black")
    button.classList.add("btn-green")
    const threeDays = 3 * 24 * 60 * 60 * 1000
    if (timeLeft < threeDays) {
      button.classList.add("btn-yellow")
    }
    if (timeLeft <= 0) {
      button.right.textContent = "Zeit abgelaufen!"
      button.classList.add("btn-red")
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
    pop(o1 => {
      const content = o1.content
      const form = renderDeadlineForm(content)
      form.date.input.removeAttribute("required")
      form.reminder.input.removeAttribute("required")
      verifyFunnel(form)
      form.date.input.value = deadline.date
      form.alias.input.value = deadline.alias
      form.notes.input.value = deadline.notes
      form.reminder.input.value = deadline.reminder
      form.submit.addEventListener("click", async () => {
        const date = form.date.getTime()
        const alias = form.alias.input.value
        const notes = form.notes.input.value
        const reminder = form.reminder.getTime()
        lock(async o2 => {
          const res = await post("/jwt/update/deadline/", {created: deadline.created, date, alias, notes, reminder})
          if (res.status === 200) {
            alertSaved()
            await renderDeadlines(node)
            o1.remove()
          } else {
            alertNok()
          }
          o2.remove()
        })
      })
      {
        const button = leftRight(content)
        button.left.textContent = ".remove"
        button.right.textContent = "Frist entfernen"
        button.onclick = () => {
          const confirm = window.confirm("Möchtest du diese Frist wirklich entfernen?")
          if (confirm === true) {
            lock(async o2 => {
              const res = await post("/jwt/remove/deadline/", {created: deadline.created})
              if (res.status === 200) {
                o2.alert.removed()
                await renderDeadlines(node)
                o1.remove()
              } else {
                alertNok()
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
  const dateLabel = labelFor("date", "Neue Frist am:")
  form.date = dateTime(form)
  form.date.input.id = "date"
  form.date.prepend(dateLabel)
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
        if (millisIsPast(millis)) {
          addNotValidSign(form.date.input)
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
        if (!numberIsEmpty(reminderTime)) {
          if (dateTime > reminderTime) {
            addValidSign(form.reminder.input)
            addValidSign(form.date.input)
            resolve()
          } else {
            addNotValidSign(form.date.input)
            addNotValidSign(form.reminder.input)
            throw new Error("deadline not in range")
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  form.alias = alias(form)
  form.notes = textarea(form)
  form.notes.input.placeholder = "Notizen"
  form.notes.input.id = "notes"
  const reminderLabel = labelFor("reminder", "Erinnerung am:")
  form.reminder = dateTime(form)
  form.reminder.prepend(reminderLabel)
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
          addValidSign(form.date.input)
          addValidSign(form.reminder.input)
          resolve()
        } else {
          addNotValidSign(form.reminder.input)
          addNotValidSign(form.date.input)
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
        if (millisIsPast(millis)) {
          addNotValidSign(form.reminder.input)
          throw new Error("reminder not in future")
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  addSubmitButton(form)
  node?.appendChild(form)
  return form
}
async function renderDeadlines(node) {
  node.textContent = ""
  const loading = addLoading(node)
  const title = textToH1("Meine Termine", node)
  const res = await post("/jwt/get/deadlines/")
  loading.remove()
  if (res.status === 200) {
    const deadlines = JSON.parse(res.response)
    sortByDate(deadlines)
    for (let i = 0; i < deadlines.length; i++) {
      const deadline = deadlines[i]
      renderDeadlineButton(deadline, node)
    }
  } else {
    textToNote("Keine Termine gefunden", node)
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
