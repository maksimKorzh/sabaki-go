const influence = require('@sabaki/influence');

var data = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1,-1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0,-1,-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,-1, 0, 0, 0],
  [0, 0, 1,-1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,-1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function count(board) {
  let blackScore = 0;
  let whiteScore = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col] > 0) blackScore += 1;
      if (board[row][col] < 0) whiteScore += 1;
    }
  }
  return blackScore - whiteScore;
}

function generateMove(side) {
  let bestScore = side == 1 ? -9999: 9999;
  let bestMove = [0, 0];
  
  for (let row = 0; row < data.length; row++) {
    if (row < 2 || row > 16) continue;
    for (let col = 0; col < data[0].length; col++) {
      if (col < 2 || col > 16) continue;
      if (data[row][col] == 0) {
        // make move
        data[row][col] = side;
        var result = influence.map(data, {discrete: true});
        let c = count(result);
        
        if (side == 1) {
          if (c > bestScore) {
            bestScore = c;
            bestMove = [row, col];
          }
        }
        
        if (side == -1) {
          if (c < bestScore) {
            bestScore = c;
            bestMove = [row, col];
          }
        }

        // take back
        data[row][col] = 0;        
      }
    }
  }
  
  return bestMove;
}

let side = 1;
let bestMove = generateMove(side);

let row = bestMove[0];
let col = bestMove[1];

// make move on board
data[row][col] = side;

console.log(data);
console.log('Best move:', bestMove[0] + 1, bestMove[1] + 1);













