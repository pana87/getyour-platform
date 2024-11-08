import {Helper} from "/js/Helper.js"
import {text} from "/js/request.js"

export const numerology = {}
const numbersAsText = ['eins', 'zwei', 'drei', 'vier', 'fuenf', 'sechs', 'sieben', 'acht', 'neun']
const occurencies = ['ein-mal', 'zwei-mal', 'drei-mal', 'vier-mal', 'fuenf-mal', 'sechs-mal', 'sieben-mal', 'acht-mal', 'neun-mal']
const latinAlphabet = {
  'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5,
  'f': 6, 'g': 7, 'h': 8, 'i': 9, 'j': 1,
  'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6,
  'p': 7, 'q': 8, 'r': 9, 's': 1, 't': 2,
  'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7,
  'z': 8
}
const greekAlphabet = {
  'α': 1, 'β': 2, 'γ': 3, 'δ': 4, 'ε': 5,
  'ζ': 6, 'η': 7, 'θ': 8, 'ι': 9, 'κ': 1,
  'λ': 2, 'μ': 3, 'ν': 4, 'ξ': 5, 'ο': 6,
  'π': 7, 'ρ': 8, 'σ': 9, 'τ': 1, 'υ': 2,
  'φ': 3, 'χ': 4, 'ψ': 5, 'ω': 6
}
const russianAlphabet = {
  'а': 1, 'б': 2, 'в': 3, 'г': 4, 'д': 5,
  'е': 6, 'ё': 7, 'ж': 8, 'з': 9, 'и': 1,
  'й': 2, 'к': 3, 'л': 4, 'м': 5, 'н': 6,
  'о': 7, 'п': 8, 'р': 9, 'с': 1, 'т': 2,
  'у': 3, 'ф': 4, 'х': 5, 'ц': 6, 'ч': 7,
  'ш': 8, 'щ': 9, 'ъ': 1, 'ы': 2, 'ь': 3,
  'э': 4, 'ю': 5, 'я': 6
}
const alphabetMap = {
  ...latinAlphabet,
  ...greekAlphabet,
  ...russianAlphabet
}
const latinConsonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']
const greekConsonants = ['β', 'γ', 'δ', 'ζ', 'θ', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'φ', 'χ', 'ψ']
const russianConsonants = ['б', 'в', 'г', 'д', 'ж', 'з', 'й', 'к', 'л', 'м', 'н', 'п', 'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ']
const consonants = [
  ...latinConsonants,
  ...greekConsonants,
  ...russianConsonants
]
const latinVowels = ['a', 'e', 'i', 'o', 'u', 'y']
const greekVowels = ['α', 'ε', 'η', 'ι', 'ο', 'υ', 'ω']
const russianVowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я']
const vowels = [
  ...latinVowels,
  ...greekVowels,
  ...russianVowels
]
function calculateAge(date) {

  const currentDate = new Date()
  let age = currentDate.getFullYear() - date.getFullYear()
  const currentMonth = currentDate.getMonth()
  const birthMonth = date.getMonth()
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDate.getDate() < date.getDate())) {
    age--
  }
  return age
}
function renderDiv(node) {

  return Helper.div("mtb21 mlr34", node)
}
function renderTitleSpan(text, node) {

  const span = document.createElement("span")
  span.className = "fs21 mtb0 mlr5"
  span.textContent = text
  Helper.append(span, node)
  return span
}
function renderHighlightedSpan(text, node) {

  const span = Helper.create("box")
  span.className = "fs34 mtb0 mlr8"
  span.textContent = text
  Helper.append(span, node)
  return span
}
function renderTitle(title, node) {

  const titleNode = Helper.create("box", node)
  titleNode.textContent = `${title}:`
  const tag = title.toLowerCase().replaceAll(" ", "-").replaceAll("ü", "ue").replaceAll("ö", "oe").replaceAll("ä", "ae").replaceAll("1.", "ersten").replaceAll("2.", "zweiten").replaceAll("3.", "dritten").replaceAll("4.", "vierten")
  titleNode.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/${tag}/`, "_blank")
  return titleNode
}
function dateToIsoSplit(date) {

  const isoDate = date.toISOString()
  return isoDate.split("T")[0]
}
function renderLifePathCalculation(date) {

  date = dateToIsoSplit(date)
  const digits = [...date.toString()].map(digit => parseInt(digit))
  let text
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i]
    if (Helper.verifyIs("number/empty", digit)) continue
    if (text === undefined) {
      text = digit
    } else {
      text = text + " + " + digit
    }
  }
  return text
}
function dateToMaster(date) {

  date = dateToIsoSplit(date)
  const digits = [...date.toString()].map(digit => parseInt(digit, 10)).filter(Number.isFinite)
  let sum = digits.reduce((acc, digit) => acc + digit, 0)
  let prevSum = sum
  const seenSums = new Set()
  while (![11, 22, 33].includes(sum) && ![0, 1, 4, 6, 7, 9].includes(sum) && !seenSums.has(sum)) {
    seenSums.add(sum)
    prevSum = sum
    sum = [...sum.toString()].map(digit => parseInt(digit, 10)).reduce((acc, digit) => acc + digit, 0)
    if (![11, 22, 33].includes(sum) && ![0, 1, 4, 6, 7, 9].includes(sum)) {
      break
    }
  }
  return ![11, 22, 33].includes(sum) ? prevSum : sum
}
function renderEqualsSign(node) {

  const equalsSign = renderTitleSpan("=", node)
  equalsSign.style.margin = "0 5px"
  return equalsSign
}
numerology.dateToLifePath = date => {

  date = dateToIsoSplit(date)
  const digits = [...date.toString()].map(digit => parseInt(digit))
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i]
    if (Helper.verifyIs("number/empty", digit)) continue
    sum += digit
  }
  while (sum > 9) {
    sum = [...sum.toString()].reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  return sum
}
function openLifePath(lifePath) {

  const url = `/entwicklung/numerologie/geburtsenergie-${numbersAsText[lifePath - 1]}/`
  window.open(url, "_blank")
}
function getDigits(number) {

  const numberString = Math.abs(number).toString()
  return Array.from(numberString, Number)
}
function sumDigits(number) {

  const digits = getDigits(number)
  const sum = digits.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  return sum
}
function reduceToSingleDigit(number) {

  let result = number
  while (result >= 10) {
    result = sumDigits(result)
  }
  return result
}
function createPrevailingEnergies(data, node) {

  const fragment = document.createDocumentFragment()
  const keys = Object.keys(data)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key === "0") continue
    if (data[key] >= 2) {
      const div = Helper.create("box")
      div.className = "inline-block"
      div.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/vorherrschende-energie-${numbersAsText[key - 1]}/`, "_blank")
      fragment.appendChild(div)
      const span1 = document.createElement("span")
      span1.textContent = `${data[key]}x`
      span1.className = "fs21"
      div.appendChild(span1)
      const span2 = document.createElement("span")
      span2.textContent = key
      span2.className = "fs34"
      div.appendChild(span2)
    }
  }
  node.appendChild(fragment)
  return node
}
function countOccurrences(array) {

  const occurrences = {}
  array.forEach(number => {
    occurrences[number] = (occurrences[number] || 0) + 1
  })
  return occurrences
}
function splitYear(year) {

  const yearString = year.toString()
  const firstPart = yearString.substring(0, 2)
  const secondPart = yearString.substring(2)
  return [firstPart, secondPart]
}
function fillDateNumbers(date) {

  const isoDateSplit = dateToIsoSplit(date)
  const dateNumbers = isoDateSplit.match(/\d/g).map(Number)
  const lifePathNumber = numerology.dateToLifePath(date)
  dateNumbers.push(lifePathNumber)
  const day = date.getDate()
  const sumDay = reduceToSingleDigit(day)
  dateNumbers.push(sumDay)
  const month = date.getMonth() + 1
  const sumMonth = reduceToSingleDigit(month)
  dateNumbers.push(sumMonth)
  const year = date.getFullYear()
  const [yearFirstPart, yearSecondPart] = splitYear(year)
  const sumYearFirstPart = reduceToSingleDigit(Number(yearFirstPart))
  const sumYearSecondPart = reduceToSingleDigit(Number(yearSecondPart))
  dateNumbers.push(sumYearFirstPart)
  dateNumbers.push(sumYearSecondPart)
  const sumDayAndMonth = reduceToSingleDigit(sumDay + sumMonth)
  dateNumbers.push(sumDayAndMonth)
  const sumYear = reduceToSingleDigit(sumYearFirstPart + sumYearSecondPart)
  dateNumbers.push(sumYear)
  return dateNumbers
}
function createRecedingEnergy(array, node) {

  const fragment = document.createDocumentFragment()
  for (let i = 0; i < array.length; i++) {
    const number = array[i]
    const div = Helper.create("box")
    div.className = "fs34"
    div.textContent = number
    div.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/zuruecktretende-energie-${numbersAsText[number - 1]}/`, "_blank")
    fragment.appendChild(div)
  }
  node.appendChild(fragment)
  return node
}
function openTones(tone, occurency) {

  const url = `/entwicklung/numerologie/tonarten-${occurencies[occurency - 1]}-${numbersAsText[tone - 1]}/`
  window.open(url, "_blank")
}
function createTones(array, node) {

  const data = countOccurrences(array)
  const fragment = document.createDocumentFragment()
  const keys = Object.keys(data)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (key === "0") continue
    if (data[key] >= 1) {
      const div = Helper.create("box")
      div.className = "inline-block"
      div.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/tonarten-${occurencies[data[key] - 1]}-${numbersAsText[key - 1]}/`, "_blank")
      fragment.appendChild(div)
      const span1 = document.createElement("span")
      span1.textContent = `${data[key]}x`
      span1.className = "fs21"
      div.appendChild(span1)
      const span2 = document.createElement("span")
      span2.textContent = key
      span2.className = "fs34"
      div.appendChild(span2)
    }
  }
  node.appendChild(fragment)
  return node
}
function renderBirthNameEnergy(array, node) {

  const fragment = document.createDocumentFragment()
  for (let i = 0; i < array.length; i++) {
    const number = array[i]
    const div = Helper.create("box")
    div.textContent = `${number}${i === array.length - 1 ? "" : ","}`
    div.className = "fs34"
    div.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/geburtsname-${numbersAsText[number - 1]}/`, "_blank")
    fragment.appendChild(div)
  }
  node.appendChild(fragment)
  return node
}
function reduceStringToSingleDigit(str) {

  let sum = 0
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toLowerCase()
    if (alphabetMap.hasOwnProperty(char)) {
      sum += alphabetMap[char]
    }
  }
  while (sum >= 10) {
    const digits = String(sum).split("").map(Number)
    sum = digits.reduce((acc, val) => acc + val, 0)
  }
  return sum
}
function reduceVowelsToSingleDigit(str) {

  let sum = 0
  for (let i = 0; i < str.length; i++) {
    if (vowels.includes(str[i].toLowerCase())) {
      sum += alphabetMap[str[i].toLowerCase()] || 0
    }
  }
  while (sum >= 10) {
    const digits = String(sum).split("").map(Number)
    sum = digits.reduce((acc, val) => acc + val, 0)
  }
  return sum
}
function reduceConsonantsToSingleDigit(str) {

  let sum = 0
  for (let i = 0; i < str.length; i++) {
    if (consonants.includes(str[i].toLowerCase())) {
      sum += alphabetMap[str[i].toLowerCase()] || 0
    }
  }
  while (sum >= 10) {
    const digits = String(sum).split("").map(Number)
    sum = digits.reduce((acc, val) => acc + val, 0)
  }
  return sum
}
function findDoubleLetters(str) {

  const result = []
  for (let i = 1; i < str.length; i++) {
    const currentChar = str[i].toLowerCase()
    const previousChar = str[i - 1].toLowerCase()
    if (currentChar === previousChar) {
      result.push(alphabetMap[currentChar])
    }
  }
  return result
}
function openDoubleLetters(energy) {

  const url = `/entwicklung/numerologie/doppelte-buchstaben-${numbersAsText[energy - 1]}/`
  window.open(url, "_blank")
}
function renderDoubleLettersValue(number, array) {

  const div = Helper.create("box")
  div.className = "double-letters-value inline-block mtb0 mlr5 fs34"
  div.textContent = `${number}`
  div.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/doppelte-buchstaben-${numbersAsText[number - 1]}/`, "_blank")
  return div
}
function countFourAndFive(str) {

  let count = 0
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toLowerCase()
    const value = alphabetMap[char]
    if (value === 4 || value === 5) {
      count++
    }
  }
  return count
}
function countTwoThreeAndSix(str) {

  let count = 0
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toLowerCase()
    const value = alphabetMap[char]
    if (value === 2 || value === 3 || value === 6) {
      count++
    }
  }
  return count
}
function countOneAndEight(str) {

  let count = 0
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toLowerCase()
    const value = alphabetMap[char]
    if (value === 1 || value === 8) {
      count++
    }
  }
  return count
}
function countSevenAndNine(str) {

  let count = 0
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toLowerCase()
    const value = alphabetMap[char]
    if (value === 7 || value === 9) {
      count++
    }
  }
  return count
}
numerology.renderAge = (date, node) => {

  const age = calculateAge(date)
  const ageDiv = renderDiv(node)
  renderTitleSpan("Alter:", ageDiv)
  renderHighlightedSpan(age, ageDiv)
}
numerology.renderLifePath = (date, node) => {

  const lifePathDiv = renderDiv(node)
  renderTitle("Geburtsenergie", lifePathDiv)
  const lifePathCalc = renderTitleSpan(renderLifePathCalculation(date), lifePathDiv)
  renderEqualsSign(lifePathDiv)
  const master = dateToMaster(date)
  const masterCalc = renderTitleSpan(master.toString().split('').join(' + '), lifePathDiv)
  renderEqualsSign(lifePathDiv)
  const lifePathNumber = numerology.dateToLifePath(date)
  const lifePathResult = renderHighlightedSpan(lifePathNumber, lifePathDiv)
  lifePathResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/geburtsenergie-${numbersAsText[lifePathResult.textContent - 1]}/`, "_blank")
}
numerology.renderMaster = (date, node) => {

  const master = dateToMaster(date)
  if (master === 11 || master === 22 || master === 33) {
    const masterDiv = renderDiv(node)
    renderTitle("Masterenergie", masterDiv)
    const masterResult = renderHighlightedSpan(master, masterDiv)
    if (master === 11) {
      masterResult.onclick = () => window.open("https://www.get-your.de/entwicklung/numerologie/masterenergie-elf/", "_blank")
    }

    if (master === 22) {
      masterResult.onclick = () => window.open("https://www.get-your.de/entwicklung/numerologie/masterenergie-zwei-und-zwanzig/", "_blank")
    }

    if (master === 33) {
      masterResult.onclick = () => window.open("https://www.get-your.de/entwicklung/numerologie/masterenergie-drei-und-dreisig/", "_blank")
    }
  }
}
numerology.renderBirthDayEnergy = (date, node) => {

  const day = date.getDate()
  const birthdayEnergyNumber = reduceToSingleDigit(day)
  const birthdayEnergyDiv = renderDiv(node)
  renderTitle("Geburtstagsenergie", birthdayEnergyDiv)
  const birthdayEnergyResult = renderHighlightedSpan(birthdayEnergyNumber, birthdayEnergyDiv)
  birthdayEnergyResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/geburtstagsenergie-${numbersAsText[birthdayEnergyNumber - 1]}/`, "_blank")
}
numerology.renderPrevailingEnergies = (date, node) => {

  const pervailingEnergyDiv = renderDiv(node)
  renderTitle("Vorherrschende Energien", pervailingEnergyDiv)
  const dateNumbers = fillDateNumbers(date)
  createPrevailingEnergies(countOccurrences(dateNumbers), pervailingEnergyDiv)
}
numerology.renderRecedingEnergies = (date, node) => {

  const missingNumbers = []
  const dateNumbers = fillDateNumbers(date)
  for (let i = 1; i <= 9; i++) {
    if (!dateNumbers.includes(i)) {
      missingNumbers.push(i)
    }
  }
  if (missingNumbers.length > 0) {
    const recedingEnergyDiv = renderDiv(node)
    renderTitle("Zurücktretende Energien", recedingEnergyDiv)
    createRecedingEnergy(missingNumbers, recedingEnergyDiv)
  }
}
numerology.renderTones = (date, node) => {

  const tonesDiv = renderDiv(node)
  renderTitle("Tonarten", tonesDiv)
  const dateNumbers = fillDateNumbers(date)
  createTones(dateNumbers, tonesDiv)
}
numerology.renderFirstCycle = (date, node) => {

  const firstCycleDiv = renderDiv(node)
  renderTitle("Dauer des 1. Zyklus", firstCycleDiv)
  const lifePathNumber = numerology.dateToLifePath(date)
  const firstCycle = 36 - lifePathNumber
  const firstCycleResult = renderHighlightedSpan(`0 - ${firstCycle}`, firstCycleDiv)
  firstCycleResult.onclick = () => window.open("https://www.get-your.de/entwicklung/numerologie/erster-zyklus/", "_blank")
}
numerology.renderFirstKeyTone = (date, node) => {

  const day = date.getDate()
  const sumDay = reduceToSingleDigit(day)
  const month = date.getMonth() + 1
  const sumMonth = reduceToSingleDigit(month)
  const sumDayAndMonth = reduceToSingleDigit(sumDay + sumMonth)
  const firstKeyTone = sumDayAndMonth
  const firstKeyToneDiv = renderDiv(node)
  renderTitle("Grundton zum 1. Zyklus", firstKeyToneDiv)
  const firstKeyToneResult = renderHighlightedSpan(firstKeyTone, firstKeyToneDiv)
  firstKeyToneResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/grundton-${numbersAsText[firstKeyTone - 1]}/`, '_blank')
}
numerology.renderSecondCycle = (date, node) => {

  const lifePathNumber = numerology.dateToLifePath(date)
  const firstCycle = 36 - lifePathNumber
  const secondCycle = firstCycle + 1 + 9
  const secondCycleDiv = renderDiv(node)
  renderTitle("Dauer des 2. Zyklus", secondCycleDiv)
  const secondCycleResult = renderHighlightedSpan(`${firstCycle + 1} - ${secondCycle}`, secondCycleDiv)
  secondCycleResult.onclick = () => window.open("https://www.get-your.de/entwicklung/numerologie/zweiter-zyklus/", "_blank")
}
numerology.renderSecondKeyTone = (date, node) => {

  const day = date.getDate()
  const sumDay = reduceToSingleDigit(day)
  const year = date.getFullYear()
  const [yearFirstPart, yearSecondPart] = splitYear(year)
  const sumYearFirstPart = reduceToSingleDigit(Number(yearFirstPart))
  const sumYearSecondPart = reduceToSingleDigit(Number(yearSecondPart))
  const sumYear = reduceToSingleDigit(sumYearFirstPart + sumYearSecondPart)
  const secondKeyTone = reduceToSingleDigit(sumDay + sumYear)
  const secondKeyToneDiv = renderDiv(node)
  renderTitle("Grundton zum 2. Zyklus", secondKeyToneDiv)
  const secondKeyToneResult = renderHighlightedSpan(secondKeyTone, secondKeyToneDiv)
  secondKeyToneResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/grundton-${numbersAsText[secondKeyTone - 1]}/`, '_blank')
}
numerology.renderThirdCycle = (date, node) => {

  const lifePathNumber = numerology.dateToLifePath(date)
  const firstCycle = 36 - lifePathNumber
  const secondCycle = firstCycle + 1 + 9
  const thirdCycle = secondCycle + 1 + 9
  const thirdCycleDiv = renderDiv(node)
  renderTitle("Dauer des 3. Zyklus", thirdCycleDiv)
  const thirdCycleResult = renderHighlightedSpan(`${secondCycle + 1} - ${thirdCycle}`, thirdCycleDiv)
  thirdCycleResult.onclick = () => window.open("https://www.get-your.de/entwicklung/numerologie/dritter-zyklus/", "_blank")
}
numerology.renderThirdKeyTone = (date, node) => {

  const day = date.getDate()
  const sumDay = reduceToSingleDigit(day)
  const month = date.getMonth() + 1
  const sumMonth = reduceToSingleDigit(month)
  const sumDayAndMonth = reduceToSingleDigit(sumDay + sumMonth)
  const firstKeyTone = sumDayAndMonth
  const year = date.getFullYear()
  const [yearFirstPart, yearSecondPart] = splitYear(year)
  const sumYearFirstPart = reduceToSingleDigit(Number(yearFirstPart))
  const sumYearSecondPart = reduceToSingleDigit(Number(yearSecondPart))
  const sumYear = reduceToSingleDigit(sumYearFirstPart + sumYearSecondPart)
  const secondKeyTone = reduceToSingleDigit(sumDay + sumYear)
  const thirdKeyTone = reduceToSingleDigit(firstKeyTone + secondKeyTone)
  const thirdKeyToneDiv = renderDiv(node)
  renderTitle("Grundton zum 3. Zyklus", thirdKeyToneDiv)
  const thirdKeyToneResult = renderHighlightedSpan(thirdKeyTone, thirdKeyToneDiv)
  thirdKeyToneResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/grundton-${numbersAsText[thirdKeyTone - 1]}/`, '_blank')
}
numerology.renderFourthCycle = (date, node) => {

  const lifePathNumber = numerology.dateToLifePath(date)
  const firstCycle = 36 - lifePathNumber
  const secondCycle = firstCycle + 1 + 9
  const thirdCycle = secondCycle + 1 + 9
  const fourthCycle = thirdCycle + 1 + 9
  const fourthCycleDiv = renderDiv(node)
  renderTitle("Dauer des 4. Zyklus", fourthCycleDiv)
  const fourthCycleResult = renderHighlightedSpan(`${thirdCycle + 1} - ${fourthCycle}`, fourthCycleDiv)
  fourthCycleResult.onclick = () => window.open("https://www.get-your.de/entwicklung/numerologie/vierter-zyklus/", "_blank")
}
numerology.renderFourthKeyTone = (date, node) => {

  const month = date.getMonth() + 1
  const sumMonth = reduceToSingleDigit(month)
  const year = date.getFullYear()
  const [yearFirstPart, yearSecondPart] = splitYear(year)
  const sumYearFirstPart = reduceToSingleDigit(Number(yearFirstPart))
  const sumYearSecondPart = reduceToSingleDigit(Number(yearSecondPart))
  const sumYear = reduceToSingleDigit(sumYearFirstPart + sumYearSecondPart)
  const fourthKeyTone = reduceToSingleDigit(sumMonth + sumYear)
  const fourthKeyToneDiv = renderDiv(node)
  renderTitle("Grundton zum 4. Zyklus", fourthKeyToneDiv)
  const fourthKeyToneResult = renderHighlightedSpan(fourthKeyTone, fourthKeyToneDiv)
  fourthKeyToneResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/grundton-${numbersAsText[fourthKeyTone - 1]}/`, '_blank')
}
function getBirthNameNumbers(string) {

  const splitAlias = string.split(" ")
  const birthNameSums = []
  for (let i = 0; i < splitAlias.length; i++) {
    const alias = splitAlias[i]
    let sum = 0
    for (let i = 0; i < alias.length; i++) {
      const char = alias[i]
      sum += alphabetMap[char.toLowerCase()] || 0
    }
    birthNameSums.push(sum)
  }
  return birthNameSums.map(it => reduceToSingleDigit(it))
}
numerology.renderBirthNameEnergies = (string, node) => {

  const birthNameNumbers = getBirthNameNumbers(string)
  const birthNameDiv = renderDiv(node)
  birthNameDiv.classList.add("birth-name")
  renderTitle("Geburtsname", birthNameDiv)
  renderBirthNameEnergy(birthNameNumbers, birthNameDiv)
}
numerology.renderDeterminationEnergy = (string, node) => {

  let determinationNumber = reduceStringToSingleDigit(string)
  if (determinationNumber === 0) determinationNumber = 9
  const determinationDiv = renderDiv(node)
  renderTitle("Bestimmung", determinationDiv)
  const determinationResult = renderHighlightedSpan(determinationNumber, determinationDiv)
  determinationResult.classList.add("determination")
  determinationResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/bestimmung-${numbersAsText[determinationNumber - 1]}/`, "_blank")
}
numerology.renderHeartsDesire = (string, node) => {

  let heartsDesire = reduceVowelsToSingleDigit(string)
  if (heartsDesire === 0) heartsDesire = 9
  const heartsDesireDiv = renderDiv(node)
  renderTitle("Herzenswunsch", heartsDesireDiv)
  const heartsDesireResult = renderHighlightedSpan(heartsDesire, heartsDesireDiv)
  heartsDesireResult.classList.add("heart-desire")
  heartsDesireResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/herzenswunsch-${numbersAsText[heartsDesire - 1]}/`, "_blank")
}
numerology.renderPersona = (string, node) => {

  let persona = reduceConsonantsToSingleDigit(string)
  if (persona === 0) persona = 9
  const personaDiv = renderDiv(node)
  renderTitle("Persona", personaDiv)
  const personaResult = renderHighlightedSpan(persona, personaDiv)
  personaResult.classList.add("persona")
  personaResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/persona-${numbersAsText[persona - 1]}/`, "_blank")
}
numerology.renderDoubleLetterEnergies = (string, node) => {

  const doubleLetters = findDoubleLetters(string)
  const doubleLettersDiv = renderDiv(node)
  doubleLettersDiv.classList.add("double-letters")
  if (doubleLetters.length > 0) {
    doubleLettersDiv.style.display = "block"
    doubleLettersDiv.textContent = ""
    renderTitle("Doppelte Buchstaben", doubleLettersDiv)
    for (let i = 0; i < doubleLetters.length; i++) {
      const number = doubleLetters[i]
      const div = renderDoubleLettersValue(number, doubleLetters)
      doubleLettersDiv.appendChild(div)
    }
  } else {
    renderTitle("Doppelte Buchstaben", doubleLettersDiv)
    doubleLettersDiv.style.display = "none"
  }
}
numerology.renderPhysicalLevel = (string, node) => {

  let physicalLevel = countFourAndFive(string)
  if (physicalLevel === 0) physicalLevel = 9
  const physicalLevelDiv = renderDiv(node)
  renderTitle("Körperliche Ebene", physicalLevelDiv)
  const physicalLevelResult = renderHighlightedSpan(physicalLevel, physicalLevelDiv)
  physicalLevelResult.classList.add("physical-level")
  physicalLevelResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/koerperliche-ebene-${numbersAsText[physicalLevel - 1]}/`, "_blank")
}
numerology.renderEmotionalLevel = (string, node) => {

  let emotionalLevel = countTwoThreeAndSix(string)
  if (emotionalLevel === 0) emotionalLevel = 9
  const emotionalLevelDiv = renderDiv(node)
  renderTitle("Emotionale Ebene", emotionalLevelDiv)
  const emotionalLevelResult = renderHighlightedSpan(emotionalLevel, emotionalLevelDiv)
  emotionalLevelResult.classList.add("emotional-level")
  emotionalLevelResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/emotionale-ebene-${numbersAsText[emotionalLevel - 1]}/`, "_blank")
}
numerology.renderMentalLevel = (string, node) => {

  let mentalLevel = countOneAndEight(string)
  if (mentalLevel === 0) mentalLevel = 9
  const mentalLevelDiv = renderDiv(node)
  renderTitle("Mentale Ebene", mentalLevelDiv)
  const mentalLevelResult = renderHighlightedSpan(mentalLevel, mentalLevelDiv)
  mentalLevelResult.classList.add("mental-level")
  mentalLevelResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/mental-ebene-${numbersAsText[mentalLevel - 1]}/`, "_blank")
}
numerology.renderIntuitiveLevel = (string, node) => {

  let intuitiveLevel = countSevenAndNine(string)
  if (intuitiveLevel === 0) intuitiveLevel = 9
  const intuitiveLevelDiv = renderDiv(node)
  renderTitle("Intuitive Ebene", intuitiveLevelDiv)
  const intuitiveLevelResult = renderHighlightedSpan(intuitiveLevel, intuitiveLevelDiv)
  intuitiveLevelResult.classList.add("intuitive-level")
  intuitiveLevelResult.onclick = () => window.open(`https://www.get-your.de/entwicklung/numerologie/intuitive-ebene-${numbersAsText[intuitiveLevel - 1]}/`, "_blank")
}

