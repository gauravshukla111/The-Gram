const express = require("express");
const app = express();

const mongoose = require("mongoose");
const { mongoUrl } = require("./keys");
const cors = require("cors");
const { METHODS } = require("http");
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods:["POST","GET"],
    credential:true
  },
});
const path = require("path")
const port = process.env.port || 8000;


app.use(cors());

require("./models/model");
require("./models/post");
app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/createPost"));
app.use(require("./routes/user"));
mongoose.set("strictQuery", true);
mongoose.connect(mongoUrl);

mongoose.connection.on("connected", () => {
  console.log("successfully connected to mongo");
});

mongoose.connection.on("error", () => {
  console.log("Not connected to mongo");
});



io.on("connection", (socket) => {
  console.log("connected");
  socket.on("sendmsg",(msg)=>{
    socket.broadcast.emit("servermsg",msg.message);
   })

});

//serving the frontend
app.use(express.static(path.join(__dirname, "/frontend/build")))
app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname, "/frontend/build/index.html"),
  function (err){
    res.status(500).send(err)
  }
)
})

http.listen(port, () => {
  console.log("server is running on port" + " " + port);
});
