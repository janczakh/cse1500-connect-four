const ws = require("ws")

//Main game object
const game = function(ID) {
    this.orangePlayer = null;
    this.greenPlayer = null;
    this.id = ID;
    this.finished = false
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
    c = c % 7 + 35 //Move to the last row of the column containing the given index; c % 7 finds the column, +35 moves to the last row
    while (true) {
        if  (this.board[c] == -1) { //If found empty spot, insert
            this.board[c] = this.whosTurn()  //Insert the number correspoding to current player's turn
            return
        }
        c -= 7   //If didn't find empty spot, go up (since the column was validated by app.js, we must break at some point)
    }
}

game.prototype.checkForWins = function() {
    for (pos = 0; pos < 42; pos++) {
        //console.log(pos + "position")
        //Horizontal test
        if (pos % 7 < 4 && pos+3 < 42) {
            if(this.checkEquals(pos, 1)) {
                return true
            }
        }
        if (pos + 21 < 42) {  //Everything vertical must be at least at height 4, so 21 circles underneath
            //Vertical test
            if(this.checkEquals(pos, 7)) {  //We check 4 circles, each 7 apart (so right under)
                return true
            }
            //Diagonal-right test
            if (pos % 7 < 4) {  //For diagonal-right, we must be at least 4 away from the right wall
                if(this.checkEquals(pos, 8)) { //Every 8, 7 for next row and 1 for diagonalization
                    return true
                }
            }
            //Diagonal-left test
            if (pos % 7 >= 3) { //Must be at least at position 3 in row
                if(this.checkEquals(pos, 6)) { //Down and left
                    return true
                }
            }
        }
    }
    return false
}

game.prototype.checkEquals = function(pos, diff)  {
    //if (pos == 38) console.log(pos, this[pos] == this[pos+1], this[pos] == this)
    return (this.board[pos] != -1 && this.board[pos] == this.board[pos+diff] 
        && this.board[pos+2*diff] == this.board[pos+3*diff]
        && this.board[pos+diff*2] == this.board[pos+diff])
}

//Checks if a clicked column has at least one empty space by going forwards from the first row (0-6) to the last
//Each time incrementing the idx by 7 effectively moving one row down without changing column\
//Returns true if found empty spot, false otherwise
game.prototype.validateColumn = function(idx) {
    idx %= 7 //Find the topmost column position
    while (idx < 42) { 
        if (this.board[idx] == -1) return true  //Found empty spot, return true
        idx += 7  //Otherwise go to next row
    }
    return false //No empty spots

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