'use strict';
// ----------------------------------------- GAME SYMBOLS ----------------------------------------- //

const EMPTY = ' ';
const FLAG = '🚩';
const MINE = '💥';

// ---------------------------------------- PLAYER SYMBOLS ---------------------------------------- //

// ❤️ , 💔 , 💖 , 💡, 💣,
const PLAYER = '😃';
const WINNER = '😎';
const LOSER = '🤯';

// --------------------------------------- GLOBAL VARIABLES --------------------------------------- //

const LEFT_CLICK_CODE = 1;
const RIGHT_CLICK_CODE = 3;

var gBoard;
var gMineLocations;
var gInterval;
var gLevel = {
	SIZE: 4,
	MINES: 2,
};
var gGame = {
	isOn: false,
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0,
};

// ------------------------------------------------------------------------------------------------ //

function initGame() {
	console.log(`*** INITIALIZE GAME ***`);
	gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
	gBoard = buildBoard();
	renderBoard(gBoard);
}

function buildBoard() {
	var board = createSquareMat(gLevel.SIZE);
	setRandomMines(board);
	setMinesNegsCount(board);
	return board;
}

function setMinesNegsCount(board) {
	for (var i = 0; i < gMineLocations.length; i++) {
		increaseCountAroundMine(board, gMineLocations[i]);
	}
}

function increaseCountAroundMine(board, mineLocation) {
	for (var diffRow = -1; diffRow < 2; diffRow++) {
		for (var diffCol = -1; diffCol < 2; diffCol++) {
			var currNegRow = mineLocation.i + diffRow;
			var currNegCol = mineLocation.j + diffCol;
			if (
				isLocationInRange(currNegRow, currNegCol) &&
				!board[currNegRow][currNegCol].isMine
			) {
				board[currNegRow][currNegCol].minesAroundCount++;
			}
		}
	}
}

function setRandomMines(board) {
	gMineLocations = [];
	for (var i = 0; i < gLevel.MINES; i++) {
		var mineLocation = getMineLocation(board);
		board[mineLocation.i][mineLocation.j] = {
			minesAroundCount: -1,
			isShown: false,
			isMine: true,
			isMarked: false,
		};

		gMineLocations.push({ i: mineLocation.i, j: mineLocation.j });
		//console.log({ i: mineLocation.i, j: mineLocation.j });
	}
}

function getMineLocation(board) {
	// Get random mines-free location
	var rndLocation = getRandomLocation();
	while (board[rndLocation.i][rndLocation.j].isMine) {
		rndLocation = getRandomLocation();
	}
	return rndLocation;
}

// ------------------------------------------------------------------------------------------------ //

function cellClicked(event, elCell, i, j) {
	if (!gGame.isOn) {
		gGame.isOn = true;
		startTimer();
	}

	var cell = gBoard[i][j];
	if (!cell.isMarked && !cell.isShown) {
		switch (event.which) {
			case LEFT_CLICK_CODE:
				if (cell.isMine) {
					renderCell({ i: i, j: j }, MINE);
					playSound('/sound/mine-click.wav');
					document.querySelector('.user').innerText = LOSER;
					return gameOver();
				} else {
					expandShown(gBoard, elCell, i, j);
					playSound('/sound/cell-click.wav');
				}
				break;

			case RIGHT_CLICK_CODE:
				playSound('/sound/flag-click.wav');
				cell.isMarked = true;
				gGame.markedCount++;
				renderCell({ i: i, j: j }, FLAG);
				break;

			default:
				return;
		}
		if (isVictory()) {
			document.querySelector('.user').innerText = WINNER;
			gameOver();
		}
	}
}

function expandShown(board, elCell, i, j) {
	var currCell = board[i][j];
	if (currCell.minesAroundCount === 0) {
		for (var diffRow = -1; diffRow < 2; diffRow++) {
			for (var diffCol = -1; diffCol < 2; diffCol++) {
				var currNegRow = i + diffRow;
				var currNegCol = j + diffCol;
				if (isLocationInRange(currNegRow, currNegCol)) {
					var negCell = board[currNegRow][currNegCol];
					if (!negCell.isShown) {
						elCell.classList.add('clicked');
						negCell.isShown = true;
						gGame.shownCount++;
						elCell = getCellSelector(currNegRow,currNegCol);
						expandShown(board, elCell, currNegRow, currNegCol);
					}
				}
			}
		}
	} else {
		if (currCell && !currCell.isShown) {
			currCell.isShown = true;
			gGame.shownCount++;
			elCell.classList.add('clicked');
		}
	}
	elCell.classList.add('clicked');
	renderCell({ i: i, j: j });
	return;
}

// ------------------------------------------------------------------------------------------------ //

function isVictory(){
	return gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2;
}

function gameOver() {
	console.log(`***GAME OVER***`);
	clearTimer();
}

// ------------------------------------------------------------------------------------------------ //

function isLocationInRange(row, col) {
	return row >= 0 && row < gLevel.SIZE && col >= 0 && col < gLevel.SIZE;
}

function changeLevel(elBtnLvl) {
	if (!elBtnLvl.classList.contains('marked')) {
		var elLevels = document.querySelectorAll('.btn-level');
		for (var i = 0; i < elLevels.length; i++)
			elLevels[i].classList.remove('marked');

		switch (elBtnLvl.innerText) {
			case 'Beginner':
				gLevel = { SIZE: 4, MINES: 2 };
				break;
			case 'Medium':
				gLevel = { SIZE: 8, MINES: 12 };
				break;
			case 'Expert':
				gLevel = { SIZE: 12, MINES: 30 };
				break;
			default:
				break;
		}
		elBtnLvl.classList.add('marked');
		initGame();
	}
}
