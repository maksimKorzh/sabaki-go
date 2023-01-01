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
  let bestMove = [-1, -1];
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      let stone = board.get([col, row]);
      if (stone != side) {
        let liberties = board.getLiberties([col, row]);
        if (liberties.length == 1) return liberties[0];
      }
    }
  }
}

// generate save move
function save(side) {
  let bestMove = [-1, -1];
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
  }
}

// defend group of stones
function defend(side) {
  let bestMove = [-1, -1];
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      let stone = board.get([col, row]);
      if (stone == side) {
        let liberties = board.getLiberties([col, row]);
        if (liberties.length == 2) return evaluateLiberties(side, liberties, 0);
      }
    }
  } return bestMove;
}

// surround group of stones
function attack(side) {
  let bestMove = [-1, -1];
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      let stone = board.get([col, row]);
      if (side == 1 ? (stone == -1) : (stone == 1)) {
        let liberties = board.getLiberties([col, row]);
        if (liberties.length > 1) {
          let move = evaluateLiberties(side, liberties, 1);
          let takeBack = board.clone();
          let isLegal = true;
          
          // legality check
          board = board.makeMove(side, move);
          if (board.get(move) == 0) isLegal = false;
          board = takeBack;
          if (isLegal == false) continue;
          return move;
        }
      }
    }
  } return bestMove;
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
  }
  //console.error('Heatmap:\n', heatmap);
  return bestMove;
}

// find the best move and make it on board
function generateMove(command) {
  
  /**********************************************************************\
   
                                 AI STRATEGY
   
    1. If opponent's group have only one liberty left
       then capture it
   
    2. If the group of the side to move has only one liberty
       then save it by putting a stone there unless it's a board edge
   
    3. If the group of the side to move has two liberties
       then choose the the one resulting in more liberties
   
    4. If opponent's group have more than one liberty
       then try to surround it
   
    5. Match patterns to build strong shape, if found any
       consider that instead of chasing the group
   
  \**********************************************************************/
  
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

  // tenuki move
  //let tenukiMove = tenuki(side);
  
  if (attackMove[0] >= 0) bestMove = attackMove;
  //else bestMove = tenukiMove;

  //console.error('Save move:', saveMove);
  //console.error('Defend move:', defendMove);
  //console.error('Surround move:', attackMove);
  //console.error('Tenuki move:', tenukiMove);
  console.error('Best move:', bestMove);

  board = board.makeMove(side, bestMove);
  //console.error(board);
  return board.stringifyVertex(bestMove);
}

// play move on board
function play(command) {
  //if (command.split(' ')[2] == 'pass') { console.error('play: "pass" > returning...'); return; }
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













