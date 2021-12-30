
const express = require("express");
const http = require("http");
const ws = require("ws")
const stats = require("./stats.js")  //Import the stat tracker
const Game = require("./game.js");  //Import the game object
const messages = require("./public/js/messages.js")  //Import the messages for client-server JSON communication

//const port = process.argv[2];
const app = express();
const server = http.createServer(app);
server.listen(8080, '0.0.0.0');
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
    webs["id"] = socketID++; //Assign unique socket ID
    websockets[webs["id"]] = currentGame //Assign the socket to currently played game
    const playerPosition = currentGame.addPlayer(webs) //Set player position to green or orange

    //Send player position data to the client
    msg = messages.S_INFORM_PLAYER_NUM
    msg.data = playerPosition
    webs.send(JSON.stringify(msg))

    console.log(`Player ${webs["id"]} got to play in game ${currentGame.id} as player ${playerPosition}`)
    
    //If current game has two players, create a new game
    if (currentGame.readyToGo() == 1) {
        msg = messages.S_BEGIN_GAME  //Send begin message to both players
        const players = currentGame.getPlayers()
        players[0].send(JSON.stringify(msg))
        players[1].send(JSON.stringify(msg))
        currentGame = new Game(stats.gamesStarted++)  //Create new game
    }

    //Handling client requests
    webs.on("message", function(message) {
        message = JSON.parse(message)
        const gm = websockets[webs["id"]]  //Game of the client
        const players = gm.getPlayers()  //Players of the game
        const playerNum = gm.getPlayerNum(webs)  //Is current player green or orange? (0 - orange, 1 - green)

        //Handling user wanting to put down a circle
        if (message.type == "P_PUT_CIRCLE") {
            if (gm.whosTurn() == playerNum && gm.validateColumn(message.data)) {  //Is it the player's turn? Is the column valid? (has empty)
                gm.put(message.data)           //If so, insert correct color at the correct place
                msg = messages.S_UPDATE_BOARD  //Send update message to both players
                msg.newBoard = gm.getBoard()   //New board data to be updated
                players[0].send(JSON.stringify(msg)) 
                players[1].send(JSON.stringify(msg))
                stats.piecesPlaced++            //Up the pieces counter

                check = gm.checkForWins()       //Check if the player won
                if (check) {                    //If won
                    const winmsg = messages.S_YOU_WON  //Send win msg to current player
                    players[playerNum].send(JSON.stringify(winmsg))
                    const losemsg  = messages.S_YOU_LOST
                    players[(playerNum + 1) % 2].send(JSON.stringify(losemsg))  //Send lose msg to the other fella
                    console.log(`Player ${playerNum} wins`)
                    gm.finished = true
                    stats.gamesCompleted++
                }
                gm.switchPlayer()               //Change current player's turn to the other player
            }
        }
    })

    webs.on("close", function() {
        const gm = websockets[webs["id"]]  //Game of the client
        const players = gm.getPlayers()  //Players of the game
        const playerNum = gm.getPlayerNum(webs)  //Is current player green or orange? (0 - orange, 1 - green)
        if (gm.finished == true) return
        stats.gamesAborted++
        otherPlayer = players[(playerNum + 1) % 2]
        console.log(otherPlayer)
        if (otherPlayer != null) {
            msg = messages.S_GAME_ABORTED
            otherPlayer.send(JSON.stringify(msg))
        }
        if (gm == currentGame) {
            currentGame = new Game(stats.gamesStarted++)
        }
        // else {
        //     gm = new Game(stats.gamesStarted++)
        // }
    })
})