const res = await Helper.request("/verify/user/closed/")
const userIsClosed = res.status === 200

const birthdateInput = document.querySelector("input[type='date']")
if (birthdateInput) {
  Helper.add("hover-outline", birthdateInput)
  birthdateInput.value = Helper.convert("millis/yyyy-mm-dd", Date.now())
  if (userIsClosed) {
    const tree = "numerologie.birthdate"
    const res = await Helper.request("/jwt/get/tree/", {tree})
    if (res.status === 200) {
      birthdateInput.value = res.response.split("T")[0]
    }
  }
}

function addLoginButton(node) {

  const div = Helper.div("flex align column")
  const or = Helper.div("mtb21 mlr0", div)
  or.textContent = "oder"
  const login = node.cloneNode(true)
  login.style.background = null
  login.style.color = null
  login.style.margin = null
  login.className = "bg-orange color-light numerlogy-login"
  Helper.add("hover-outline", login)
  Helper.append(login, div)
  login.textContent = "Jetzt anmelden"
  node.after(div)
  return login
}
function openLoginPage() {

  window.open("/entwicklung/numerologie/login/", "_blank")
}

const numerologyLogin = document.querySelector(".numerology-login")
if (numerologyLogin) {
  login.onclick = openLoginPage
}

if (!userIsClosed) {

  const withLogin = document.querySelector(".with-login")
  if (withLogin && !numerologyLogin) {
    const login = addLoginButton(withLogin)
    login.onclick = openLoginPage
  }
}

