console.log('worker admin');

const showLocalNotification = (title, body, swRegistration) => {
  const options = {
    body:body,
    icon:"http://icons.iconarchive.com/icons/marcus-roberto/google-play/512/Google-Chrome-icon.png",
    vibrate: [500,110,500,110,450,110,200,110,170,40,450,110,200,110,170,40,500],
    sound:'https://notificationsounds.com/soundfiles/4e4b5fbbbb602b6d35bea8460aa8f8e5/file-sounds-1096-light.mp3'
    
  }
  swRegistration.showNotification(title, options)
}



self.addEventListener('push', function(event) {
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
        if (event.data) {
          console.log(event.data.json());
          showLocalNotification(event.data.json().title,event.data.json().body,self.registration);
        } else {
          console.log('Push event but no data')
        }
  })); 
})
self.addEventListener('notificationclick',(event)=> {
  console.log('cc');
  event.waitUntil(
    clients.openWindow("http://localhost:4000/admin")
  )
})