"use strict";

var readline = require('readline');
const Game = require('./game');
const Promise = require('bluebird');
const game = new Game();
const  rl = readline.createInterface(process.stdin, process.stdout);

const initPlayers = (playerCount=0) => {
  return questionPromise(`Enter name for Player ${playerCount+1} \n>>> `)
    .then((ans) => {
      game.addPlayer(ans, playerCount);
      if(playerCount<1) {
        return initPlayers(playerCount+1);
      } else {
        return Promise.resolve();
      }
    });
};
const questionPromise = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      if(ans && ans.trim()) {
        return resolve(ans.trim());
      } else {
        return questionPromise(question);
      }
    });
  });
};

const nextMoviePromise = (response, name, placeHolder) => {
  if(response.winner) {
    console.log(`Congratulations ${response.winner}! You have won.`);
    return process.exit();
  } else if(response.error){
    console.log(response.error);
  }
  return questionPromise(`${name}, choose a box to place an ${placeHolder} \n>>>`);
};

let initGame = () => {
  return initPlayers().then(() => {
    return game.play(nextMoviePromise);
  });
};

initGame();


