import { Request } from "./Request.js";

export class AuthClient {

  static async getPublicKeyCredential(user) {
    // 1.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const publicKeyCredentialCreationOptionsRx = await Request.getPublicKeyCredentialCreationOptions(user)
    // 2.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    return await window.navigator.credentials.create(publicKeyCredentialCreationOptionsRx)
      .catch(error => {
        alert(`Das Anlegen eines Sicherheitsschlüssels ist erforderlich. \n\n${error}`)
        // window.location.reload()
      })
  }

  // static async getPublicKeyCredential({ id, challenge, email }) {
  //   // request options here from server
  //   return await window.navigator.credentials.create({
  //     publicKey: {
  //       rp: {
  //         name: "getyour platform",
  //         id: window.__PLATFORM_LOCATION__.hostname,
  //       },
  //       user: {
  //         id: id,
  //         name: email,
  //         displayName: email.split("@")[0]
  //       },
  //       pubKeyCredParams: [
  //         {
  //           type: "public-key",
  //           alg: -7
  //         },
  //         {
  //           type: "public-key",
  //           alg: -257
  //         }
  //       ],
  //       attestation: "direct",
  //       timeout: 60000,
  //       challenge: challenge,
  //       authenticatorSelection: {
  //         authenticatorAttachment: "platform",
  //       },
  //     }
  //   }).catch(error => {
  //     alert(`Das Anlegen eines Sicherheitsschlüssels ist erforderlich. \n\n${error}`)
  //     window.location.reload()
  //   })
  // }

  static arrayBufferToJson(arrayBuffer) {
    return JSON.stringify(Array.from(new Uint8Array(arrayBuffer)))

  }

  static bufferJsonToUint8Array(bufferJson) {
    return Uint8Array.from(JSON.parse(bufferJson).data)
  }

  static async wrap(key) {

    let encAlgo = {
        name:"AES-GCM",
        length:256
    };
    let wrapAlgo = {
        name:"AES-GCM",
        length:256
    };
    let aesGcmParams = {
        name:"AES-GCM",
        iv: window.crypto.getRandomValues(new Uint8Array(12))
    };
    let format = "jwk";
    let extractable=true;
    let keyUsages = ["encrypt", "decrypt"];

    let kek = await crypto.subtle.generateKey(
        wrapAlgo,
        false,
        ["wrapKey", "unwrapKey"]
    );

    // let key = await window.crypto.subtle.generateKey(
    //     encAlgo,
    //     extractable, // the key is extractable (i.e. can be used in exportKey)
    //     keyUsages
    // );
    // console.log("key (CryptoKey)", key);
    // console.log("key (jwk)", await crypto.subtle.exportKey("jwk", key));


    let wrappedKey = await crypto.subtle.wrapKey(
      format,
      key,
      kek,
      aesGcmParams
    );
    // console.log("wrappedKey (ArrayBuffer)", wrappedKey);


    const enc = new TextEncoder().encode(wrappedKey)
    // console.log(enc);
    // console.log(JSON.stringify(enc));
    // const json = JSON.stringify(enc)
    const json = JSON.stringify(enc)
    // console.log(json);


    return {
      status: 200,
      wrappedKey: json
    }
  }


  // return {

  // }

  // static async wrap(keyToWrap) {
  //   const pin = await this.getPin();
  //   console.log(pin);
  //   const wrappingKey = await this.getWrapKey(pin)
  //   console.log(wrappingKey);

  //   // return

  //   const wrappedKey = await window.crypto.subtle.wrapKey("raw", keyToWrap, wrappingKey, "AES-KW");
  //   console.log(wrappedKey);
  // }

  static async getWrapKey(pin) {
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: window.crypto.getRandomValues(new Uint8Array(16)),
        iterations: 100000,
        hash: "SHA-256",
      },
      pin,
      { name: "AES-KW", length: 256 },
      true,
      ["wrapKey", "unwrapKey"]
    )
  }

  static async getPin() {
    const password = window.prompt("Bitte 4 stelligen Pin eingeben.")
    const enc = new TextEncoder();
    return await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    )
  }

  // static async generateWrappingKey() {
  //   return await window.crypto.subtle.generateKey(
  //     {
  //       name: "AES-GCM",
  //       length: 256
  //     },
  //     true,
  //     ["wrap", "unwrap"]
  //   )
  // }

  static async wrapKey(key, wrappingKey) {
    return await window.crypto.subtle.wrapKey("jwk", key, wrappingKey, { name: "RSA-OAEP" })
  }


  static async generateEncryptionKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    )
  }

  static async generateSigningKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: {name: "SHA-512"}
      },
      true,
      ["sign", "verify"]
    )
  }

  static async generateSigningKeyPair() {
    return await window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-384"
      }, true, ["sign", "verify"]
    )
  }

  static async generateEncryptionKeyPair() {
    return await window.crypto.subtle.generateKey({
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    }, true, ["encrypt", "decrypt"])
  }

  static encode(object) {
    return JSON.stringify(Array.from(new TextEncoder().encode(object)))
  }

  static decode(object) {
    return new TextDecoder().decode(object)
  }

  // static sign(user) {
  //   return jwt.sign({
  //     name: user.name,
  //     roles: user.roles,
  //   }, process.env.JWT_SECRET, { expiresIn: '1800s' })
  // }

  // static verify(req, res, next) {
  //   const authHeader = req.headers['authorization']
  //   // console.log(req.cookies);
  //   // console.log(req.headers);
  //   const token = authHeader && authHeader.split(' ')[1]

  //   // next()
  //   // return
  //   if (token == null) return res.send({ status: 401, body: "Unauthorized" })

  //   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //     console.log(err)

  //     if (err) return res.send({ status: 403, body: "Forbidden" })

  //     req.user = user
  //     next()
  //   })
  // }
}

