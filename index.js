const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

const gamedirectory = path.join(__dirname, "html");

app.use(express.static(gamedirectory));

httpserver.listen(3000);

var rooms = [];
var usernames = [];

var roomData={};

function roomDataPreset(owner){
  this.data={
    "owner":owner,
    "blocks":{

    },
    "chunks":{
      "0:0":{

      },
      "1:0":{

      },
      "1:1":{

      },
      "0:1":{

      },
      "-1:1":{

      },
      "-1:0":{

      },
      "-1:-1":{

      },
      "0:-1":{
        
      },
      "1:-1":{

      },
    }
  }
  return this.data;
}


io.on('connection', function(socket){

  socket.on("joingame", function(room, username){
    if (username != ""){
      rooms[socket.id] = room;
      usernames[socket.id] = username;

      socket.leaveAll();
      socket.join(room);

      if(!(room in roomData)){
        roomData[rooms[socket.id]]=roomDataPreset(usernames[socket.id]);
      }

      io.in(room).emit("crecieve", {
        text:"Server : " + username + " has entered the chat.",
        blocks:roomData[rooms[socket.id]]["blocks"],
        owner:roomData[rooms[socket.id]]["owner"]
      });
      socket.emit("join", rooms[socket.id]);
    }
  })

  socket.on("send", function(message){
    io.in(rooms[socket.id]).emit("recieve", [usernames[socket.id],message]);
    // console.log(rooms[socket.id]);
    // console.log("Recieved. "+message.x);
  });

  socket.on("block",function(block){
    io.in(rooms[socket.id]).emit("block",block);
      // if(!(rooms[socket.id] in roomData)){
      //   roomData[rooms[socket.id]]=roomDataPreset(usernames[socket.id]);
      // }
    roomData[rooms[socket.id]]["blocks"][block.id]=block;
  });

  socket.on("recieve", function(message){
    socket.emit("recieve", message);
  })
});