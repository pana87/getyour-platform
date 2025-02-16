export const beacon = (path, input) => {

  const url = new URL(path, window.location.origin)
  url.searchParams.append("id", input)
  return navigator.sendBeacon(url.href)
}
export const post = (path, input) => {

  return new Promise(async(resolve, reject) => {
    try {
      if (input === undefined) input = {}
      input.location = window.location.href
      input.referer = document.referrer
      input.localStorageEmail = window.localStorage.getItem("email")
      input.localStorageId = window.localStorage.getItem("localStorageId")
      const xhr = new XMLHttpRequest()
      xhr.open("POST", path)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.withCredentials = true
      xhr.onload = () => resolve(xhr)
      xhr.send(JSON.stringify(input))
    } catch (error) {
      reject(error)
    }
  })
}
export const postFormData = (path, formData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (formData === undefined) formData = new FormData()
      const body = {}
      body.location = window.location.href
      body.referer = document.referrer
      body.localStorageEmail = window.localStorage.getItem("email")
      body.localStorageId = window.localStorage.getItem("localStorageId")
      const jsonBlob = new Blob([JSON.stringify(body)], { type: "application/json" })
      formData.append("file", jsonBlob) 
      const xhr = new XMLHttpRequest()
      xhr.open("POST", path)
      xhr.withCredentials = true
      xhr.onload = () => resolve(xhr)
      xhr.send(formData)
    } catch (error) {
      reject(error)
    }
  })
}
export const text = path => {

  return new Promise(async(resolve, reject) => {
    try {
      fetch(path).then(res => res.text()).then(text => resolve(text))
    } catch (error) {
      reject(error)
    }
  })
}
