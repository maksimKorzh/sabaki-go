const Board = require('@sabaki/go-board')
const influence = require('@sabaki/influence');

var board = initBoard();
let side = 1;

function initBoard() {
  return new Board([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]);
}

function count(board) {
  let blackScore = 0;
  let whiteScore = 0;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col] > 0) blackScore += 1;
      if (board[row][col] < 0) whiteScore += 1;
    }
  } return blackScore - whiteScore;
}

function generateMove(command) {
  let side = command.split(' ')[1] == 'B' ? 1 : -1;
  let bestScore = side == 1 ? -9999: 9999;
  let bestMove = [0, 0];

  for (let row = 0; row < board.height; row++) {
    if (row < 2 || row > 16) continue;
    for (let col = 0; col < board.width; col++) {
      if (col < 2 || col > 16) continue;
      if (board.get([col, row]) == 0) {
        // make move
        let takeBack = board.clone();
        board = board.makeMove(side, [col, row]);
        var result = influence.map(board.signMap, {discrete: true});
        let c = count(result);
        
        if (side == 1) {
          if (c > bestScore) {
            bestScore = c;
            bestMove = [col, row];
          }
        }
        
        if (side == -1) {
          if (c < bestScore) {
            bestScore = c;
            bestMove = [col, row];
          }
        }

        // take back
        board = takeBack;
      }
    }
  }

  board = board.makeMove(side, bestMove);
  return board.stringifyVertex(bestMove);
}

function play(command) {
  // TODO: pass
  let color = command.split(' ')[1] == 'B' ? 1 : -1;
  let coord = board.parseVertex(command.split(' ')[2]);
  board = board.makeMove(color, coord);  
}

// create CLI interface
var readline = require('readline');
var gtp = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// gtp loop
gtp.on('line', function(command){
  if (command == 'quit') process.exit();
  else if (command.includes('name')) console.log('= Sabaki Go\n');
  else if (command.includes('protocol_version')) console.log('= 1\n');
  else if (command.includes('version')) console.log('= 1.0\n');
  else if (command.includes('list_commands')) console.log('= protocol_version\n');
  else if (command.includes('boardsize')) console.log('=\n'); // set up board size if supported
  else if (command.includes('clear_board')) { board = initBoard(); console.log('=\n');}
  else if (command.includes('showboard')) console.log('= ', board, '\n');
  else if (command.includes('play')) { play(command); console.log('=\n'); }
  else if (command.includes('genmove')) console.log('= ' + generateMove(command) + '\n');
  else console.log('=\n'); // skip unsupported commands
});













