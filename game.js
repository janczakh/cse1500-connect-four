const ws = require("ws")

const game = function(ID) {
    this.orangePlayer = null;
    this.greenPlayer = null;
    this.id = ID;
    this.status = 0 //1 is orange won, 2 is green won, 3 is draw, -1 is aborted
}