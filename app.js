
const express = require("express");
const http = require("http");
const ws = require("ws")
const stats = require("./stats.js")  //Import the stat tracker
const Game = require("./game.js");  //Import the game object
const messages = require("./public/js/messages.js")  //Import the messages for client-server JSON communication

const port = process.argv[2];
const app = express();
const server = http.createServer(app).listen(port);
const publicRoot = __dirname + "/public/"  //Game path
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
let currentGame = new Game(stats.gamesStarted++) //Create a game with id 0 and up he counter
const websockets = {} //Array of current websockets

//Handling client-server connection
wsServer.on("connection", function(webs) {
    //Socket assignment on connection
    ws["id"] = socketID++; //Assign unique socket ID
    websockets[ws["id"]] = currentGame //Assign the socket to currently played game
    const playerPosition = currentGame.addPlayer(webs) //Set player position to green or orange

    console.log(`Player ${ws["id"]} got to play in game ${currentGame.id} as player ${playerPosition}`)
    
    //If current game has two players, create a new game
    if (currentGame.readyToGo() == 1) {
        currentGame = new Game(stats.gamesStarted++)
    }

    //Handling client requests
    webs.on("message", function(message) {
        message = JSON.parse(message)
        const gm = websockets[ws["id"]]  //Game of the client
        const players = gm.getPlayers()  //Players of the game
        const playerNum = gm.getPlayerNum(webs)  //Is current player green or orange? (0 - orange, 1 - green)

        console.log(message.type)
        //Handling user wanting to put down a circle
        if (message.type == "P_PUT_CIRCLE") {
            if (gm.whosTurn() == playerNum) {  //Is it the player's turn?
                gm.put(message.data)           //If so, insert correct color at the correct place
                msg = messages.S_UPDATE_BOARD  //Send update message to both players
                msg.newBoard = gm.getBoard()   //New board data to be updated
                console.log(msg.type)
                if (players[0] != null) players[0].send(JSON.stringify(msg)) //Player != null redundant after game starts correctly
                if (players[1] != null )players[1].send(JSON.stringify(msg))
                gm.switchPlayer()               //Change current player's turn to the other player
            }
        }
    })
})