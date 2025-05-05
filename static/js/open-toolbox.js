import {toolboxButton} from "/js/button.js"
import {openToolbox} from "/js/toolbox-getter.js"

const toolboxBtn = toolboxButton(document.body)
toolboxBtn.onclick = openToolbox