numerology.renderDateContent = (date, node) => {

  const div = Helper.div("color-theme sans-serif", node)
  Helper.render("text/h1", `Numerologie Rechner vom ${Helper.convert("millis/dd.mm.yyyy", date.getTime())}`, div)
  numerology.renderAge(date, div)
  numerology.renderLifePath(date, div)
  numerology.renderMaster(date, div)
  numerology.renderBirthDayEnergy(date, div)
  numerology.renderPrevailingEnergies(date, div)
  numerology.renderRecedingEnergies(date, div)
  numerology.renderTones(date, div)
  numerology.renderFirstCycle(date, div)
  numerology.renderFirstKeyTone(date, div)
  numerology.renderSecondCycle(date, div)
  numerology.renderSecondKeyTone(date, div)
  numerology.renderThirdCycle(date, div)
  numerology.renderThirdKeyTone(date, div)
  numerology.renderFourthCycle(date, div)
  numerology.renderFourthKeyTone(date, div)
  return div
}
numerology.renderNameContent = (name, node) => {

  const div = Helper.div("color-theme sans-serif", node)
  Helper.render("text/h1", `Numerologie Rechner für ${name}`, div)
  numerology.renderBirthNameEnergies(name, div)
  numerology.renderDeterminationEnergy(name, div)
  numerology.renderHeartsDesire(name, div)
  numerology.renderPersona(name, div)
  numerology.renderDoubleLetterEnergies(name, div)
  numerology.renderPhysicalLevel(name, div)
  numerology.renderEmotionalLevel(name, div)
  numerology.renderMentalLevel(name, div)
  numerology.renderIntuitiveLevel(name, div)
  return div
}
function updateDateContent(date, node) {

  Helper.reset("node", node)
  numerology.renderDateContent(date, node)
  return node
}
function updateNameContent(name, node) {

  Helper.reset("node", node)
  numerology.renderNameContent(name, node)
  return node
}

