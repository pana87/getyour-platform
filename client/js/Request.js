export const Request = {}
Request.text = url => {

  return new Promise(async(resolve, reject) => {
    try {
      fetch(url).then(res => res.text()).then(text => resolve(text))
    } catch (error) {
      reject(error)
    }
  })
}
