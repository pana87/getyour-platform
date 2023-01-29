import { DivField } from "./../js/DivField.js"

const logofield = new DivField("div[class*='logo-final']")
.withClickEventListener(() => window.location.assign("/"))

const impressumgobutton = new DivField("div[class*='impressumgobutton']")
.withClickEventListener(() => window.location.assign("/impressum/"))

const datenschutzgobutton = new DivField("div[class*='datenschutzgobutton']")
.withClickEventListener(() => window.location.assign("/datenschutz/"))

const nutzervereinbarungbutton = new DivField("div[class*='nutzervereinbarungbutton']")
.withClickEventListener(() => window.location.assign("/nutzervereinbarung/"))
