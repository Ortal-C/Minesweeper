'use strict';
// ----------------------------------------- GAME SYMBOLS ----------------------------------------- //

const EMPTY = ' ';
const FLAG = '🚩';
const MINE = '💥';
const LIVE = '❤️';
const DEAD = '🤍';
const SAVER_SOUL = '😇';
const HINT = '💡';

// ---------------------------------------- PLAYER SYMBOLS ---------------------------------------- //

const PLAYER = '😃';
const WINNER = '🏆';
const LOSER = '🤯';

// --------------------------------------- GLOBAL VARIABLES --------------------------------------- //

const LEFT_CLICK_CODE = 1;
const RIGHT_CLICK_CODE = 3;
const HINT_DISPLAY_TIME = 1000;

var gBoard;
var gMineLocations;
var gLives;
var gHints;
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
	gLives = [LIVE, LIVE, LIVE];
	gHints = [HINT, HINT, HINT];
	gBoard = buildBoard();
	renderBoard(gBoard);
	resetTimer();
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
	// Get mines-free random location
	var rndLocation = getRandomLocation();
	while (board[rndLocation.i][rndLocation.j].isMine) {
		rndLocation = getRandomLocation();
	}
	return rndLocation;
}

// ------------------------------------------------------------------------------------------------ //

function firstClickIsntMine(i, j) {
	while (gBoard[i][j].isMine) {
		gBoard = buildBoard();
	}
	renderBoard();
	return gBoard[i][j];
}

function handleFirstClick(i, j) {
	var cell = gBoard[i][j];
	if (gGame.secsPassed === 0) {
		if (cell.isMine) {
			cell = firstClickIsntMine(i, j);
		}
		gGame.isOn = true;
		startTimer();
		renderCell({ i: i, j: j });
	}
}

function leftClickHandle(cell, elCell, i, j) {
	if (!gGame.isOn) {
		if (gGame.secsPassed === 0) handleFirstClick(i,j);
		else return;
	}

	if (cell.isMine) {
		if (gLives.length > 0) {
			gGame.markedCount++;
			renderCell({ i: i, j: j }, SAVER_SOUL);
			gLives.pop();
			renderLives();
		} else {
			renderCell({ i: i, j: j }, MINE);
			return gameOver(false);
		}
	} else {
		expandShown(gBoard, elCell, i, j);
		playSound('/sound/cell-click.wav');
	}
}
function rightClickHandle(cell, i, j) {
	if (!gGame.isOn) {
		gGame.isOn = true;
		startTimer();
	}
	gGame.markedCount++;
	cell.isMarked = cell.isShown = true;
	playSound('/sound/flag-click.wav');
	renderCell({ i: i, j: j }, FLAG);
}

function cellClicked(event, elCell, i, j) {
	var cell = gBoard[i][j];
	switch (event.which) {
		case LEFT_CLICK_CODE:
			leftClickHandle(cell, elCell, i, j);
			break;
		case RIGHT_CLICK_CODE:
			rightClickHandle(cell, i, j);
			break;

		default:
			return;
	}
	if (isVictory()) return gameOver(true);
}

function expandShown(board, elCell, i, j, toShow = true) {
	var currCell = board[i][j];
	if (currCell.minesAroundCount === 0) {
		for (var diffRow = -1; diffRow < 2; diffRow++) {
			for (var diffCol = -1; diffCol < 2; diffCol++) {
				var currNegRow = i + diffRow;
				var currNegCol = j + diffCol;
				if (isLocationInRange(currNegRow, currNegCol)) {
					var negCell = board[currNegRow][currNegCol];
					if (negCell.isShown !== toShow) {
						negCell.isShown = toShow;
						elCell = getCellSelector(currNegRow, currNegCol);
						expandShown(board, elCell, currNegRow, currNegCol, toShow);
					}
				}
			}
		}
	}

	if (currCell.isShown !== toShow || currCell.isMarked !== toShow) {
		currCell.isShown = currCell.isMarked = toShow;
		gGame.shownCount += toShow ? 1 : -1;
		renderCell({ i: i, j: j }, toShow ? currCell.minesAroundCount : ' ');
		console.log(`i:${i} j:${j}`, gGame);
	}
	return;
}

// ------------------------------------------------------------------------------------------------ //

function isVictory() {
	return gGame.markedCount + gGame.shownCount === gLevel.SIZE ** 2 && gGame.markedCount === gLevel.MINES;
}

function gameOver(isWin = false) {
	console.log(`***GAME OVER***`);
	renderGameOverMsg(isWin);
	var url = isWin ? '/sound/win-game.mp3' : '/sound/mine-click.wav';
	playSound(url);
	gLives = gHints = [];
	clearTimer();
	gGame.isOn = false;
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

function useHint() {
	if (gHints.length > 0) {
		var rndLocation = getRandomLocation();
		var currCell = gBoard[rndLocation.i][rndLocation.j];
		while (currCell.isShown || currCell.isMarked) {
			rndLocation = getRandomLocation();
			currCell = gBoard[rndLocation.i][rndLocation.j];
		}
		revealHint(rndLocation.i, rndLocation.j);
		gHints.pop();
		renderHints();
	}
}

function revealHint(row, col) {
	var elCell = getCellSelector(row, col);
	expandShown(gBoard, elCell, row, col);
	setTimeout(() => {
		expandShown(gBoard, elCell, row, col, false);
	}, HINT_DISPLAY_TIME);
}
