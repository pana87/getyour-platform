console.log(Pi)
const scopes = []
function onIncompletePaymentFound(payment) {console.log(payment)}
Pi.init({ version: "2.0", sandbox: true })
Pi.authenticate(scopes, onIncompletePaymentFound).then(auth => {
  console.log(auth)
}).catch(error => console.error(error))
