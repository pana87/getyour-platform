import { CBORDecoder } from "./CBORDecoder.js"
import { EndPoints } from "./EndPoints.js"
import { Helper } from "./Helper.js"
const NOT_VALID_AUTHENTICATOR = "Der Authenticator auf deinem Gerentspricht nicht den Sicherheitsstandards."
const REGISTRATION_ABORTED_DUE_TO_SECURITY_ISSUES = "Aus Sicherheitsgründen musste die Registrierung abgebrochen werden. Bitte kontaktiere den Support unter: 'datenschutz@get-your.de'"
const AUTHENTICATION_ABORTED_DUE_TO_SECURITY_ISSUES = "Aus Sicherheitsgründen musste die Anmeldung abgebrochen werden. Bitte kontaktiere den Support unter: 'datenschutz@get-your.de'"
// import {Compressor} from "compressorjs"



export class Request {

  // static async storeUser(object) {
  //   const id = await Request.userEmail()
  //   return new Promise((resolve, reject) => {
  //     const xhr = new XMLHttpRequest()
  //     xhr.open("POST", `${window.__DATABASE_LOCATION__}/request/store/user/`)
  //     xhr.setRequestHeader("Accept", "application/json")
  //     xhr.setRequestHeader("Content-Type", "application/json")
  //     xhr.overrideMimeType("text/html")
  //     xhr.onload = () => {
  //       const response = JSON.parse(xhr.response)
  //       if (response.status === 200) {
  //         console.info("User stored..")
  //         return resolve()
  //       }
  //       console.error(response.message)
  //     }
  //     xhr.send(JSON.stringify({ id, object }))
  //   })
  // }

  static userDigest() {
    return new Promise((resolve, reject) => {
      const digest = window.sessionStorage.getItem("digest")
      if (digest !== null) return resolve(digest)
      console.error("NO_DIGEST_FOUND")
      window.location.assign("/zugang/")
    })
  }

