import {textIsEmpty} from "/js/verify.js"

export const observeDuplicateIds = () => {
  const cache = {}
  const observer = new MutationObserver((mutations, observer) => {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i]
      if (mutation.type === "childList") {
        mutation.removedNodes.forEach(node => {
          if (!textIsEmpty(node.id)) {
            const borderStyle = "2px dashed rgb(176, 53, 53)"
            const ids = document.querySelectorAll(`#${node.id}`)
            if (ids[1] !== undefined) {
              cache.id = node.id
              document.querySelectorAll(`#${ids[1].id}`).forEach(id => {
                id.style.border = borderStyle
              })
            }
            if (ids[1] === undefined) {
              if (cache.id !== undefined) {
                const oldIds = document.querySelectorAll(`#${cache.id}`)
                if (oldIds[1] !== undefined) {
                  document.querySelectorAll(`#${oldIds[1].id}`).forEach(id => {
                    id.style.border = borderStyle
                  })
                }
                if (oldIds[1] === undefined) {
                  oldIds.forEach(id => {
                    if (id.style.border === borderStyle) {
                      id.style.border = null
                    }
                  })
                }
              }
              ids.forEach(id => {
                if (id.style.border === borderStyle) {
                  id.style.border = null
                }
              })
            }
          }
        })
        mutation.addedNodes.forEach(node => {
          if (!textIsEmpty(node.id)) {
            const borderStyle = "2px dashed rgb(176, 53, 53)"
            const ids = document.querySelectorAll(`#${node.id}`)
            if (ids[1] !== undefined) {
              cache.id = node.id
              document.querySelectorAll(`#${ids[1].id}`).forEach(id => {
                id.style.border = borderStyle
              })
            }
            if (ids[1] === undefined) {
              if (cache.id !== undefined) {
                const oldIds = document.querySelectorAll(`#${cache.id}`)
                if (oldIds[1] !== undefined) {
                  document.querySelectorAll(`#${oldIds[1].id}`).forEach(id => {
                    id.style.border = borderStyle
                  })
                }
                if (oldIds[1] === undefined) {
                  oldIds.forEach(id => {
                    if (id.style.border === borderStyle) {
                      id.style.border = null
                    }
                  })
                }
              }
              ids.forEach(id => {
                if (id.style.border === borderStyle) {
                  id.style.border = null
                }
              })
            }
          }
        })
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'id') {
        if (!textIsEmpty(mutation.target.id)) {
          const borderStyle = "2px dashed rgb(176, 53, 53)"
          const ids = document.querySelectorAll(`#${mutation.target.id}`)
          if (ids[1] !== undefined) {
            cache.id = mutation.target.id
            document.querySelectorAll(`#${ids[1].id}`).forEach(id => {
              id.style.border = borderStyle
            })
          }
          if (ids[1] === undefined) {
            if (cache.id !== undefined) {
              const oldIds = document.querySelectorAll(`#${cache.id}`)
              if (oldIds[1] !== undefined) {
                document.querySelectorAll(`#${oldIds[1].id}`).forEach(id => {
                  id.style.border = borderStyle
                })
              }
              if (oldIds[1] === undefined) {
                oldIds.forEach(id => {
                  if (id.style.border === borderStyle) {
                    id.style.border = null
                  }
                })
              }
            }
            ids.forEach(id => {
              if (id.style.border === borderStyle) {
                id.style.border = null
              }
            })
          }
        }
      }
    }
  })
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
  })
}
