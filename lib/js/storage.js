import { Funnel } from "./Funnel.js"
import { Platform } from "./Platform.js"

export function _storePlatform(platformName) {
  const platforms = JSON.parse(window.localStorage.getItem("platforms")) || []
  if (platforms.filter(it => it.name === platformName).length > 0) {
    return {
      status: "500",
      body: console.info(`Platform 'name:${platformName}' already exists.`),
    }
  }
  platforms.push({ name: platformName })
  window.localStorage.setItem("platforms", JSON.stringify(platforms))
  return {
    status: "200",
    body: console.info(`Stored 'name:${platformName}' in 'platforms'. -`, JSON.stringify(window.localStorage)),
  }
}

export function _storeFunnel(platformName, funnelName) {
  const platforms = JSON.parse(window.localStorage.getItem("platforms")) || []
  if (platforms.filter(it => it.name === platformName).length > 1) {
    return {
      status: "500",
      body: console.info(`Duplicate warning Platform 'name:${platformName}' in 'list:platforms'`)
    }
  }

  const platform = platforms.filter(it => it.name === platformName)[0]
  if (!platform.funnels) {
    platform.funnels = []
  }

  if (platform.funnels.filter(it => it.name === funnelName).length > 0) {
    return {
      status: "500",
      body: console.info(`Funnel 'name:${funnelName}' already exists.`),
    }
  }

  platform.funnels.push({ name: funnelName })
  window.localStorage.setItem("platforms", JSON.stringify(platforms))
  return {
    status: "200",
    body: console.info(`Funnel 'name:${funnelName}' stored in Platform 'name:${platformName}' -`, JSON.stringify(window.localStorage)),
  }
}


export function _setFunnelByPlatform(platformName, funnelName) {
  const platform = _getPlatformByName(platformName)
  if (!platform) {
    return {
      status: "500",
      body: `Could not find '${platformName}' in platforms.`
    }
  }
  // const funnel = new Funnel(funnelName)
  // const platforms = JSON.parse(window.localStorage.getItem("platforms")) || []


  // console.log(platforms);
  // console.log(platforms[0].funnels);

  // const funnels = platform.funnels
  platform.funnels.push(new Funnel(funnelName))
  window.localStorage.setItem("platforms", JSON.stringify([platform]))
  // console.log(funnels);
  // console.log(localStorage);
  return {
    status: "200",
    body: `Stored '${funnelName}' in '${platformName}'`,
  }
}

export function _getPlatformByName(name) {
  const platforms = JSON.parse(window.localStorage.getItem("platforms")) || []
  // if (platforms.filter(it => it.name === name).length > 1) {
  //   return {
  //     status: "500",
  //     body: console.info(`Duplicate warning in platforms 'name:${name}'`)
  //   }
  // }

  const platform = platforms.filter(it => it.name === name)[0]
  return {
    status: "200",
    body: new Platform(platform.name) || undefined
  }
}

export function _getUserSession() {
  return new Promise((resolve, reject) => {
    if (!window.sessionStorage.getItem("userSession")) {
      resolve([])
    }
    resolve(JSON.parse(window.sessionStorage.getItem("userSession")))
  })
}

export function _getInteractionsFromLocalStorage() {
  return JSON.parse(window.localStorage.getItem("interactions")) || []
}

export function _getListOfPlatforms() {
  const platforms = JSON.parse(window.localStorage.getItem("platforms")) || []


  return platforms.map(platform => {
    // console.log(JSON.stringify(platform));
    return new Platform(platform.name)
  })

  // return JSON.parse(window.localStorage.getItem("platforms")) || []
}

export function save(object) {

}

export function listOfObjects(value) {
  const list = []

  list.push(value)
  window.localStorage.setItem(value.name, JSON.stringify(list))
}
