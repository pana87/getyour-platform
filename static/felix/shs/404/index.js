const titelFields = document.querySelectorAll("div[class*='hier-knnen-sich-sie']")

if (titelFields.length !== 0) {
  titelFields.forEach(title => title.innerHTML = "Dieser Bereich<br/>wird gerade für dich<br/> aufgebaut.")
}
