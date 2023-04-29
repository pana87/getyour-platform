export class Template {
  static shsHeaderWithNav() {

    const header = document.querySelector("header")
    header.style.display = "flex"
    header.style.flexDirection = "column"
    header.style.justifyContent = "space-between"

    const headerLogo = document.createElement("img")
    headerLogo.src = "/felix/shs/public/shslogo.png"
    headerLogo.alt = "SHS Express Logo"
    headerLogo.style.margin = "8px 34px"
    headerLogo.style.width = "144px"
    headerLogo.style.cursor = "pointer"
    headerLogo.addEventListener("click", () => window.history.back())
    header.append(headerLogo)


    const navContainer = document.createElement("div")
    navContainer.style.display = "flex"
    navContainer.style.justifyContent = "space-evenly"
    navContainer.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"

    const button1 = document.createElement("div")
    button1.classList.add("button-1")
    button1.style.display = "flex"
    button1.style.flexDirection = "column"
    button1.style.alignItems = "center"
    button1.style.justifyContent = "center"
    button1.style.width = "89px"
    button1.style.margin = "13px"
    button1.style.cursor = "pointer"
    button1.addEventListener("click", async() => await checkAndProceed("/felix/ep/abfrage-haus/"))

    const title1 = document.createElement("div")
    title1.innerHTML = "Haus"
    button1.append(title1)

    const index1 = document.createElement("div")
    index1.innerHTML = "1"
    index1.style.color = "white"

    const state1 = document.createElement("div")
    state1.style.display = "flex"
    state1.style.justifyContent = "center"
    state1.style.alignItems = "center"
    state1.style.width = "55px"
    state1.style.height = "34px"
    state1.style.margin = "13px 0"
    state1.style.backgroundColor = "#cfd4e2"
    state1.style.backgroundColor = "#11841e"
    button1.append(state1)

    state1.append(index1)

    navContainer.append(button1)


    const button2 = document.createElement("div")
    button2.classList.add("button-1")
    button2.style.display = "flex"
    button2.style.flexDirection = "column"
    button2.style.justifyContent = "center"
    button2.style.alignItems = "center"
    button2.style.width = "89px"
    button2.style.margin = "13px"
    button2.style.cursor = "pointer"
    button2.addEventListener("click", async() => await checkAndProceed("/felix/ep/abfrage-heizung/"))

    const title2 = document.createElement("div")
    title2.innerHTML = "Heizung"
    button2.append(title2)

    const index2 = document.createElement("div")
    index2.innerHTML = "2"

    const state2 = document.createElement("div")
    state2.style.display = "flex"
    state2.style.justifyContent = "center"
    state2.style.alignItems = "center"
    state2.style.width = "55px"
    state2.style.height = "34px"
    state2.style.margin = "13px 0"
    state2.style.backgroundColor = "#cfd4e2"
    button2.append(state2)

    state2.append(index2)

    navContainer.append(button2)



    const button3 = document.createElement("div")
    button3.classList.add("button-1")
    button3.style.display = "flex"
    button3.style.flexDirection = "column"
    button3.style.justifyContent = "center"
    button3.style.alignItems = "center"
    button3.style.width = "89px"
    button3.style.margin = "13px"
    button3.style.cursor = "pointer"
    button3.addEventListener("click", async() => await checkAndProceed("/felix/ep/abfrage-strom/"))

    const title3 = document.createElement("div")
    title3.innerHTML = "Strom"
    button3.append(title3)

    const index3 = document.createElement("div")
    index3.innerHTML = "3"

    const state3 = document.createElement("div")
    state3.style.display = "flex"
    state3.style.justifyContent = "center"
    state3.style.alignItems = "center"
    state3.style.width = "55px"
    state3.style.height = "34px"
    state3.style.margin = "13px 0"
    state3.style.backgroundColor = "#cfd4e2"
    button3.append(state3)

    state3.append(index3)

    navContainer.append(button3)



    const button4 = document.createElement("div")
    button4.classList.add("button-1")
    button4.style.display = "flex"
    button4.style.flexDirection = "column"
    button4.style.justifyContent = "center"
    button4.style.alignItems = "center"
    button4.style.width = "89px"
    button4.style.margin = "13px"
    button4.style.cursor = "pointer"
    button4.addEventListener("click", async() => await checkAndProceed("/felix/ep/abfrage-technisches/"))

    const title4 = document.createElement("div")
    title4.innerHTML = "Technisches"
    button4.append(title4)

    const index4 = document.createElement("div")
    index4.innerHTML = "4"

    const state4 = document.createElement("div")
    state4.style.display = "flex"
    state4.style.justifyContent = "center"
    state4.style.alignItems = "center"
    state4.style.width = "55px"
    state4.style.height = "34px"
    state4.style.margin = "13px 0"
    state4.style.backgroundColor = "#cfd4e2"
    button4.append(state4)

    state4.append(index4)

    navContainer.append(button4)


    header.append(navContainer)

    let observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting === false) {
          navContainer.style.position = "fixed"
          navContainer.style.top = "0"
          navContainer.style.left = "0"
          navContainer.style.zIndex = "1"
          navContainer.style.backgroundColor = "white"
          navContainer.style.width = "100%"
        }

        if (entry.isIntersecting === true) {
          navContainer.style.position = "static"
        }

      })
    }, {threshold: 0})
    observer.observe(headerLogo)



    return header
  }
}
