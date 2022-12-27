
/**
 * wenn nutzer sich durch den funnel geklickt hat
 * -> dann liste mit hersteller erstellen
 * (name, logo, ranking, price, kommentare/erfahrungen, mehr infos über den hersteller)
 */

/**
 * wenn hersteller angeklickt wird
 * -> dann erstelle eine options page aus dem angebots pdf
 */


/**
 * wenn options submit gelickt wird
 * -> dann frage nach den persönlichen daten mit passwort
 * -> dann speicher alle daten des nutzers in unsere datenbank
 * -> dann erstellen das angebot als pdf ---------------------------------------------------------OK
 * -> dann zeige das pdf an oder biete es als download an ----------------------------------------OK
 * @media print {}
 * -> dann gehe auf die checklisten page für den anlagenbetreiber --------------------------------OK
 */

/**
 * wenn anlagenbetreiber auf der checklisten page gelandet ist
 * -> dann ist die erste option, das pdf unterschrieben hochzuladen. ? unterschrieben hochladen oder durch klicken oder beides ?
 * -> dann alle weiteren optionen wie im design. -------------------------------------------------OK
 */

/**
 * 1. Option der Checkliste was kann er machen?
 *  - angebot anschauen
 *  - angebot ausdrucken
 *  - angebot hochladen
 *  - angebot direkt kaufen (mit zahlungssystem auf treuhandkonto)
 *    -> extra page vollballern mit sicherheit
 *    -> vielleicht erste berührung mit monteur??
 *  - noch was?
 */


import { ButtonField } from "../../../../js/ButtonField.js"


// const what = window.encodeURIComponent(document.body.outerHTML)
// console.log(what);

// print page
new ButtonField("div[class*='weiter-zum-profil']").withOnclick(() => window.print())



// import { jsPDF } from "./../../../../node_modules/jspdf/dist/jspdf.umd.min.js"
// const { jsPDF } = window.jspdf;

// const doc = new jsPDF({
  // encryption: {
  //   userPassword: "admin",
  // }
// });
// console.log(doc);

// doc.text("Hello world!", 10, 10);
// doc.addPage()
// doc.comment("hi")
// doc.setCreationDate(new Date())
// console.log(doc.output());
// console.log(doc.output("blob"));
// console.log(doc.output("bloburi"));
// console.log(doc.output("datauristring"));
// console.log(doc.output("datauristring", "bestprime-angebot.pdf"));

// doc.save("bestprime-angebot.pdf");
// console.log(doc);

// import { jsPDF } from "./../..//../node_modules/jspdf/dist/jspdf.umd.min.js"

// const { jsPDF } = window.jspdf;

// const doc = new jsPDF();
// doc.text("Hello world!", 10, 10);
// doc.save("a4.pdf");


// const TO_PROFILE_PATHNAME = "/felix/shs/404/"

// new ButtonField("div[class*='weiter-zum-profil']").withAssign(TO_PROFILE_PATHNAME)

// const shsFunnel = JSON.parse(window.localStorage.getItem("shsFunnel"))

// Default export is a4 paper, portrait, using millimeters for units
// const doc = new jsPDF();
// console.log(doc);

// doc.text("Hello world!", 10, 10);
// doc.save("a4.pdf");
// console.log(doc);

