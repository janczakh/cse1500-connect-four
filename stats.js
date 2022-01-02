const stats = {
    since: Date.now(),  //Time elapsed since server began operating
    gamesInitialized: 0,  //Initialized games
    gamesStarted: 0,    //How many games have been started
    gamesAborted: 0,    //Aborted games
    gamesCompleted: 0,  //Completed games
    piecesPlaced: 0     //Circles placed

}

module.exports = stats