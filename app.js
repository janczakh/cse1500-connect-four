//Main server node app
//Handles client-server-game communication


const express = require("express");
const http = require("http");
const ws = require("ws")
const stats = require("./stats.js")  //Game statistics package
const Game = require("./game.js");  //Game object file
const messages = require("./public/js/messages.js")  //Messages sent between client and server

const app = express();
const server = http.createServer(app);
server.listen(8080, '0.0.0.0');
const publicRoot = __dirname + "/public/"

app.use(express.static(publicRoot));  //make public user-accessible

//Rendering ejs (statistics) on the splash screen
app.set('view engine', 'ejs')
app.get('/', function(req, res) {
    res.render('splash.ejs', { 
        piecesPlaced: stats.piecesPlaced, 
        gamesStarted: stats.gamesStarted, 
        uptime: stats.since});
})

app.get("/game", function(res, req) {
    req.sendFile(publicRoot + "game.html")
})

app.get("/images", function(res, req) {
    req.sendFile(__dirname + "/images/")
})

//Websocket setup
//Each incoming user will get a unique socketID used to distinguish their connection
//Each game gets a unique ID based on stats.gamesInitialized
const wsServer = new ws.Server({server})
let socketID = 0 
let currentGame = new Game(stats.gamesInitialized)
const websockets = {} //Array of current websockets

//Handling client-server connection
wsServer.on("connection", function(webs) {
    //Socket assignment on connection
    webs["id"] = socketID++; //Assign unique socket ID
    websockets[webs["id"]] = currentGame //Assign the socket to currently played game
    const playerPosition = currentGame.addPlayer(webs) //Set player position to green or orange

    //Send player position to the client
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
        currentGame = new Game(stats.gamesInitialized++)  //Create new game
        stats.gamesStarted++
    }

    //Handling client requests
    webs.on("message", function(message) {
        message = JSON.parse(message)
        const gm = websockets[webs["id"]]  //Game of the client
        const players = gm.getPlayers()  //Players of the game
        const playerNum = gm.getPlayerNum(webs)  //Is current player green or orange? (0 - orange, 1 - green)

        //User request to put down a circle
        if (message.type == "P_PUT_CIRCLE") {
            //Put circle only if it's the player's turn and the column is not full
            if (gm.whosTurn() == playerNum && gm.validateColumn(message.data)) { 
                gm.put(message.data)           //Insert correct color at the correct place
                
                //Inform the player's of new board state
                msg = messages.S_UPDATE_BOARD  
                msg.newBoard = gm.getBoard()   //New board data to be updated
                players[0].send(JSON.stringify(msg)) 
                players[1].send(JSON.stringify(msg))
                stats.piecesPlaced++

                //If the player won
                if (gm.checkForWins()) {   
                    //Send win msg to current player        
                    const winmsg = messages.S_YOU_WON  
                    players[playerNum].send(JSON.stringify(winmsg))
                    
                    //Send lose msg to the other fella
                    const losemsg  = messages.S_YOU_LOST
                    players[(playerNum + 1) % 2].send(JSON.stringify(losemsg))

                    console.log(`Player ${playerNum} wins`)
                    gm.finished = true
                    stats.gamesCompleted++
                }
                //Check if draw
                if (gm.checkForDraw() ) {
                    const drawmsg = messages.S_DRAW
                    players[0].send(JSON.stringify(drawmsg))
                    players[1].send(JSON.stringify(drawmsg))
                    gm.finished = true
                    stats.gamesCompleted++
                }
                gm.switchPlayer()               //Change current player's turn to the other player
            }
        }
    })

    //Handling user disconnecting
    webs.on("close", function() {
        const gm = websockets[webs["id"]]  //Game of the client
        const players = gm.getPlayers()  //Players of the game
        const playerNum = gm.getPlayerNum(webs)  //Is current player green or orange? (0 - orange, 1 - green)

        if (gm.finished == true) return //If game is finished, the user can leave without consequences

        stats.gamesAborted++
        //Send information about aborted game to the other player
        otherPlayer = players[(playerNum + 1) % 2]
        if (otherPlayer != null) {
            msg = messages.S_GAME_ABORTED
            otherPlayer.send(JSON.stringify(msg))
        }
        //If the player aborted the game that was currently being filled,
        //Create a new game to avoid making  the queue stuck
        if (gm == currentGame) {
            currentGame = new Game(stats.gamesInitialized++)
        }

    })
})