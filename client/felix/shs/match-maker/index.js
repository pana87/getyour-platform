import { ButtonField } from "../../../js/ButtonField.js"
import { TextField } from "../../../js/TextField.js"

const PATH_TO_TECHNICIAN_LIST = "/felix/shs/404/"
const SHS_MATCH_MAKER_STORAGE = "shsMatchMaker"

const zip = new TextField("div[class*=plzinputfeld]").withPlaceholder("Postleitzahl..").withSHSDefault().sync().withBackgroundColor("#ebebeb")

new ButtonField("div[class*=preufeninputfeld]").withOnclick(() => startMatchMaking())//.withAssign(PATH_TO_TECHNICIAN_LIST)

function startMatchMaking() {
  // zip.storeInputToLocalStorage(SHS_MATCH_MAKER_STORAGE)



  // window.location.assign(PATH_TO_TECHNICIAN_LIST)
}
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  const crd = pos.coords;

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);
