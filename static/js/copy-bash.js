document.querySelectorAll(".bash").forEach(node => {
  node.parentElement.onclick = () => {
    navigator.clipboard.writeText(node.textContent).then(() => {
      const next = node.nextElementSibling
      next.textContent = "Kopiert!"
      setTimeout(() => next.textContent = "Kopieren", 1597)
    })
  }
})
