"use strict";

const Player = require('./player');

class Game {
  /**
   * Initialies a Game with no of grids, no of grids to win
   * @param n No of grids in a given row
   * @param k no of consecutive grids to win
     */
	constructor(n=3, k=3) {
    if(k>n) throw new Error("k cannot be greater than n");
    this.n = n;
    this.k = k;

    this.players = {};
    this.grid = new Array(n*n); // n*n grid
    for(let i=0; i < n*n; i++) {
      this.grid[i] = -1;
    }
	}

  /**
   *
   * @param name Player to be initiated
   * @param position can be 1 or 2
     */
  addPlayer(name, position) {
    if([0,1].indexOf(position) === -1) throw new Error("Can only add two players");
    if (!this.players[position]){
      const player = new Player(name  );
      this.players[position] = player;
      return player;
    } else {
      throw new Error('player already initialized');
    }
  }

  /**
   *
   * @param gridPos to be marked for the player
   * @param playerCount player who captured this grid
   * @returns false or true whether the grid is marked
     */
  markGrid(gridPos, playerCount) {
    if(['o', 'x'].indexOf(this.grid[gridPos])!==-1) {
      return false;
    } else {
      this.grid[gridPos] = playerCount;
      return true;
    }
  }

  /**
   * @returns Grid in a 2 dimensional array
   */
  returnGrid() {
    return this.grid.reduce((a, b, c) => {
      if(c % this.n === 0  && c > 0){
        a.push([]);
      }
      a[a.length - 1].push(b);
      return a;
    }, [[]]);
  }

  /**
   * reduces the 2 dimensional grid and prints a string
   */
  printGrid() {
    const grids = this.returnGrid();
    var self = this;
    let spaces = [];
    for(let i=0; i < this.n; i++) {
      spaces.push("---");
    }
    spaces = spaces.join("-");
    console.log(
      grids
        .map((g, i) => g.map((s, j) =>  {
          let p = Game.placeHolder(s);
          p = p  || (self.n*i + j);
          return ` ${p} `;
        })
        .join("|"))
        .join(`\n${spaces}\n`)
    );
  }

  static placeHolder(playerCount, gridCount) {
    if(playerCount===0) {
      return 'x';
    } else if(playerCount===1) {
      return 'o';
    } else {
      return null;
    }
  }
  /**
   *
   * @returns playerIndex or -1
     */
  winner() {

    const hasConsecutive = (i, j) => {
      let a = true, b = true, c= true;
      for(let p=0; p < this.k;p++) {
        // Check horizontal
        if(this.grid[this.n*j + i] !== this.grid[this.n*j + i + p]) {
          a = false;
        }
        // Check vertical
        if(this.grid[this.n*j + i] !== this.grid[this.n*(j+p) + i]) {
          b = false;
        }
        // Check diagonal
        if(this.grid[this.n*j + i] !== this.grid[this.n*(j+p) + (i+p)]) {
          c = false;
        }
      }
      return a || b || c;
    };

    for(let i =0; i <=(this.n-this.k);i++) {
      for(let j =0; j <=(this.n-this.k);j++) {
        if(hasConsecutive(i,j)) {
          return this.grid[this.n*j + i];
        }
      }
    }
    return -1;
  }

  /**
   *
   * @param nextMoviePromise
   * @returns Promise
     */
  play(nextMoviePromise = (response, name, placeHolder) => Promise.resolve()) {

    const promiseLoop = (answer, iterations = 1) => {
      let playerCount = iterations % 2;
      let win = -1;
      if(iterations === this.n*this.n+1) {
        return Promise.reject("Cannot find a winner");
      }
      let error = null;
      let added = true;
      if(iterations > 1) {
        added = this.markGrid(
          parseInt(answer),
          playerCount
        );
        if(!added) {
          error = "Slot already taken";
        }
      }

      if(added) {
        iterations++;
        win = this.winner();
      }
      this.printGrid();
      playerCount = iterations % 2;
      return nextMoviePromise(
        {
          winner: win!==-1 ? this.players[win].name : null,
          error: error
        },
        this.players[playerCount].name,
        Game.placeHolder(playerCount)
      ).then((answer) => {
        if(win ===-1) {
          return promiseLoop(answer, iterations);
        } else {
          return Promise.resolve();
        }
      });
    };

    promiseLoop(null);
  }
}
module.exports = Game;
