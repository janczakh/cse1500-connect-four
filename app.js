

const express = require("express");
const req = require("express/lib/request");
const http = require("http");
const ws = require("ws")
const stats = require("./stats.js")
const Game = require("./game.js")

const port = process.argv[2];
const app = express();
const server = http.createServer(app).listen(port);
const publicRoot = __dirname + "/public/"
const publicSplashRoot = __dirname + "/public/"

app.use(express.static(publicRoot));  //If user requests /public send the file

//In the beginning serve /public/splash.html
app.get("/", function(res, req) {
    req.sendFile(publicRoot + "game.html")
})

//Serve the game under /game
app.get("/game", function(res, req) {
    req.sendFile(publicRoot + "game.html")
})

app.get("/images", function(res, req) {
    req.sendFile(__dirname + "/images/")
})
//Websocket setup
const wsServer = new ws.Server({server})
let socketID = 0 //Id of current websocket
let currentGame = new Game(stats.gamesStarted++)
const websockets = {} //Array of current websockets

wsServer.on("connection", function(webs) {
    //Socket assignment
    ws["id"] = socketID++;
    websockets[ws["id"]] = currentGame
    const playerPosition = currentGame.addPlayer(webs) //Set player position to green or orange

    console.log(`Player ${ws["id"]} got to play in game ${currentGame.id} as player ${playerPosition}`)
    webs.send(playerPosition == 0 ? 0 : 1) //Inform the player of their type
    
    //Game handling
    if (currentGame.readyToGo() == 1) {
        currentGame = new Game(stats.gamesStarted++)
    }

    webs.on("message", function(message) {
        console.log(message)
        const gm = websockets[ws["id"]]
        const playerNum = gm.getPlayerNum(webs)
        console.log(playerNum)
    })
})