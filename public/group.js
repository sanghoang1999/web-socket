



var app = new Vue({
  el:"#app",
  data:function() { return  {
    messages :[],
    message:'',
    thisUser:'',
    socket: io.connect('http://localhost:4000/admin/group')
  }},
  methods: {
    send(e) {
      e.preventDefault();
      if(this.message!="") {
        console.log(this.message);
        this.socket.emit("sentMessageToGroup",this.message,(data)=> { 
            //this.messages.push(data);
        });
        this.message='';
      }
      
    }
  },
  mounted:function() {
    var id_group=localStorage.getItem('id_group');
    this.socket.emit("check",id_group,(id) => {
      localStorage.setItem('id_group',id);
      this.socket.on('thisUser',(user)=>{ 
        this.thisUser=user;
      })
    });
    this.socket.on('sentMessageToGroup',(msg)=> {
      msg = msg.shift();
      console.log(msg);
      this.messages.push(msg);
    })
    this.socket.on('groupMessage',(msg)=> {
      console.log(msg);
      this.messages=msg;
    })

  }
})