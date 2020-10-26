var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
  let roomCode = req.query.room;
  if (!roomCode) {
    roomCode = Math.floor(Math.random() * 100000);
    res.redirect(`/?room=${roomCode}`);
  } else {
    res.sendFile(__dirname + "/public/index.html");
  }
});
app.use(express.static("public"));

let rooms = [];

io.on("connection", (socket) => {
  console.log("a user connected");
  let roomId = socket.request._query["roomId"];
  if (!rooms[roomId]) {
    rooms[roomId] = [];
  }
  socket.join(roomId);

  io.to(roomId).emit("vote", rooms[roomId]);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("vote", (msg) => {
    console.log(msg);

    let votes = rooms[msg.roomId];

    let isNew = true;
    for (let i = 0; i < votes.length; i++) {
      if (votes[i].userId == msg.userId) {
        votes[i] = msg;
        isNew = false;
      }
    }
    if (isNew) {
      votes.push(msg);
    }

    rooms[msg.roomId] = votes;

    io.to(msg.roomId).emit("vote", votes);
  });

  socket.on("unvote", (msg) => {
    let votes = rooms[msg.roomId];

    votes = votes.filter((row) => {
      return row.userId !== msg.userId;
    });

    rooms[msg.roomId] = votes;

    io.to(msg.roomId).emit("vote", votes);
  });

  socket.on("clear", (msg) => {
    console.log(msg);
    rooms[msg.roomId] = [];
    io.to(msg.roomId).emit("vote", []);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
