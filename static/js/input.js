import {div} from "/js/html-tags.js"
import {digestId} from "/js/crypto.js"
import {post} from "/js/request.js"
import {textIsEmpty, addValidSign, addNotValidSign, verifyInputValue} from "/js/verify.js"

export const alias = node => {
  const alias = text()
  alias.input.id = "alias"
  alias.input.maxLength = "55"
  alias.input.placeholder = "Alternativer Name"
  node?.appendChild(alias)
  return alias
}
export const checkbox = node => {
  const it = div("flex align start relative h34 w89 mtb21 mlr34")
  it.input = document.createElement("input")
  it.appendChild(it.input)
  it.input.type = "checkbox"
  it.input.className = "scale2 hover"
  node?.appendChild(it)
  return it
}
export const date = node => {
  const date = div("mtb21 mlr34 relative")
  date.input = document.createElement("input")
  date.appendChild(date.input)
  date.input.className = "hover w89p fs21 dark-light"
  date.input.type = "date"
  node?.appendChild(date)
  return date
}
export const dateTime = node => {
  const dateTime = div("mtb21 mlr34 relative")
  dateTime.input = document.createElement("input")
  dateTime.appendChild(dateTime.input)
  dateTime.input.className = "w89p fs21 dark-light hover"
  dateTime.input.type = "datetime-local"
  dateTime.input.setAttribute("required", "true")
  node?.appendChild(dateTime)
  return dateTime
}
export const email = node => {
  const div = document.createElement("div")
  div.className = "relative mtb21 mlr34"
  div.input = document.createElement("input")
  div.input.className = "email w89p fs21 hover dark-light"
  div.appendChild(div.input)
  div.input.type = "email"
  div.input.placeholder = "E-Mail Adresse"
  div.input.setAttribute("required", "true")
  div.input.setAttribute("accept", "text/email")
  node?.appendChild(div)
  return div
}
export const file = node => {
  const div = document.createElement("div")
  div.className = "mtb21 mlr34 relative"
  div.input = document.createElement("input")
  div.input.type = "file"
  div.input.className = "w89p fs21 dark-light hover"
  div.appendChild(div.input)
  node?.appendChild(div)
  return div
}
export const id = node => {
  const id = text()
  id.input.placeholder = "Id (text/tag)"
  id.input.setAttribute("required", "true")
  id.input.setAttribute("accept", "text/tag")
  id.input.maxLength = "34"
  node?.appendChild(id)
  return id
}
export const operator = node => {
  const it = text()
  it.input.placeholder = "Operator (text/operator)"
  it.input.maxLength = "2"
  it.input.setAttribute("required", "true")
  it.input.setAttribute("accept", "text/operator")
  node?.appendChild(it)
  return it
}
export const select = node => {
  const it = div("mtb21 mlr34 relative")
  it.input = document.createElement("select")
  it.input.className = "hover w89p fs21 dark-light"
  it.appendChild(it.input)
  it.addOption = (text, value) => {
    const option = document.createElement("option")
    option.value = value
    option.text = text
    it.input.appendChild(option)
  }
  it.append = options => {
    for (let i = 0; i < options.length; i++) {
      const option = document.createElement("option")
      option.value = options[i]
      option.text = options[i]
      it.input.appendChild(option)
    }
  }
  it.select = options => {
    const set = new Set(options)
    Array.from(it.input.options).forEach(option => {
      if (set.has(option.textContent.trim())) {
        option.selected = true
      } else {
        option.selected = false
      }
    })
  }
  it.selectAll = () => {
    for (let i = 0; i < it.input.options.length; i++) {
      it.input.options[i].selected = true
    }
  }
  it.selectByText = options => {
    const set = new Set(options)
    Array.from(it.input.options).forEach(option => {
      if (set.has(option.text)) {
        option.selected = true
      } else {
        option.selected = false
      }
    })
  }
  it.selectByValue = options => {
    const set = new Set(options)
    Array.from(it.input.options).forEach(option => {
      if (set.has(option.value)) {
        option.selected = true
      } else {
        option.selected = false
      }
    })
  }
  it.selectNone = () => {
    for (let i = 0; i < it.input.options.length; i++) {
      it.input.options[i].selected = false
    }
  }
  it.selectedText = () => {
    return Array.from(it.input.selectedOptions).map(it => it.text)
  }
  it.selectedValues = () => {
    return Array.from(it.input.selectedOptions).map(it => it.value)
  }
  it.textValue = options => {
    it.input.textContent = ""
    for (let i = 0; i < options.length; i++) {
      const it = options[i]
      const option = document.createElement("option")
      if (it.value) option.value = it.value
      if (it.text) option.text = it.text
      it.input.appendChild(option)
    }
  }
  node?.appendChild(it)
  return it
}
export const selectBoolean = node => {
  const it = select()
  it.setInput = bool => {
    it.input.textContent = ""
    if (bool === true) {
      it.append(["true", "false"])
    }
    if (bool === false) {
      it.append(["false", "true"])
    }
  }
  node?.appendChild(it)
  return it
}
export const selectContacts = node => {
  const select = selectEmails(node)
  post("/jwt/get/contacts/").then(res => {
    if (res.status === 200) {
      const contacts = JSON.parse(res.response)
      select.input.add(contacts)
    }
  })
  return select
}
export const selectEmails = node => {
  const searchField = text(node)
  searchField.input.placeholder = "Suche nach E-Mail Adresse"
  verifyInputValue(searchField.input)
  const field = select(node)
  field.input.className += " vh34"
  field.input.setAttribute("multiple", "true")
  field.input.render = options => {
    field.input.textContent = ""
    for (let i = 0; i < options.length; i++) {
      const it = options[i]
      if (it.id && it.email) {
        const option = document.createElement("option")
        option.text = it.email
        option.value = it.id
        field.input.appendChild(option)
      }
    }
  }
  field.input.add = async it => {
    options = await Promise.all(it.map(async item => {
      if (typeof item === "string") {
        const id = await digestId(item)
        return {email: item, id}
      } else if (typeof item === "object" && item !== null) {
        const id = await digestId(item.email)
        return {email: item.email, id}
      } else {
        return null
      }
    }))
    options = options.filter(it => it !== null)
    field.input.render(options)
  }
  let once = false
  let options
  searchField.input.oninput = ev => {
    const query = ev.target.value.toLowerCase()
    if (!once) {
      once = true
      options = Array.from(field.input.options).map(option => ({email: option.text, id: option.value}))
    }
    let filtered
    if (textIsEmpty(query)) {
      filtered = options
    } else {
      filtered = options.filter(it => it.email.toLowerCase().includes(query))
    }
    field.input.render(filtered)
  }
  field.selectedEmails = () => {
    return Array.from(field.input.selectedOptions).map(it => it.text)
  }
  field.selectedIds = () => {
    return Array.from(field.input.selectedOptions).map(it => it.value)
  }
  verifyInputValue(field.input)
  field.input.addEventListener("input", ev => verifyInputValue(field.input))
  return field
}
export const selectExperts = node => {
  const field = select(node)
  post("/jwt/get/experts/").then(res => {
    if (res.status === 200) {
      const experts = JSON.parse(res.response)
      field.input.textContent = ""
      for (let i = 0; i < experts.length; i++) {
        const expert = experts[i]
        const option = document.createElement("option")
        option.value = expert.id
        option.text = expert.email
        if (expert.alias) option.text = expert.alias
        field.input.appendChild(option)
      }
      if (experts.length > 0) addValidSign(field.input)
      else addNotValidSign(field.input)
    }
  })
  return field
}
export const tag = node => {
  const tag = text()
  tag.input.maxLength = "21"
  tag.input.setAttribute("accept", "text/tag")
  tag.input.setAttribute("required", "true")
  node?.appendChild(tag)
  return tag
}
export const tel = node => {
  const div = document.createElement("div")
  div.className = "mtb21 mlr34 relative"
  div.input = document.createElement("input")
  div.appendChild(div.input)
  div.input.type = "tel"
  div.input.className = "hover dark-light w89p fs21"
  node?.appendChild(div)
  return div
}
export const text = node => {
  const div = document.createElement("div")
  div.className = "mtb21 mlr34 relative"
  div.input = document.createElement("input")
  div.input.className = "hover w89p fs21 dark-light"
  div.input.type = "text"
  div.appendChild(div.input)
  node?.appendChild(div)
  return div
}
export const textarea = node => {
  const textarea = div("mtb21 mlr34 relative")
  textarea.input = document.createElement("textarea")
  textarea.input.className = "hover w89p dark-light"
  textarea.appendChild(textarea.input)
  node?.appendChild(textarea)
  return textarea
}
