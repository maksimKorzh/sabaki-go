// libraries
const Board = require('@sabaki/go-board')
const influence = require('@sabaki/influence');

// game data
var board = initBoard();
let side = 1;

// clear/create new board
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

// estimate score
function estimateTerritory(heatmap) {
  let blackScore = 0;
  let whiteScore = 0;
  for (let row = 0; row < heatmap.length; row++) {
    for (let col = 0; col < heatmap[0].length; col++) {
      if (heatmap[row][col] > 0) blackScore += 1;
      if (heatmap[row][col] < 0) whiteScore += 1;
    }
  } return blackScore - whiteScore;
}

// evaluate liberties
function evaluateLiberties(side, liberties, surround) {
  let bestCount = 0;
  let bestLiberty = (surround == 1 ? liberties[0] : [-1, -1]);
  for (let i = 0; i < liberties.length; i++) {
    // store current board state
    let takeBack = board.clone();
    
    // test move
    board = board.makeMove(side, liberties[i]);
    let count = board.getLiberties(liberties[i]).length;
    board = takeBack;
    
    if (count > bestCount) {
      if (liberties[i][0] == 0 || 
          liberties[i][0] == board.width-1 ||
          liberties[i][1] == 0 ||
          liberties[i][1] == board.height-1)
        if (surround == 0) continue;

      bestLiberty = liberties[i];
      bestCount = count;
    }
  } return bestLiberty;
}

// generate capture move
function capture(side) {
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      let stone = board.get([col, row]);
      if (stone != side) {
        let liberties = board.getLiberties([col, row]);
        if (liberties.length == 1) return liberties[0];
      }
    }
  } return [-1, -1];
}

// generate save move
function save(side) {
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      let stone = board.get([col, row]);
      if (stone == side) {
        let liberties = board.getLiberties([col, row]);
        if (liberties[0][0] == 0 || 
            liberties[0][0] == board.width-1 ||
            liberties[0][1] == 0 ||
            liberties[0][1] == board.height-1) continue;
        if (liberties.length == 1) return liberties[0];
      }
    }
  } return [-1, -1];
}

// defend group of stones
function defend(side) {
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      let stone = board.get([col, row]);
      if (stone == side) {
        let liberties = board.getLiberties([col, row]);
        if (liberties.length == 3 || liberties.length == 2)
          return evaluateLiberties(side, liberties, 0);
      }
    }
  } return [-1, -1];
}

// surround group of stones
function attack(side) {
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      let stone = board.get([col, row]);
      if (side == 1 ? (stone == -1) : (stone == 1)) {
        let liberties = board.getLiberties([col, row]);
        if (liberties.length == 2) {
          let move = evaluateLiberties(side, liberties, 1);
          let takeBack = board.clone();

          // legality check
          let isLegal = true;
          board = board.makeMove(side, move);
          if (board.get(move) == 0) isLegal = false;
          board = takeBack;
          if (isLegal == false) continue;
          return move;
        }
      }
    }
  } return [-1, -1];
}

// generate tenuki move
function tenuki(side) {
  let heatmap = [];
  let bestScore = side == 1 ? -9999: 9999;
  let bestMove = [-1, -1];
  for (let row = 0; row < board.height; row++) {
    if (row < 2 || row > 16) continue;
    for (let col = 0; col < board.width; col++) {
      if (col < 2 || col > 16) continue;
      if (board.get([col, row]) == 0) {
        // store current board state
        let takeBack = board.clone();
        
        // test move
        board = board.makeMove(side, [col, row]);
        heatmap = influence.map(board.signMap, {discrete: true});
        let score = estimateTerritory(heatmap);
        board = takeBack;
        
        if (side == 1 ? (score > bestScore) : (score < bestScore)) {
          bestScore = score;
          bestMove = [col, row];
        }
      }
    }
  } return bestMove;
}

// find the best move and make it on board
function generateMove(command) { 
  let side = command.split(' ')[1] == 'B' ? 1 : -1;
  let bestMove = [-1, -1];

  // capture move
  let captureMove = capture(side);

  // save move
  let saveMove = save(side);
  
  // deffend group move
  let defendMove = defend(side);

  // surround group of stones
  let attackMove = attack(side);

  /******************************************\
   ==========================================
   
                  AI STRATEGY
  
   ==========================================
  \******************************************/
  
  // 1. If no forcing moves then tenuki
  if (captureMove[0] == -1 &&
      saveMove[0] == -1 &&
      defendMove[0] == -1 &&
      attackMove[0] == -1) {
    let tenukiMove = tenuki(side);
    bestMove = tenuki(side);
    console.error('Tenuki move:', tenukiMove);
  }
  
  // 2. If there's a group to capture then capture it
  else if (captureMove[0] >= 0) bestMove = captureMove;
  
  // 3. If there's a group to save then save it
  else if (saveMove[0] >= 0) bestMove = saveMove;
  
  // 4. If there's a group to surround then surround it
  else if (attackMove[0] >= 0) bestMove = attackMove;
  
  // 5. If there's a group to defend then defend it
  else if (defendMove[0] >= 0) bestMove = defendMove;
  
  

  // legality check
  let isLegal = true;
  let takeBack = board.clone();
  board = board.makeMove(side, bestMove);
  if (board.get(bestMove) == 0) isLegal = false;
  
  if (isLegal == false) {
    console.error('Skipping illegal move')
    board = takeBack;
    return ''; // pass
  }

  console.error('Save move:', saveMove);
  console.error('Defend move:', defendMove);
  console.error('Surround move:', attackMove);
  console.error('Best move:', bestMove);  
  return board.stringifyVertex(bestMove);
}

// play move on board
function play(command) {
  let side = command.split(' ')[1];
  let color = side == 'B' ? 1 : -1;
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













