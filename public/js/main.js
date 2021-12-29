
//Main setup of the clientside
(function setup() {
    const socket = new WebSocket(Setup.URL) //Socket connection to the server

    //Handling inputus from the server
    socket.onmessage = function (ms) {
        
        ms = JSON.parse(ms.data)
        if (ms.type == "S_UPDATE_BOARD") {  //Refreshes the board
            gameInfo.refreshBoard(ms.newBoard)
        }
    }
    const gameInfo = new GameInfo(socket) //Create gameInfo object for the client
    //initializeCircles(gameInfo)
    // socket.onopen = function() {
    //     socket.send(JSON.stringify(s))
    // }
})();

//Game info object, stores client's data about the game
function GameInfo(socket) {  
    this.socket = socket
    initializeCircles(this)
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
        id++
    })
    gameInfo.circles = circles  //Assign the circles array to gameInfo variable
}

//TODO: Changing player flame

//Clock method for keeping time
//Currently capable of skipping a second very rarely due to time dilation and black holes
function timeKeeper() {
    var beginTime = new Date();  //Time the session began
    
    //Changes the time on the clock
    function editTime() {
        var curTime = new Date();
        var elapsedSeconds = Math.floor((curTime - beginTime)/1000);  //How many seconds elapsed since the beginning? (Divided by 1000 cause ms)
        var elapsedMinutes = Math.floor(elapsedSeconds/60); //How many minutes?
        elapsedSeconds = elapsedSeconds - elapsedMinutes*60; //How many seconds if we remove the minutes?
        if (elapsedMinutes < 10) {  //Add a leading 0 if minutes < 10
            elapsedMinutes = "0" + elapsedMinutes;
        }
        if (elapsedSeconds < 10) { //Same for seconds
            elapsedSeconds = "0" + elapsedSeconds;
        }
        document.getElementById("clock").textContent = elapsedMinutes + ":" + elapsedSeconds;  //Update the DOM #clock
    }
    var timer = setInterval(editTime, 1000);  //Update every second
}

document.addEventListener('DOMContentLoaded', timeKeeper);