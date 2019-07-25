// Vue.component('cc', {
//   data: function () {
//     return {
//       count: 0
//     }
//   },
//   template: '<button ref="feed" v-on:click="count++">You clicked me {{ count }} times.</button>'
// })


var app = new Vue({
  el:"#app",
  data:function() { return  {
    adminHostName:'sanghoangweb.000webhostapp.com',
    sub:localStorage.getItem('sub'),
    isResponse:false,
    cc:null,
    isTyping:false,
    typingClock:null,
    isMoblie:false  ,
    image:0,
    messages :[],
    message:'',
    change:0,
    socket: io.connect('http://localhost:4000/client')
  }},
  beforeDestroy () {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize)
    }
  },
  created() {
    window.addEventListener('resize', this.onResize)
  },
  methods: {
    send(e) {
      e.preventDefault();
      if(this.message!="") {
        this.socket.emit("oneClientSendMessage",this.message,window.location.hostname,(data)=> { 
            //this.messages.push(data);
        });
        if(this.isResponse==false) {
          this.socket.emit('sendNotification',this.adminHostName,this.message);
        }
        this.message='';
      }
    },
    scrollToBottom() {
      setTimeout(() => {
           if(this.$refs.feed) {
            this.$refs.feed.scrollTop = this.$refs.feed.scrollHeight;
           }
      },50)
   },
   onResize () {
    this.isMobile = window.innerWidth < 600
    },
    typing() {
      this.socket.emit('ClientTyping');
    }
  },
  mounted:function() {
    this.socket.emit('selectDb',window.location.hostname);
    this.socket.on('AdminTyping',()=> {
      this.isTyping=true;
      if(this.typingClock) clearTimeout(this.typingClock);
      this.typingClock =setTimeout(()=> {
        this.isTyping=false;
      },3000)
    })
    var id = localStorage.getItem('id');
    this.socket.emit("check",id,(id) => {
      localStorage.setItem('id',id);
    });
    this.socket.on('ll',(msg)=>{
    })
    this.socket.on('messageClientToAdmin',(msg)=>{

      this.messages.push(msg);
       this.scrollToBottom();
    })
    this.socket.on('messageAdminToClient',(msg) => {
      this.isResponse=true;
      clearTimeout(this.typingClock);
      this.isTyping=false;
      this.messages.push(msg);
      
    })
    this.socket.on('clientMessages',(msgs)=> {
      this.messages=msgs;
    })
  },
  updated() {
    this.scrollToBottom();
  }
})