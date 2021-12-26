//Main setup of the clientside
(function setup() {
    const socket = new WebSocket(Setup.URL) //Socket connection to the server
    socket.onopen = function () {
         socket.send("user_confirm")
    }
    socket.onmessage = function (ms) {
        if(ms.data == "connection_confirm") {
            console.log("Server connection established")
        }
    }
})();

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