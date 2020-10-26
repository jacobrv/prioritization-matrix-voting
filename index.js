var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let votes = [];

io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit("vote", votes);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("vote", (msg) => {
    console.log(msg);

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

    io.emit("vote", votes);
  });

  socket.on("unvote", (msg) => {
    votes = votes.filter((row) => {
      return row.userId !== msg.userId;
    });
    io.emit("vote", votes);
  });

  socket.on("clear", (msg) => {
    console.log(msg);
    votes = [];
    io.emit("vote", votes);
  });
});
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("listening on *:" + PORT);
});
