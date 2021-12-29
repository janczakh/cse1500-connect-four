const stats = {
    since: Date.now(),  //Time elapsed since server began operating
    gamesStarted: 0,    //How many games have been initialized
    gamesAborted: 0,    //Aborted games
    gamesCompleted: 0,  //Completed games
    piecesPlaced: 0     //Circles placed

}

module.exports = stats