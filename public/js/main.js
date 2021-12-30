//Main setup of the clientside
(function setup() {
    const socket = new WebSocket(Setup.URL) //Socket connection to the server

    const gameInfo = new GameInfo(socket) //Create gameInfo object for the client
    //Handling inputs from the server
    socket.onmessage = function (ms) {
        
        ms = JSON.parse(ms.data)
        if (ms.type == "S_INFORM_PLAYER_NUM") {
            gameInfo.turn = ms.data
            gameInfo.switchTurn(gameInfo.turn)
            if (gameInfo.turn == 1) {
                gameInfo.yourTurn.style.color = "green"
                gameInfo.opponentTurn.style.color = "orange"
            }
            else {
                gameInfo.yourTurn.style.color = "orange"
                gameInfo.opponentTurn.style.color = "green"
            }
        }
        
        if (ms.type == "S_BEGIN_GAME") {
            initializeCircles(gameInfo)
            gameInfo.clock.beginTimeKeeping()
        }

        if (ms.type == "S_UPDATE_BOARD") {  //Refreshes the board
            gameInfo.refreshBoard(ms.newBoard)
        }

        if (ms.type == "S_YOU_WON") {
            console.log("RECEIVED WIN INFO")
            gameInfo.win()
        }

        if (ms.type == "S_YOU_LOST") {
            console.log("RECEIVED LOSE INFO")
            gameInfo.lose()
        }

        if (ms.type == "S_GAME_ABORTED") {
            console.log("RECEIVED ABORT INFO")
            gameInfo.abort()
        }
    }
    //initializeCircles(gameInfo)
    // socket.onopen = function() {
    //     socket.send(JSON.stringify(s))
    // }
})();

//Game info object, stores client's data about the game
function GameInfo(socket) {
    this.yourTurn = document.querySelector("#yourturn")
    this.opponentTurn = document.querySelector("#opponentturn")
    this.turn = null  
    this.socket = socket
    this.circles = null
    this.clock = new Clock()
    this.finished = false
}

//Refreshes the board with new data (-1 is nothing, 0 is orange, 1 green)
GameInfo.prototype.refreshBoard = function(newBoard) {
    for (i = 0; i < 42; i++) {
        if (newBoard[i] == 0) {
            this.circles[i].style.backgroundColor = "orange"
        }
        if  (newBoard[i] == 1) {
            this.circles[i].style.backgroundColor = "green"
        }
    }
    this.turn = (this.turn + 1) % 2
    this.switchTurn(this.turn)
}

GameInfo.prototype.switchTurn = function(turn) {
    if (this.finished) return   
    if (this.turn == 0) {
        this.yourTurn.style.opacity = 1
        this.opponentTurn.style.opacity = 0.3
    }
    if (this.turn == 1) {
        this.yourTurn.style.opacity = 0.3
        this.opponentTurn.style.opacity = 1
    }
}

//Sends requests to the server
GameInfo.prototype.sendRequest = function(req) {
    console.log("sending request..")
    this.socket.send(JSON.stringify(req))
}

//Creates the array of circles and adds an event listener to every one of them
function initializeCircles(gameInfo) {
    circles = document.querySelectorAll(".circle")  //Select all .circle DOM objects
    var id = 0;     //Initialize ID, unique for each circle
    //For each circle, assign it an ID and add an event listener
    circles.forEach(function(el) {  
        el.id = id
        el.addEventListener("click", function(e)  {  //If clicked, sends the P_PUT_CIRCLE request to the server with circle ID as data
            msg = Messages.P_PUT_CIRCLE
            msg.data = el.id
            gameInfo.sendRequest(msg)
        })
        el.addEventListener("mouseenter", function(e) {
            gameInfo.highlightCol(el.id)
        })
        el.addEventListener("mouseleave", function(e) {
            gameInfo.dehighlightCol(el.id)
        })
        id++
    })
    gameInfo.circles = circles  //Assign the circles array to gameInfo variable
}

GameInfo.prototype.highlightCol = function(col) {
    if (this.finished) return
    col = col % 7 + 35
    while (col >= 0) {
        if (this.circles[col].style.backgroundColor != "orange" && this.circles[col].style.backgroundColor != "green") {
            this.circles[col].style.backgroundColor = "aquamarine"
            return
        }
        col -= 7
    }
}

GameInfo.prototype.dehighlightCol = function(col) {
    col = col % 7 + 35
    while (col >= 0) {
        if (this.circles[col].style.backgroundColor == "aquamarine" ) {
            this.circles[col].style.backgroundColor = "#0066a2"
            return
        }
        col -= 7
    }
}

GameInfo.prototype.win = function() {
    this.finish()
    this.clock.setWinData()
}

GameInfo.prototype.abort = function() {
    this.finish()
    this.clock.setAbortData()
}

GameInfo.prototype.lose = function() {
    this.finish()
    this.clock.setLoseData()
}

GameInfo.prototype.finish = function() {
    this.finished = true
    this.yourTurn.style.opacity = 0
    this.opponentTurn.style.opacity = 0
    clearInterval(this.clock.interval)
    this.clock.setFinishData()
}


///CLOOOOOOOOOOCK 

function Clock() {
    this.dom = document.getElementById("clock")
    this.beginTime = null
    this.interval = null
}

Clock.prototype.setFinishData = function() {
    var dom = this.dom
    dom.style.fontSize = "40px"
    dom.style.height = "600px"
    dom.style.marginTop = "-300px"
}
Clock.prototype.setWinData = function() {
    this.dom.innerHTML = `<h3>You Won!</h3><h6>Was it skill, or pure luck?<h6>
    <a href = "/game"> Play again<br>
    <a href = "/"> Leave</a>`
}

Clock.prototype.setAbortData = function() {
    this.dom.innerHTML = `<h3>Your game was aborted.</h3><h6>Did your opponent get scared?<h6>
    <a href = "/game"> Play again<br>
    <a href = "/"> Leave</a>`
}

Clock.prototype.setLoseData = function() {
    this.dom.innerHTML = `<h3>You Lost!</h3><h6>I strongly recommend acquiring revenge.<h6>
    <a href = "/game"> Play again<br>
    <a href = "/"> Leave</a>`
}
//Clock method for keeping time
//Currently capable of skipping a second very rarely due to time dilation and black holes
Clock.prototype.beginTimeKeeping = function() {
    this.beginTime = new Date();  
    var clock = this.dom
    clock.textContent = "00:00"
    clock.style.fontSize = "70px"//Time the session began
    this.interval = setInterval(this.editTime.bind(this), 1000)

}

//Changes the time on the clock
Clock.prototype.editTime = function() {
    var curTime = new Date();
    var elapsedSeconds = Math.floor((curTime - this.beginTime)/1000);  //How many seconds elapsed since the beginning? (Divided by 1000 cause ms)
    var elapsedMinutes = Math.floor(elapsedSeconds/60); //How many minutes?
    elapsedSeconds = elapsedSeconds - elapsedMinutes*60; //How many seconds if we remove the minutes?
    if (elapsedMinutes < 10) {  //Add a leading 0 if minutes < 10
        elapsedMinutes = "0" + elapsedMinutes;
    }
    if (elapsedSeconds < 10) { //Same for seconds
        elapsedSeconds = "0" + elapsedSeconds;
    }
    clock.textContent = elapsedMinutes + ":" + elapsedSeconds;  //Update the DOM #clock
}

// function alertSize() {
//     console.log(window.innerHeight +" " + window.innerWidth)
//     if (window.innerHeight < 650 || window.innerWidth < 1400) window.alert("You screen size is too small. The game might look rubbish.")
// }
// window.onresize = alertSize