const numerogyOverlay = document.querySelector(".numerology-overlay")
if (numerogyOverlay) {
  if (numerogyOverlay) Helper.add("hover-outline", numerogyOverlay)
  numerogyOverlay.onclick = async () => {

    const birthdateValue = birthdateInput.value
    if (Helper.verifyIs("text/empty", birthdateValue)) {
      window.alert("Du hast vergessen dein Geburtsdatum einzugeben.")
      Helper.add("style/not-valid", birthdateInput)
      return
    } else {
      Helper.add("style/valid", birthdateInput)
    }

    Helper.overlay("pop", async o1 => {
      const date = new Date(birthdateValue)
      const content = o1.content
      const dateContent = numerology.renderDateContent(date, content)
      if (userIsClosed) {
        const birthNameField = Helper.create("input/text", content)
        birthNameField.input.placeholder = "Gebe deinen Geburtsnamen ein.."
        const birthnameTree = "numerologie.birthname"
        const res = await Helper.request("/jwt/get/tree/", {tree: birthnameTree})
        if (res.status === 200) {
          birthNameField.input.value = res.response
        }
        birthNameField.input.oninput = ev => {

          const birthname = ev.target.value
          if (Helper.verifyIs("text/empty", birthname)) {
            Helper.add("style/not-valid", birthNameField.input)
            return
          }
          updateNameContent(birthname, nameContent)
          Helper.add("style/valid", birthNameField.input)
        }
        const nameContent = numerology.renderNameContent(birthNameField.input.value, content)
        const toSave = Helper.create("button/action", content)
        toSave.textContent = "Daten jetzt speichern"
        toSave.onclick = () => {

          const map = {
            birthdate: new Date(birthdateValue).toISOString(),
            birthname: birthNameField.input.value,
          }
          Helper.overlay("lock", async o2 => {
            const res = await Helper.request("/register/location/map/", {map})
            if (res.status === 200) {
              o2.alert.ok()
            } else {
              o2.alert.nok()
            }
            o2.remove()
          })
        }
        const toProfile = Helper.create("button", content)
        toProfile.textContent = "Zu deinem Profil"
        toProfile.onclick = () => {

          Helper.overlay("lock", async o2 => {
            const res = await Helper.request("/jwt/get/tree/", {tree: "id"})
            if (res.status === 200) {
              window.open(`/entwicklung/numerologie/profil/${res.response}/`, "_blank")
            } else {
              window.alert("Fehler.. Bitte wiederholen.")
            }
            o2.remove()
          })
        }
      } else {
        const toSave = Helper.create("button/action", content)
        toSave.textContent = "Jetzt Geburtsname berechnen"
        toSave.onclick = openLoginPage
      }
    })
  }
}

