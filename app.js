const express = require("express");
const req = require("express/lib/request");
const http = require("http");
const ws = require("ws")

const port = process.argv[2];
const app = express();
const server = http.createServer(app).listen(port);
const publicRoot = __dirname + "/public/game/"
const publicSplashRoot = __dirname + "/public/splash/"

app.use(express.static(publicRoot));  //If user requests /public send the file

//In the beginning serve /public/index.html
app.get("/", function(res, req) {
    req.sendFile(publicRoot + "index.html")
})

//Serve the game under /game
app.get("/game", function(res, req) {
    req.sendFile(publicRoot + "index.html")
})

//Websocket seup
const wsServer = new ws.Server({server})
socketID = 0
const websockets = {} //Array of current websockets

wsServer.on("connection", function(webs) {
    ws["id"] = socketID++;
    console.log("connection established with " + webs  + " with an ID of " + ws["id"])
    webs.on("message", function(data) {
        data = data.toString()
        if  (data == "user_confirm") {
            console.log("User connection established")
            webs.send("connection_confirm")
        }
    })
})