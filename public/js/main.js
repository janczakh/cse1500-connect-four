
//Main setup of the clientside
(function setup() {
    const socket = new WebSocket(Setup.URL) //Socket connection to the server
    socket.onmessage = function (ms) {
        
    }
    const gameInfo = new GameInfo(socket)
    let s = {
        dupa: 5
    }
    socket.send("cf")
    console.log("sent")
})();

function GameInfo(socket) {
    this.playerType = null
    this.socket = socket
    this.circles = document.querySelectorAll(".circle")
}

//TODO: Changing player flame

//Clock method
function timeKeeper() {
    var beginTime = new Date();
    
    function editTime() {
        var curTime = new Date();
        var elapsedSeconds = Math.floor((curTime - beginTime)/1000);
        var elapsedMinutes = Math.floor(elapsedSeconds/60);
        elapsedSeconds = elapsedSeconds - elapsedMinutes*60;
        if (elapsedMinutes < 10) {
            elapsedMinutes = "0" + elapsedMinutes;
        }
        if (elapsedSeconds < 10) {
            elapsedSeconds = "0" + elapsedSeconds;
        }
        document.getElementById("clock").textContent = elapsedMinutes + ":" + elapsedSeconds;
    }
    var timer = setInterval(editTime, 1000);
}

document.addEventListener('DOMContentLoaded', timeKeeper);