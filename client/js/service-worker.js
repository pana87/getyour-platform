self.addEventListener('notificationclick', ev => {
  // Behandeln Sie Benachrichtigungsklicks
  console.log(ev);
})

self.addEventListener('push', ev => {
  const data = ev.data.json()
  console.log(data);
  // Filtern und verarbeiten Sie Benachrichtigungen basierend auf den Daten
  // if (data.group === 'admin') {
  //   self.registration.showNotification(data.title, {
  //     body: data.body
  //   })
  // }
})
