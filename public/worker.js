// const publicVapidKey='BOcmC7yJxUlAD1fLLc5YIGTL8CtITy0LQhLOCDkFuJcL5YJ48-13_cthCsBDYpRQiORiybHh4FNQBM-MSAGfZL4';

// const urlB64ToUint8Array = base64String => {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
//   const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
//   const rawData = atob(base64)
//   const outputArray = new Uint8Array(rawData.length)
//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i)
//   }
//   return outputArray
// }

// const socket = io.connect('http://localhost:4000/client')

// const saveSubscription = async subscription => {
//   socket.emit('sendSubscription',JSON.stringify(subscription))
// }

const showLocalNotification = (title, body, swRegistration) => {
  const options = {
    body:body,
    icon:"http://icons.iconarchive.com/icons/marcus-roberto/google-play/512/Google-Chrome-icon.png",
    vibrate: [500,110,500,110,450,110,200,110,170,40,450,110,200,110,170,40,500]
    // here you can add more properties like icon, image, vibrate, etc.
  }
  swRegistration.showNotification(title, options)
}

// self.addEventListener('activate',async (e) => {
//   console.log('cc');
//   const applicationServerKey  =urlB64ToUint8Array(publicVapidKey);
//   const options ={applicationServerKey,userVisibleOnly: true}
//   console.log('service worker activate');
//   const subscription= await self.registration.pushManager.subscribe(options);
//   saveSubscription(subscription);
//   console.log(subscription);
// })

self.addEventListener('push', function(event) {
  event.waitUntil(clients.matchAll({
    type: "window"
  }).then(function(clientList) {
      if(clientList.length==0) {   
        if (event.data) {
          console.log(event.data.json());
          showLocalNotification(event.data.json().title,event.data.json().body,self.registration);
        } else {
          console.log('Push event but no data')
        }
      }
  })); 
})
self.addEventListener('notificationclick',(event)=> {
  console.log('cc');
  event.waitUntil(
    clients.openWindow("http://localhost:4000/client")
  )
})