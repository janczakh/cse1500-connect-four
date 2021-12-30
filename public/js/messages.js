(function (exports) {

    exports.S_UPDATE_BOARD = {  //Message from server to update the client's board
        type: "S_UPDATE_BOARD",
        newBoard: null
    };

    exports.S_INFORM_PLAYER_NUM = {
        type: "S_INFORM_PLAYER_NUM",
        data: null
    }

    exports.S_BEGIN_GAME = {
        type: "S_BEGIN_GAME"
    }

    exports.S_YOU_WON = {
        type: "S_YOU_WON"
    }

    exports.S_YOU_LOST = {
        type: "S_YOU_LOST"
    }

    exports.S_GAME_ABORTED = {
        type: "S_GAME_ABORTED"
    }

    exports.P_PUT_CIRCLE = {   //Message from player to insert a circle
        type: "P_PUT_CIRCLE",
        data: null
    }

})(typeof exports === "undefined" ? (this.Messages = {}) : exports)  //If exports is undefined we are on the client, otherwise server
//If client, we need to make the exports an array, otherwise Node handles everything in terms of exports