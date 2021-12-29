const ws = require("ws")

//Main game object
const game = function(ID) {
    this.orangePlayer = null;
    this.greenPlayer = null;
    this.id = ID;
    this.status = 0 //1 is orange won, 2 is green won, 3 is draw, -1 is aborted
    this.turn = 0   //0 - oranges turn, 1 - greens turn
    this.board = null
    this.createBoard()  //Populates this.board with -1's; then, 0 will be orange circles and 1's will be green circles
}

//Populate the board
game.prototype.createBoard = function() {
    this.board = []
    for (i = 0; i < 42; i++) {
        this.board.push(-1)
    }
}

//Returns board
game.prototype.getBoard  = function() {
    return this.board
}

//Returns players
game.prototype.getPlayers = function() {
    return [this.orangePlayer, this.greenPlayer]
}

//Updates the board after player successfully clicks something that can be clicked
game.prototype.put = function(c) {
    this.board[c] = this.whosTurn()
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
    if (this.greenPlayer == webs) return 1
    if (this.orangePlayer == webs) return 0
    return -1
}

//Changes current player turn to the other guy
game.prototype.switchPlayer = function() {
    if (this.turn == 0) this.turn = 1
    else this.turn = 0
}

//Returns 1 if both players ready, otherwise 0
game.prototype.readyToGo = function()  {
    if (this.orangePlayer != null && this.greenPlayer != null) {
        return 1
    }
    return 0
}

//Returns turn (0 - orange, 1 green)
game.prototype.whosTurn = function() {
    return this.turn
}

module.exports = game  //Makes the game object accessible via exports for app.js