(async() => {

  const split = window.location.pathname.split("/")
  const platform = split[2]
  const profil = split[3]
  const urlId = split[4]
  if (Helper.verifyIs("text/empty", profil) || profil !== "profil") return
  if (Helper.verifyIs("text/empty", urlId)) return
  const res = await Helper.request("/get/location/platform/url-id/", {urlId})
  if (res.status !== 200) return
  const location = JSON.parse(res.response)
  const date = new Date(location.birthdate)
  const lifepath = numerology.dateToLifePath(date)
  const name = location.birthname
  document.querySelectorAll(".numerologie.birthdate").forEach(node => {
    Helper.add("hover-outline", node)
    node.textContent = Helper.convert("millis/dd.mm.yyyy", date.getTime())
    node.onclick = () => {

      Helper.overlay("pop", o1 => {
        const content = o1.content
        numerology.renderDateContent(date, content)
      })
    }
  })
  document.querySelectorAll(".numerologie.birthname").forEach(node => {
    Helper.add("hover-outline", node)
    node.textContent = name
    node.onclick = () => {

      Helper.overlay("pop", o1 => {
        const content = o1.content
        numerology.renderNameContent(name, content)
      })
    }
  })
  document.querySelectorAll(".numerologie.lifepath").forEach(node => {
    node.textContent = numerology.dateToLifePath(date)
  })
  document.querySelectorAll(".lifepath.content").forEach(node => {
    node.textContent = lifepath
  })
  const lifepathNode = document.querySelector("[lifepath='content']")
  if (!lifepathNode) return
  const text = await text(`/entwicklung/numerologie/geburtsenergie-${numbersAsText[lifepath - 1]}/`)
  if (!text) return
  const purified = await Helper.convert("text/purified", text)
  const doc = Helper.convert("text/doc", purified)
  const contentNodes = Array.from(doc.body.querySelectorAll(".content"))
  if (contentNodes.length > 0) {
    const randomIndex = Math.floor(Math.random() * contentNodes.length)
    const randomText = contentNodes[randomIndex].textContent
    lifepathNode.textContent = randomText
  }
})();

