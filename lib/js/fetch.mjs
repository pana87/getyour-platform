export function _signIn(accountId) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${window.__URL__}/api/signin`)

    xhr.setRequestHeader("Accept", "application/json")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.overrideMimeType("text/html")

    xhr.onload = () => resolve(xhr.responseText)

    xhr.send(JSON.stringify({accountId}))
  })
}
