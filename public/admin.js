

var app =new Vue({
  el : '#app',
  data: {
    isTyping:false,
    typingClock:null,
    countMessage:1,
    clientOut:'',
    clientOn:'',
    isSelected:'',
    clients:[],
    selectedUser:'',
    message:'',
    messages:[],
    socket : io.connect('http://localhost:4000/admin')
  },
  computed: {
    // sortClients:function() {
    //   return _.sortBy(this.clients,[(client)=> {
    //     return client.unread;
    //   }])
    // }
  },
  methods: {
    send(e) {
      e.preventDefault();
      if(this.message!='') {
        this.socket.emit('messageAdminToClient',this.message,this.selectedUser.client_id,(msg) => {
          this.messages.push(msg);
          this.scrollToBottom();
          if(!this.selectedUser.isOnline) {
            this.socket.emit('sendNotification',this.selectedUser.client_id,window.location.hostname,msg.message);
          }
        });
        this.message=''
      }
      
    },
    selectUser(user) {
      clearTimeout(this.typingClock);
      this.isTyping=false;
      this.isSelected=true;
      this.selectedUser=user;
      this.clients=this.clients.map((client)=> {
        if(client.client_id ==this.selectedUser.client_id) {
          client.unread=0;
          return client;
        }
        return client;
      })
      this.socket.emit('chooseClientToChat',this.selectedUser.client_id);
    },
    scrollToBottom() {
      setTimeout(() => {
           this.$refs.feed.scrollTop = this.$refs.feed.scrollHeight;
      },50)
    },
    typing() {
      this.socket.emit('AdminTyping',this.selectedUser.client_id);
    }
   
  },
  mounted: function() {
    this.socket.on('clientDisconnect',(clientId)=> {
      this.clients=this.clients.map(client=>{
        if(client.client_id!=clientId) {
          return client;
        }
        client.isOnline=false;
        return client;
      })
    })
    this.socket.on('clientConnected',(clientId)=> {
      this.clients=this.clients.map(client=>{
        if(client.client_id!=clientId) {
          return client;
        }
        client.isOnline=true;
        return client;
      })
    })
    this.socket.on('ClientTyping',(clientID)=> {
      if(clientID==this.selectedUser.client_id) {
        this.isTyping=true;
        if(this.typingClock) clearTimeout(this.typingClock);
        this.typingClock=setTimeout(()=> {
          this.isTyping=false;
        },3000)
      }
      this.scrollToBottom();
      
    })
    this.socket.on('listClient',(clients) => {
      clients=clients.sort((a,b)=> {
        return b.unread-a.unread;
      })
      this.clients=clients;
    })
    this.socket.on('addClient',(newClient) => { 
      this.clientOn=newClient;
      this.isOnline=true; 
      this.clients.unshift(newClient);
    })
    this.socket.on('messageClientToAdmin',(msg) => {
        clearTimeout(this.typingClock);
        this.isTyping=false;
        this.clients=this.clients.map((client)=> {
          if(client.client_id ==msg.from && client.client_id != this.selectedUser.client_id) {
            client.unread +=1;
            return client;
          }
          return client;
        })
        if(msg.from==this.selectedUser.client_id) {
          this.messages.push(msg);
        }
        this.clients=this.clients.sort((a,b)=> {
          return b.unread-a.unread;
        })
        this.scrollToBottom();
    });
    this.socket.on('messagesUserSelected',(msg) => {
      this.messages=msg;
      this.scrollToBottom();
    })
    },
  update() {
   
  }
})