(() => {

  const tree = "numerologie"
  const algo = "shuffle"
  const list = document.querySelectorAll(`[list='${tree} ${algo}']`)
  list.forEach(node => {
    Helper.add("hover-outline", node)
    node.onclick = ev => {

      Helper.overlay("pop", o1 => {
        const content = o1.content
        Helper.render("text/h1", node.textContent, content)
        o1.load()
        Helper.request("/get/users/numerologie/").then(res => {
          o1.loading.remove()
          if (res.status === 200) {
            const list = JSON.parse(res.response)
            const buttons = Helper.div("", content)
            for (const user of list) {
              const birthdate = user.birthdate
              if (!birthdate) continue
              const date = new Date(birthdate)
              const birthname = user.birthname
              if (!birthname) continue
              const button = Helper.create("button/left-right", buttons)
              Helper.classes(button, {remove: "between"})
              button.left.className = "flex align center circle bg-green w55 h55 m13"
              const lifepath = numerology.dateToLifePath(date)
              button.left.textContent = lifepath
              Helper.render("div", {classes: "fs21", text: birthname}, button.right)
              Helper.render("div", {classes: "fs13", text: Helper.convert("millis/dd.mm.yyyy", date.getTime())}, button.right)
              button.onclick = () => window.open(`/entwicklung/numerologie/profil/${user.id}/`, "_blank")
            }
          } else {
            Helper.render("text/note", "Keine Daten gefunden", content)
          }
        })
      })
    }
  })
})();
