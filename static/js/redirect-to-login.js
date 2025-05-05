import "/js/go-back-button.js"

window.open("/login/", "_blank")
document.body.className = "sans-serif color-theme m34"
const h1 = document.createElement("h1")
h1.className = "fw-normal"
h1.textContent = "Du wirst automatisch weitergeleitet.."
const h3 = document.createElement("h3")
h3.className = "fw-normal"
h3.textContent = "Sobald du dich erfolgreich angemeldet hast, wird diese Seite neu geladen. Wenn sich kein neues Fenster öffnet, dann erlaube Popup Fenster in deinem Browser."
const a = document.createElement("a")
a.className = "link-theme fs21"
a.href = "/login/"
a.target = "_blank"
a.textContent = "Oder klicke hier, um das Login Fenster zu öffnen."
a.onmouseover = () => a.classList.add("outline")
a.onmouseout = () => a.classList.remove("outline")
document.body.appendChild(h1)
document.body.appendChild(h3)
document.body.appendChild(a)
