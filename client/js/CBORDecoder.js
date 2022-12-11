export class CBORDecoder {
  script

  constructor() {
    this.script = document.createElement('script')
    this.script.src = "http://localhost:8888/js/cbor.js"
    document.head.appendChild(this.script)
  }

  decode(object) {
    return new Promise((resolve, reject) => {
      this.script.onload = () => {
        resolve(CBOR.decode(object))
      }
    })
  }
}