  static async storePassword(password) {
    const id = await Request.userEmail()
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__DATABASE_LOCATION__}/request/store/password/`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.onload = () => {
        const response = JSON.parse(xhr.response)
        if (response.status === 200) {
          console.info("Password stored..")
          return resolve()
        }
        console.error(response.message)
      }
      xhr.send(JSON.stringify({ id, password }))
    })
  }

  static async storeName(name) {
    const id = await Request.userEmail()
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__DATABASE_LOCATION__}/request/store/name/`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.onload = () => {
        const response = JSON.parse(xhr.response)
        if (response.status === 200) {
          console.info("Name stored..")
          return resolve()
        }
        console.error(response.message)
      }
      xhr.send(JSON.stringify({ id, name }))
    })
  }

  static userEmail() {
    return new Promise((resolve, reject) => {
      const email = window.localStorage.getItem("email")
      if (email !== null) return resolve(email)
      console.error("NO_EMAIL_FOUND")
      window.location.assign("/zugang/")
    })
  }

  static async storeRoles(roles) {
    const id = await Request.userEmail()
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__DATABASE_LOCATION__}/request/store/roles/`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.onload = () => {
        const response = JSON.parse(xhr.response)
        if (response.status === 200) {
          console.info("Roles stored..")
          return resolve()
        }
        console.error(response.message)
      }
      xhr.send(JSON.stringify({ id, roles }))
    })
  }

  static storeEmail(email) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__DATABASE_LOCATION__}/request/store/email/`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.onload = () => {
        const response = JSON.parse(xhr.response)
        if (response.status === 200) {
          console.info("Email stored..")
          return resolve()
        }
        console.error(response.message)
      }
      xhr.send(JSON.stringify({ email }))
    })
  }

  static async storeToLocalstorage(key, value) {
    if (key !== undefined && value !== undefined) {
      window.localStorage.setItem(key, value)
      const message = JSON.stringify(window.localStorage)
      const digest = await Helper.digest(message)
      window.sessionStorage.setItem("digest", digest)
    }
  }

  static verifyPin(pin) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__AUTH_LOCATION__}/request/verify/pin/`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.onload = () => {
        const response = JSON.parse(xhr.response)
        if (response.status === 200) {
          console.info("Email verified..")
          return resolve()
        }
        console.error(response.message)
      }
      xhr.send(JSON.stringify({ pin }))
    })
  }

  static verifyEmail(email) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__AUTH_LOCATION__}/request/verify/email/`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.onload = () => {
        const response = JSON.parse(xhr.response)
        if (response.status === 200) {
          console.info("Email verification started..")
          return resolve()
        }
        console.error(response.message)
      }
      xhr.send(JSON.stringify({ email }))
    })
  }

  static sendFile(file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `/send/file/`)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText)
        return resolve({
          status: 200,
          message: "FILE_SEND",
          blob: response.blob
        })
      }


      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener("loadend", (event) => {
        xhr.send(JSON.stringify({
          blob: reader.result
        }))
      })
    })
  }


  static component(pathname) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("GET", `${window.__COMPONENTS_LOCATION__.origin}${pathname}`)
      xhr.onload = () => {
        if (xhr.status !== 200) return resolve({ status: 500, message: "REQUEST_COMPONENT_FAILED" })

        return resolve({
          status: 200,
          message: "REQUEST_COMPONENT_SUCCESS",
          html: xhr.responseText,
        })
      }

      xhr.send()
    })
  }

  static userAuthenticationVerification(assertion) {
    return new Promise( async (resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__AUTH_LOCATION__.origin}/user/authentication/verification/`)

      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.withCredentials = true

      xhr.onload = () => {
        resolve({
          status: 200,
          message: "USER_AUTHENTICATION_VERIFICATION_SUCCESS",
          response: JSON.parse(xhr.responseText),
        })

      }

      const {response, allowCredentials, rawId, userInput} = assertion
      const {userHandle, clientDataJSON, authenticatorData, signature} = response

      // 3.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
      if (response.constructor.name !== "AuthenticatorAssertionResponse") {
        alert(NOT_VALID_AUTHENTICATOR + "\n\nNOT_A_AUTHENTICATION_RESPONSE_OBJECT")
        return reject({
          status: 500,
          message: "NO_VALID_AUTHENTICATOR",
        })
      }

      // 4.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
      const clientExtensionResults = assertion.getClientExtensionResults()

      // 5.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
      const utf8DecodedClientDataJSON = new TextDecoder("utf-8").decode(clientDataJSON)

      // 6.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
      if (!Helper.isJson(utf8DecodedClientDataJSON)) {
        alert(REGISTRATION_ABORTED_DUE_TO_SECURITY_ISSUES)
        return reject({
          status: 500,
          message: "NO_VALID_AUTHENTICATOR",
        })
      }

      // // 7.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
      let buffer = new Uint8Array(authenticatorData)

      if(buffer.byteLength < 37) throw new Error('Authenticator Data must be at least 37 bytes long!');

      const rpIdHash = buffer.slice(0, 32)
      buffer = buffer.slice(32)

      const flagsBuffer = buffer.slice(0, 1)
      const flagsInt = flagsBuffer[0]
      const flags = {
        up: !!(flagsInt & (1 << 0)), // User Presence
        uv: !!(flagsInt & (1 << 2)), // User Verified
        be: !!(flagsInt & (1 << 3)), // Backup Eligibility
        bs: !!(flagsInt & (1 << 4)), // Backup State
        at: !!(flagsInt & (1 << 6)), // Attested Credential Data Present
        ed: !!(flagsInt & (1 << 7)), // Extension Data Present
        flagsInt,
      };
      buffer = buffer.slice(1)

      let counterBuffer = buffer.slice(0, 4);
      let signCount = new DataView(counterBuffer.buffer).getUint32(0)
      buffer = buffer.slice(4);

      return xhr.send(JSON.stringify({
        userInput: userInput,
        rawId: Array.from(new Uint8Array(rawId)),
        userHandle: Array.from(new Uint8Array(userHandle)),
        clientDataJSON: Array.from(new Uint8Array(clientDataJSON)),
        authenticatorData: Array.from(new Uint8Array(authenticatorData)),
        signature: Array.from(new Uint8Array(signature)),
        rpIdHash: Array.from(new Uint8Array(rpIdHash)),
        flags: flags,
        signCount,
      }))
    })
  }

  static publicKeyCredentialRequestOptions(user) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__AUTH_LOCATION__.origin}/public-key/credential/request/options/`)

      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.withCredentials = true

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText)
        if (response.status === 500) {
          alert("Du musst dich erst registrieren.")
          return
        }
        const {publicKeyCredentialRequestOptions} = response
        const {publicKey} = publicKeyCredentialRequestOptions
        const {challenge, allowCredentials, rpId, timeout, userVerification} = publicKey

        resolve({
          publicKey: {
            challenge: Uint8Array.from(challenge),
            rpId: rpId,
            allowCredentials: [{
              id: Uint8Array.from(allowCredentials[0].id),
              type: allowCredentials[0].type,
            }],
            userVerification: userVerification,
          }
        })
      }
      xhr.send(JSON.stringify(user))
    })
  }

  static userRegistrationVerification(attestation) {
    return new Promise( async (resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__AUTH_LOCATION__.origin}/user/registration/verification/`)

      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.withCredentials = true

      xhr.onload = () => resolve(xhr.responseText)

      const {response, userInput} = attestation
      const {clientDataJSON, attestationObject} = response

      // 3.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      if (response.constructor.name !== "AuthenticatorAttestationResponse") {
        alert(REGISTRATION_ABORTED_DUE_TO_SECURITY_ISSUES)
        return
      }

      // 4.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      const clientExtensionResults = attestation.getClientExtensionResults()

      // 5.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      const utf8DecodedClientDataJSON = new TextDecoder("utf-8").decode(clientDataJSON)

      // 6.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      if (!Helper.isJson(utf8DecodedClientDataJSON)) {
        alert(REGISTRATION_ABORTED_DUE_TO_SECURITY_ISSUES)
        return
      }

      // 11.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      const cborDecoder = new CBORDecoder()
      const cborDecodecAttestationObject = await cborDecoder.decode(attestationObject)

      const {authData} = cborDecodecAttestationObject

      let buffer = new Uint8Array(authData)

      if(buffer.byteLength < 37) throw new Error('Authenticator Data must be at least 37 bytes long!');

      const rpIdHash = buffer.slice(0, 32)
      buffer = buffer.slice(32)

      const flagsBuffer = buffer.slice(0, 1)
      const flagsInt = flagsBuffer[0]
      const flags = {
        up: !!(flagsInt & (1 << 0)), // User Presence
        uv: !!(flagsInt & (1 << 2)), // User Verified
        be: !!(flagsInt & (1 << 3)), // Backup Eligibility
        bs: !!(flagsInt & (1 << 4)), // Backup State
        at: !!(flagsInt & (1 << 6)), // Attested Credential Data Present
        ed: !!(flagsInt & (1 << 7)), // Extension Data Present
        flagsInt,
      };
      buffer = buffer.slice(1)

      let counterBuffer = buffer.slice(0, 4);
      let counter = new DataView(counterBuffer.buffer).getUint32(0)
      buffer = buffer.slice(4);

      let aaguid = undefined;
      let aaguidBuffer = undefined;
      let credentialIdBuffer = undefined;
      let coseUint8 = undefined;
      let cosePublicKeyObject = undefined;
      let attestationMinLen = 16 + 2 + 16 + 42; // aaguid + credIdLen + credId + pk

      if (flags.at) {
        if(buffer.byteLength < attestationMinLen) throw new Error(`It seems as the Attestation Data flag is set, but the remaining data is smaller than ${attestationMinLen} bytes. You might have set AT flag for the assertion response.`)

        aaguid = buffer.slice(0, 16).toString('hex');
        aaguidBuffer = `${aaguid.slice(0, 8)}-${aaguid.slice(8, 12)}-${aaguid.slice(12, 16)}-${aaguid.slice(16, 20)}-${aaguid.slice(20)}`;
        buffer = buffer.slice(16);

        let credIdLenBuffer = buffer.slice(0, 2);
        buffer = buffer.slice(2);

        let credIdLen = new DataView(credIdLenBuffer.buffer).getUint16(0)
        credentialIdBuffer = buffer.slice(0, credIdLen);
        buffer = buffer.slice(credIdLen);

        let pubKeyLength = buffer.byteLength
        coseUint8 = buffer.slice(0, pubKeyLength);
        buffer = buffer.slice(pubKeyLength);

        cosePublicKeyObject = await new CBORDecoder().decode(coseUint8.buffer);

        // let coseExtensionsDataBuffer = undefined
        // if(extensionData) {
        //   const coseExtensionsDataBuffer = buffer.slice(0, buffer.byteLength);
        //   console.log("extensionsDataLength", extensionsDataLength);
        //   buffer = buffer.slice(extensionsDataLength);

        //   if(buffer.byteLength) throw new Error('Failed to decode authData! Leftover bytes been detected!')
        //   return xhr.send(JSON.stringify({
        //     clientDataJSON: clientDataJSON,
        //     rpIdHash: Array.from(rpIdHash),
        //     loginCounter: counter,
        //     flags: flags,
        //     counterBuffer: Array.from(counterBuffer),
        //     aaguid: aaguid,
        //     credentialIdBuffer: Array.from(credentialIdBuffer),
        //     cosePublicKey: Array.from(cosePublicKey),
        //     coseExtensionsDataBuffer: Array.from(coseExtensionsDataBuffer),
        //     user: user,
        //   }))
        // }
      }

      if(buffer.byteLength) throw new Error('Failed to decode authData! Leftover bytes been detected!')
      return xhr.send(JSON.stringify({
        type: attestation.type,
        id: Array.from(new Uint8Array(attestation.rawId)),
        publicKey: Array.from(coseUint8),
        signCount: counter,
        transports: attestation.response.getTransports(),
        backupEligible: flags.be,
        backupState: flags.bs,
        attestationObject: Array.from(new Uint8Array(attestationObject)),
        attestationClientDataJSON: Array.from(new Uint8Array(clientDataJSON)),
        rpIdHash: Array.from(new Uint8Array(rpIdHash)),
        flags: flags,
        credentialId: Array.from(new Uint8Array(credentialIdBuffer)),
        userInput: userInput,
      }))
    })
  }


  static publicKeyCredentialCreationOptions(user) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__AUTH_LOCATION__.origin}/public-key/credential/creation/options/`)

      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.withCredentials = true

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText)
        if (response.status !== 200) {
          return alert(`Registrierung fehlgeschlagen. \n\nError: ${response.message}`)
        }
        const { challenge, pubKeyCredParams, rp, user, } = response.options.publicKey

        if (response.status === 200) {
          resolve({
            publicKey: {
              challenge: Uint8Array.from(challenge),
              pubKeyCredParams: pubKeyCredParams,
              rp: rp,
              user: {
                id: Uint8Array.from(user.id),
                name: user.name,
                displayName: user.displayName,
              }
            }
          })
        }
      }
      xhr.send(JSON.stringify(user))
    })
  }

  static jwtToken(body) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${window.__AUTH_LOCATION__.origin}/request/jwt/token/`)

      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.withCredentials = true

      xhr.onload = () => {
        const {status, message, token} = JSON.parse(xhr.responseText)
        if (token === undefined) {
          return resolve({
            status: status,
            message: message,
          })
        }

        window.sessionStorage.setItem("token", token)
        return resolve({
          status: status,
          message: message,
          token: token,
        })
      }

      xhr.send(JSON.stringify(body))
    })
  }

  static jwtVerification(pathname) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const token = window.sessionStorage.getItem("token")
      if (!token) {
        alert("Kein Token vorhanden. Bitte einloggen!")
        window.location.assign(EndPoints.LOGIN)
        return
      }

      xhr.open("GET", pathname)
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)

      xhr.onload = (event) => {
        resolve(xhr.response)

        return resolve({
          status: 200,
          message: "ACCESS_GRANTED",
        })
      }

      xhr.send()
    })
  }
}
