require('dotenv').config()
const jwt = require('jsonwebtoken')
const cbor = require('cbor')
const crypto = require("node:crypto")
const { platformLocation } = require('../config/Location.js')
const Notification = require('./Notification.js')
const jsrsasign = require('jsrsasign');
const ed = require("@noble/ed25519")
const jwkToPem = require("jwk-to-pem")
const Storage = require('../config/Storage.js')
const { User } = require('./domain/User.js')
const SECURITY_WARNING = "SECURITY_WARNING"
const NOT_IMPLEMENTED_YET = "NOT_IMPLEMENTED_YET"

const SUPPORTED_WEBAUTHN_ATTESTATION_STATEMENTS = [
  "none",
  "packed",
  "tpm",
  "android-key",
  "android-safetynet",
  "fido-u2f",
  "apple"
]

const COSERSASCHEME = {
  '-3': 'pss-sha256',
  '-39': 'pss-sha512',
  '-38': 'pss-sha384',
  '-65535': 'pkcs1-sha1',
  '-257': 'pkcs1-sha256',
  '-258': 'pkcs1-sha384',
  '-259': 'pkcs1-sha512'
}

const COSECRV = {
  '1': 'p256',
  '2': 'p384',
  '3': 'p521'
}

const COSEKTY = {
  'OKP': 1,
  'EC2': 2,
  'RSA': 3
}

const COSEKEYS = {
  'kty' : 1,
  'alg' : 3,
  'crv' : -1,
  'x'   : -2,
  'y'   : -3,
  'n'   : -1,
  'e'   : -2
}

const COSEALGHASH = {
  '-257': 'sha256',
  '-258': 'sha384',
  '-259': 'sha512',
  '-65535': 'sha1',
  '-39': 'sha512',
  '-38': 'sha384',
  '-37': 'sha256',
  '-260': 'sha256',
  '-261': 'sha512',
  '-7': 'sha256',
  '-36': 'sha512'
}

