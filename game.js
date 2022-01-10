//Game object is initialized for each game being played
//Game object handles all the interaction with the board via the server
//Performs move validation, finish validation and keeps track of the board state

const ws = require("ws")

//Main game object
const game = function(ID) {
    this.orangePlayer = null;
    this.greenPlayer = null;
    this.id = ID;
    this.finished = false
    this.turn = 0   //0 - oranges turn, 1 - greens turn
    this.board = null
    this.createBoard()
}

//Populate the board
//-1 - nothing placed, 0 - orange placed, 1 - green placed
game.prototype.createBoard = function() {
    this.board = []
    for (i = 0; i < 42; i++) {
        this.board.push(-1)
    }
}

game.prototype.getBoard  = function() {
    return this.board
}

game.prototype.getPlayers = function() {
    return [this.orangePlayer, this.greenPlayer]
}

//Updates the board after player successfully clicks something that can be clicked
//Param: column number c
//The methods crashes if the column is not properly validated beforehand
//Finds the first row which has an empty spot at that column by repeatedly going upwards from the bottom
game.prototype.put = function(c) {
    c = c % 7 + 35 //Last row of the column
    while (true) {
        if  (this.board[c] == -1) { //If found empty spot, insert
            this.board[c] = this.whosTurn() //Player's turn number is the same as player's color id on the board
            return
        }
        c -= 7   //If didn't find empty spot, go up
    }
}

//Checks for draws by checking if every single position on the top row was filled by some player

game.prototype.checkForDraw = function() {
    for (pos = 0; pos < 7; pos++) {
        if (this.board[pos] == -1) return false;
    }
    return true
}

//Tests if there are 4 places available and if all of them are filled with same color
game.prototype.checkForWins = function() {
    for (pos = 0; pos < 42; pos++) {

        //Checks for horizontal win
        //Validates if there are 4 empty spaces 
        if (pos % 7 < 4) {
            if(this.checkEquals(pos, 1)) { //checkEquals() tests if 4 colors in a row spaced by a given interval are same
                return true
            }
        }
        //All other test is vertical and must be at least at height 4, so 21 circles underneath
        if (pos + 21 < 42) {  
            //Vertical test
            if(this.checkEquals(pos, 7)) {  // 4 circles, each 7 apart (so right under)
                return true
            }
            //Diagonal-right test
            if (pos % 7 < 4) {  //at least 4 away from the right wall
                if(this.checkEquals(pos, 8)) { //7 for next row + 1 for diagonalization
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

//Checks if there are 4 colors placed in the same direction
game.prototype.checkEquals = function(pos, diff)  {
    return (this.board[pos] != -1 && this.board[pos] == this.board[pos+diff] 
        && this.board[pos+2*diff] == this.board[pos+3*diff]
        && this.board[pos+diff*2] == this.board[pos+diff])
}

//Checks if a clicked column has at least one empty space
//Returns true iff found empty spot
//Params: idx index that was clicked
game.prototype.validateColumn = function(idx) {
    idx %= 7 //Find the topmost column position from the top
    while (idx < 42) { 
        if (this.board[idx] == -1) return true  //Found empty spot, return true
        idx += 7  //Otherwise go to next row
    }
    return false //No empty spots

}


//Adds player
//returns 0 if added player is orange, 1 green and -1 if error (both players locked)
game.prototype.addPlayer = function(p) {
    if (this.orangePlayer == null) {
        this.orangePlayer = p
        return 0
    }
    if (this.greenPlayer == null) {
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

//Changes current player turn to the other guy (or guyette)
game.prototype.switchPlayer = function() {
    this.turn = (this.turn + 1) % 2;
}

//Returns 1 iff both players ready
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