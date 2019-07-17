const publicVapidKey='BOcmC7yJxUlAD1fLLc5YIGTL8CtITy0LQhLOCDkFuJcL5YJ48-13_cthCsBDYpRQiORiybHh4FNQBM-MSAGfZL4';

const urlB64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const socket = io.connect('http://localhost:4000/admin')

const saveSubscription = async (subscription) => {
  var sub = localStorage.getItem('sub_admin');
  
  if(!sub) {

    socket.emit('sendSubscription',window.location.hostname,subscription,data => {
      localStorage.setItem('sub_admin','1');
    })
  }
}


const registerServiceWorker = async () => {
  const swRegistration = await navigator.serviceWorker.register('worker_admin.js',{
    // url đăng ký 
    scope:'/admin'
  })
  return swRegistration
}
const requestNotificationPermission = async () => {
  const permission = await window.Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('Permission not granted for Notification')
  }
  return permission;
}


const main = async () => {
  console.log('cc');
  const swRegistration = await registerServiceWorker()
  const permission = await requestNotificationPermission()
  const applicationServerKey  =urlB64ToUint8Array(publicVapidKey);
  const options ={applicationServerKey,userVisibleOnly: true}
  console.log('service worker activate');
  const subscription= await swRegistration.pushManager.subscribe(options);
  saveSubscription(subscription);
}

$('#btn').click(()=> {
  localStorage.removeItem('sub_admin');
})