module.exports = class AuthServer {

  static async verifyAssertion(options) {
    const {rawId, userInput} = options
    const getUserByEmailRx = await Storage.getUserByEmail(userInput.email.value)
    const {credentialRecord} = getUserByEmailRx.user

    // 6.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const {id} = credentialRecord
    if (this.hash("sha256", Uint8Array.from(rawId)).toString("base64url") !== this.hash("sha256", Uint8Array.from(id)).toString("base64url")) {
      Notification.error(SECURITY_WARNING)
      return {
        status: 500,
        message: "USER_ID_MISMATCH",
      }
    }
    const {userHandle} = options
    const expectedUserHandle = credentialRecord.userHandle
    if (userHandle) {
      if (this.hash("sha256", Uint8Array.from(userHandle)).toString("base64url") !== this.hash("sha256", Uint8Array.from(expectedUserHandle)).toString("base64url")) {
        return {
          status: 500,
          message: "USER_HANDLE_MISMATCH"
        }
      }
    }

    // 7.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const {clientDataJSON} = options
    // 8.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    // 9.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const cData = JSON.parse(new TextDecoder().decode(this.objectToUint8Array(clientDataJSON).buffer))

    // 10.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    if (cData.type !== "webauthn.get") {
      Notification.error(SECURITY_WARNING)
      return {
        status: 500,
        message: "WRONG_METHOD_TYPE"
      }
    }

    // 11.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const {expectedUserChallenge} = options
    if (cData.challenge !== Buffer.from(this.objectToUint8Array(expectedUserChallenge).buffer).toString("base64url")) {
      Notification.error(SECURITY_WARNING)
      return {
        status: 500,
        message: "WRONG_CHALLENGE"
      }
    }

    // 12.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    if (cData.origin !== platformLocation.origin) {
      Notification.error(SECURITY_WARNING)
      return {
        status: 500,
        message: "WRONG_ORIGIN"
      }
    }

    // 13.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const expectedRPIDHash = this.hash("sha256", platformLocation.hostname)
    const {rpIdHash} = options
    if (Buffer.from(this.objectToUint8Array(rpIdHash).buffer).toString("base64url") !== expectedRPIDHash.toString("base64url")) {
      Notification.error(SECURITY_WARNING)
      return {
        status: 500,
        message: "RPID_HASH_MISMATCH"
      }
    }

    // 14.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const {flags} = options
    if (flags.up === false) {
      Notification.error(SECURITY_WARNING)
      return {
        status: 500,
        message: "USER_PRESENCE_MISSING"
      }
    }

    // 15.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    if (flags.uv === false) {
      Notification.error(SECURITY_WARNING)
      return {
        status: 500,
        message: "USER_VERIFICATION_MISSING"
      }
    }
    // 16.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    // if (flags.be !== false) {
    //   Notification.error(SECURITY_WARNING)
    //   return {
    //     status: 500,
    //     message: "BACKUP_ELIGIBLE_MISSING"
    //   }
    // }
    // if (flags.bs !== false) {
    //   Notification.error(SECURITY_WARNING)
    //   return {
    //     status: 500,
    //     message: "BACKUP_STATE_MISSING"
    //   }
    // }
    const {backupEligible, backupState} = credentialRecord
    if (flags.be !== backupEligible || flags.bs !== backupState) {
      Notification.error(SECURITY_WARNING)
      return {
        status: 500,
        message: "BACKUP_WRONG_POLICY_IN_FLAGS"
      }
    }

    // 17.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    // not implemented yet

    // 18.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const {publicKey} = credentialRecord
    const {authenticatorData, signature} = options
    const hash = Array.from(new Uint8Array(this.hash("sha256", Uint8Array.from(clientDataJSON))))
    const signatureBase = authenticatorData.concat(hash)

    // 19.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const verifyAssertionSignatureRx = await this.verifyAssertionSignature({
      coseArray: publicKey,
      signature: signature,
      signatureBase: signatureBase,
    })
    if (verifyAssertionSignatureRx.status !== 200) {
      return {
        status: 500,
        message: "ASSERTION_SIGNATURE_INVALID"
      }
    }

    // 20.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const {signCount} = options
    if (signCount !== 0 || credentialRecord.signCount !== 0) {
      if (signCount <= credentialRecord.signCount) {
        return {
          status: 500,
          message: "AUTHENTICATOR_MAY_BE_CLONED",
        }
      }
    }

    // 21.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    if (flags.at === true) {
      Notification.info(NOT_IMPLEMENTED_YET)
    }

    // 22.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
    const {user} = getUserByEmailRx
    user.credentialRecord.signCount = signCount
    user.credentialRecord.backupState = backupState
    const userUpdateRx = await User.update(user)
    if (userUpdateRx.status !== 200) return { status: 500, message: "USER_UPDATE_ABORT", }

    return {
      status: 200,
      message: "ASSERTION_VERIFIED_SUCCESSFULLY"
    }
  }

  static sortedObjectToArray(object) {
    let array = []
    for (let key in object) {
      array.push(object[key])
    }
    return array
  }

  static getCertificateInfo = (certificate) => {
    let subjectCert = new jsrsasign.X509();
    subjectCert.readCertPEM(certificate);

    let subjectString = subjectCert.getSubjectString();
    let subjectParts  = subjectString.slice(1).split('/');

    let subject = {};
    for(let field of subjectParts) {
        let kv = field.split('=');
        subject[kv[0]] = kv[1];
    }

    let version = subjectCert.version;
    let basicConstraintsCA = !!subjectCert.getExtBasicConstraints().cA;

    return {
        subject, version, basicConstraintsCA
    }
  }

  static base64ToPem = (b64cert) => {
    let pemcert = '';
    for(let i = 0; i < b64cert.length; i += 64)
        pemcert += b64cert.slice(i, i + 64) + '\n';

    return '-----BEGIN CERTIFICATE-----\n' + pemcert + '-----END CERTIFICATE-----';
  }

  static objectToUint8Array(object) {
    return Uint8Array.from(this.sortedObjectToArray(object))
  }

  static async verifyAttestation(options) {
    const {
      // flags,
      // rpIdHash,
      // userChallenge,
      // credentialId,
      signCount,
      userHandle,
      pubKeyParams,
      transports,
      // attestationClientDataJSON,
      // attestationObject,
      publicKey,
      id,
      type,
      // userInput,
    } = options

    // 7.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const {attestationClientDataJSON, attestationObject} = options
    const decodedClientDataJSON = JSON.parse(new TextDecoder().decode(Uint8Array.from(this.sortedObjectToArray(attestationClientDataJSON))))
    const decodedAttestationObject = cbor.decode(Uint8Array.from(this.sortedObjectToArray(attestationObject)).buffer)
    options.decodedAttestationObject = decodedAttestationObject
    if (decodedClientDataJSON.type !== "webauthn.create") {
      Notification.error(`Someone used the wrong authentication method for registration: '${decodedAttestationObject.type}'`)
      return {
        status: 500,
        message: "WRONG_METHOD_TYPE"
      }
    }

    // 8.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const {userChallenge} = options
    if (decodedClientDataJSON.challenge !== Buffer.from(userChallenge).toString("base64url")) {
      Notification.error(`Wrong challenge provided. Response has been changed by someone in the middle.`)
      return {
        status: 500,
        message: "WRONG_CHALLENGE"
      }
    }

    // 9.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const {userInput} = options
    if (decodedClientDataJSON.origin !== platformLocation.origin) {
      Notification.error(`Someone tried to phish the user: '${userInput.email.value}'`)
      return {
        status: 500,
        message: "WRONG_ORIGIN"
      }
    }

    // 10.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const clientDataHash = this.hash("sha256", JSON.stringify(attestationClientDataJSON))
    options.clientDataHash = clientDataHash

    // 12.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const {rpIdHash} = options
    const expectedRPIDHash = this.hash("sha256", platformLocation.hostname)
    if (Buffer.from(this.objectToUint8Array(rpIdHash).buffer).toString("base64url") !== expectedRPIDHash.toString("base64url")) {
      Notification.error(`Someone tried to register from a different domain.`)
      return {
        status: 500,
        message: "RPID_HASH_MISMATCH"
      }
    }

    // 13.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const {flags} = options
    if (flags.up !== true) {
      Notification.error(`User presence is required.`)
      return {
        status: 500,
        message: "NO_USER_PRESENCE"
      }
    }

    // 14.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    if (flags.uv !== true) {
      Notification.error(`User verification is required.`)
      return {
        status: 500,
        message: "NO_USER_VERIFICATION"
      }
    }

    // // 15.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    // if (flags.be !== true) {
    //   Notification.error(`Backup eligible is required.`)
    //   return {
    //     status: 500,
    //     message: "NO_BACKUP_ELIGIBLE"
    //   }
    // }
    // // 16.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    // if (flags.bs !== true) {
    //   Notification.error(`Backup state is required.`)
    //   return {
    //     status: 500,
    //     message: "NO_BACKUP_STATE"
    //   }
    // }

    // 17.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    // const algParam = pubKeyCredParams.find(element => element.alg === attestationObject.attStmt.alg)
    // if (algParam === undefined) {
    //   Notification.error(`No prefered algorithm was set.`)
    //   return {
    //     status: 500,
    //     message: "NO_ALG_SET"
    //   }
    // }

    // 18.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    if (flags.ed !== false) {
      Notification.error(`Authenticator added extenstions without permission.`)
      return {
        status: 500,
        message: "EXTENSIONS_ADDED"
      }
    }

    // 19.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const fmtStatement = SUPPORTED_WEBAUTHN_ATTESTATION_STATEMENTS.find(element => element === decodedAttestationObject.fmt)
    if (fmtStatement === undefined) {
      Notification.error(`No supported fmt was found.`)
      return {
        status: 500,
        message: "NO_SUPPORTED_FMT_FOUND"
      }
    }

    // 20.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    let signatureVerified = false
    if (decodedAttestationObject.fmt === 'fido-u2f') {
      signatureVerified = await this.verifyAttestationFIDOU2F(options);
    } else if (decodedAttestationObject.fmt === 'packed') {
      signatureVerified = await this.verifyAttestationPacked(options);
    } else if (decodedAttestationObject.fmt === 'android-safetynet') {
      signatureVerified = await this.verifyAttestationAndroidSafetyNet(options);
    } else if (decodedAttestationObject.fmt === 'android-key') {
      signatureVerified = await this.verifyAttestationAndroidKey(options);
    } else if (decodedAttestationObject.fmt === 'tpm') {
      signatureVerified = await this.verifyAttestationTPM(options);
    } else if (decodedAttestationObject.fmt === 'apple') {
      signatureVerified = await this.verifyAttestationApple(options);
    } else if (decodedAttestationObject.fmt === 'none') {
      if (Object.keys(decodedAttestationObject.attStmt).length > 0) {
        Notification.error(`None attestation had unexpected attestation statement`)
        return {
          status: 500,
          message: "UNEXPECTED_ATTESTATION_STATEMENT"
        }
      }
      // 22.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
      signatureVerified = true
    } else {
      Notification.error(`Unsupported Attestation Format: ${decodedAttestationObject.fmt}`)
      return {
        status: 500,
        message: "UNSUPPORTED_ATTESTATION_FORMAT"
      }
    }

    if (!signatureVerified) {
      Notification.warn(`Signature for attestation could not be verified.`)
    }

    // 23.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const {credentialId} = options
    const credentialIdByteLength = Uint8Array.from(this.objectToUint8Array(credentialId)).byteLength
    if (credentialIdByteLength > 1023) {
      Notification.error(`Received credential id with ${credentialIdByteLength} bytes which is greater than 1023 bytes.`)
      return {
        status: 500,
        message: "CRED_ID_TOO_LONG"
      }
    }

    // 24.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const {users} = await User.getAll()
    for (let i = 0; i < users.length; i++) {
      if (users[i].credentialRecord.id === id) {
        Notification.error(`Try to register user but already exists.`)
        return {
          status: 500,
          message: "USER_EXISTS"
        }
      }
    }

    // 25.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
    const newUser = {
      email: { value: userInput.email.value, verified: false },
      credentialRecord: {
        type: type,
        id: id,
        userHandle: Array.from(userHandle),
        publicKey: this.sortedObjectToArray(publicKey),
        transports: transports,
        signCount: signCount,
        backupEligible: flags.be,
        backupState: flags.bs,
        attestationObject: attestationObject,
        attestationClientDataJSON: attestationClientDataJSON,
      },
    }
    const userStoreRx = await User.store(newUser)
    if (userStoreRx.status !== 200) {
      return {
        status: 500,
        message: "USER_STORE_ABORT",
      }
    }

    return {
      status: 200,
      message: "ATTESTATION_VERIFICATION_SUCCESSFUL",
    }
  }

  static verifyAttestationFIDOU2F(credential) {
    Notification.warn("Attestation not implemented yet. (fido-u2f)")
    return true
  }

  static async verifyAttestationPacked(options) {
    const {decodedAttestationObject, clientDataHash, publicKey} = options
    const { sig, x5c, alg } = decodedAttestationObject.attStmt
    let verified = false
    if (!sig) {
      Notification.error('No attestation signature provided in attestation statement (Packed)')
      return verified
    }

    if (typeof alg !== 'number') {
      Notification.error(`Attestation Statement alg "${alg}" is not a number (Packed)`)
      return verified
    }

    if (x5c) {
      Notification.warn("Attestation x5c not implemented yet. (packed)")
      verified = true
      return verified
    }

    verified = await this.verifyAttestationSignature({
      signature: Uint8Array.from(this.sortedObjectToArray(sig)),
      signatureBase: Buffer.concat([Uint8Array.from(decodedAttestationObject.authData), Uint8Array.from(clientDataHash)]),
      coseArray: this.sortedObjectToArray(publicKey),
      hashAlgorithm: COSEALGHASH[alg],
    })
    return verified
  }

  static async verifyAttestationSignature(options) {
    const {signature, signatureBase, publicKey} = options
    let verified = false
    // let coseObject
    // try {
    //   coseObject = cbor.decodeAllSync(Uint8Array.from(coseArray))[0]
    // } catch (err) {
    //   Notification.error(`Error decoding public key while verify signature: ${err.message}`)
    //   return verified
    // }

    // const kty = coseObject.get(COSEKEYS.kty)
    // if (!kty) {
    //   Notification.error("Public key was missing kty. (packed)")
    //   return verified
    // }

    // let publicKeyPEM = ""
    // if (kty === COSEKTY.OKP) {
    //   const x = coseObject.get(COSEKEYS.x);
    //   if (!x) {
    //     Notification.error("Public key was missing x (OKP)")
    //     return verified
    //   }

    //   return await ed.verify(signature, signatureBase, x)
    // } else {
    //   publicKeyPEM = this.convertCoseToPEM(coseArray)
    //   if (publicKeyPEM === undefined) {
    //     Notification.error(`Could not convert public key type ${kty} to PEM`)
    //     return verified
    //   }
    // }
    // console.log(publicKey);
    // return crypto.createVerify("sha256").update(Uint8Array.from(signatureBase)).verify(Uint8Array.from(publicKey), Uint8Array.from(signature))
    return verified
  }


  static async verifyAssertionSignature(options) {
    const {coseArray, signature, signatureBase} = options
    let coseObject
    try {
      coseObject = cbor.decodeAllSync(Uint8Array.from(coseArray))[0]
    } catch (err) {
      Notification.error(`Error decoding public key while verify signature: ${err.message}`)
      return {
        status: 500,
        message: "ERROR_DECODING_PUBLIC_KEY",
      }
    }

    const hashAlgorithm = COSEALGHASH[coseObject.get(COSEKEYS.alg)]

    const kty = coseObject.get(COSEKEYS.kty)
    if (!kty) {
      Notification.error("Public key was missing kty. (packed)")
      return {
        status: 500,
        message: "MISSING_KTY_IN_PUBLIC_KEY",
      }
    }

    let publicKeyPEM = ""
    if (kty === COSEKTY.OKP) {
      const x = coseObject.get(COSEKEYS.x);
      if (!x) {
        Notification.error("Public key was missing x (OKP)")
        return {
          status: 500,
          message: "MISSING_X_IN_PUBLIC_KEY",
        }
      }
      return await ed.verify(signature, signatureBase, x)
    } else {
      publicKeyPEM = this.convertCoseToPEM(coseArray)
      if (publicKeyPEM === undefined) {
        Notification.error(`Could not convert public key type ${kty} to PEM`)
        return {
          status: 500,
          message: "ERROR_CONVERTING_PUBLIC_KEY_TO_PEM",
        }
      }
    }

    try {
      crypto.createVerify(hashAlgorithm).update(Uint8Array.from(signatureBase)).verify(publicKeyPEM, Uint8Array.from(signature))
    } catch (error) {
      Notification.error(`Could not verify signature.`)
      console.error(error);
      return {
        status: 500,
        message: "SIGNATURE_VERIFICATION_FAILED",
      }
    }

    return {
      status: 200,
      message: "SIGNATURE_VERIFIED",
      verified: true,
    }
  }

  static convertCoseToPEM(coseArray) {
    let coseObject
    try {
      coseObject = cbor.decodeAllSync(Uint8Array.from(coseArray))[0]
    } catch (err) {
      Notification.error(`Error decoding public key while converting to PEM: ${err.message}`)
      return undefined
    }

    const kty = coseObject.get(COSEKEYS.kty);

    if (!kty) {
      Notification.error("Public key was missing kty. (packed)")
      return undefined
    }

    if (kty === COSEKTY.EC2) {
      const crv = coseObject.get(COSEKEYS.crv)
      const x = coseObject.get(COSEKEYS.x)
      const y = coseObject.get(COSEKEYS.y)

      if (!crv) {
        Notification.error(`Public key was missing crv (EC2)`)
        return undefined
      }

      if (!x) {
        Notification.error(`Public key was missing x (EC2)`)
        return undefined
      }

      if (!y) {
        Notification.error(`Public key was missing y (EC2)`)
        return undefined
      }

      const ecPEM = jwkToPem({
        kty: 'EC',
        crv: COSECRV[crv].replace('p', 'P-'),
        x: Buffer.from(x).toString('base64'),
        y: Buffer.from(y).toString('base64'),
      })
      return ecPEM

    } else if (kty === COSEKTY.RSA) {
      const n = coseObject.get(COSEKEYS.n)
      const e = coseObject.get(COSEKEYS.e)

      if (!n) {
        Notification.error(`Public key was missing n (RSA)`)
        return undefined
      }

      if (!e) {
        Notification.error(`Public key was missing e (RSA)`)
        return undefined
      }

      const rsaPEM = jwkToPem({
        kty: 'RSA',
        n: Buffer.from(n).toString('base64'),
        e: Buffer.from(e).toString('base64'),
      })

      return rsaPEM
    }
    return undefined
  }

  static verifyAttestationAndroidSafetyNet(credential) {
    Notification.warn("Attestation not implemented yet. (android-safetynet)")
    return true
  }

  static verifyAttestationAndroidKey(credential) {
    Notification.warn("Attestation not implemented yet. (android-key)")
    return true
  }

  static verifyAttestationTPM(credential) {
    Notification.warn("Attestation not implemented yet. (tpm)")
    return true
  }

  static verifyAttestationApple(credential) {
    Notification.warn("Attestation not implemented yet. (apple)")
    return true
  }

  static hash(algorithm, message) {
    return crypto.createHash(algorithm).update(message).digest();
  }

  static uint8ArrayToBufferJson(uint8Array) {
    return JSON.stringify(Buffer.from(uint8Array))
  }

  static sign(user) {
    return jwt.sign({
      name: user.name,
      roles: user.roles,
    }, process.env.JWT_SECRET, { expiresIn: '1800s' })
  }

  static verify(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.send({ status: 401, body: "Unauthorized" })

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      console.log(err)

      if (err) return res.send({ status: 403, body: "Forbidden" })

      req.user = user
      next()
    })
  }
}

