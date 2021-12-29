const ws = require("ws")

const game = function(ID) {
    this.orangePlayer = null;
    this.greenPlayer = null;
    this.id = ID;
    this.status = 0 //1 is orange won, 2 is green won, 3 is draw, -1 is aborted
    this.turn = 0
}

//Adds player, returns 0 if added player is orange, 1 if green and -1 if error (both players locked)
game.prototype.addPlayer = function(p) {
    if (this.orangePlayer == null) {
        this.orangePlayer = p
        return 0
    }
    else if (this.greenPlayer == null) {
        this.greenPlayer = p
        return 1
    }
    return -1
}

//Returns player number of a given player socket
game.prototype.getPlayerNum = function(webs) {
    if (this.greenPlayer == webs) return 0
    if (this.orangePlayer == webs) return 1
    return -1
}

//Returns 1 if both players ready, otherwise 0
game.prototype.readyToGo = function()  {
    if (this.orangePlayer != null && this.greenPlayer != null) {
        return 1
    }
    return 0
}

game.prototype.whosTurn = function() {
    return this.turn
}

module.exports = game