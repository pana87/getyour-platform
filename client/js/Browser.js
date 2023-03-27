import { CBORDecoder } from "./CBORDecoder.js"


export class Browser {

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
        alert("Der Authenticator auf deinem Gerentspricht nicht den Sicherheitsstandards." + "\n\nNOT_A_AUTHENTICATION_RESPONSE_OBJECT")
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
        alert("Aus Sicherheitsgründen musste die Registrierung abgebrochen werden. Bitte kontaktiere den Support unter: 'datenschutz@get-your.de'")
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
        alert("Aus Sicherheitsgründen musste die Registrierung abgebrochen werden. Bitte kontaktiere den Support unter: 'datenschutz@get-your.de'")
        return
      }

      // 4.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      const clientExtensionResults = attestation.getClientExtensionResults()

      // 5.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      const utf8DecodedClientDataJSON = new TextDecoder("utf-8").decode(clientDataJSON)

      // 6.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      if (!Helper.isJson(utf8DecodedClientDataJSON)) {
        alert("Aus Sicherheitsgründen musste die Registrierung abgebrochen werden. Bitte kontaktiere den Support unter: 'datenschutz@get-your.de'")
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
}
