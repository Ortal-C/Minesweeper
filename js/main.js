'use strict';
// ----------------------------------------- GAME SYMBOLS ----------------------------------------- //

const EMPTY = ' ';
const FLAG = '🚩';
const MINE = '💥';
const LIVE = '❤️';
const DEAD = '🤍';
const SAVER_SOUL = '😇';
const HINT = '💡';
const SAFE_MOVE = '✅';

// ---------------------------------------- PLAYER SYMBOLS ---------------------------------------- //

const PLAYER = '😃';
const WINNER = '🏆';
const LOSER = '🤯';

// --------------------------------------- GLOBAL VARIABLES --------------------------------------- //

const LEFT_CLICK_CODE = 1;
const RIGHT_CLICK_CODE = 3;
const HELP_DISPLAY_TIME = 1000;
var CELL_SIZE = 30; /* NOTE: size in pixels */

var gBoard;
var gTimerInterval;
var gMinesLocations;
var gLevel = null;
var gLives;
var gHints;
var gSafeMoves;
var gGame = {
	isOn: false,
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0,
	score: 0,
};
//var gScores =[];

// ---------------------------------------- INITIALS STEPS ---------------------------------------- //

function initGame() {
	if (!gLevel) changeLevel();
	gGame = {
		isOn: false,
		shownCount: 0,
		markedCount: 0,
		secsPassed: 0,
		score: 0,
	};
	initHelpFeatures();
	gBoard = buildBoard();
	renderBoard(gBoard);
	resetTimer();
	console.log(`*** GAME INITIALIZED WITH BOARD SIZE = ${gLevel.SIZE} ***`);
}

function initHelpFeatures() {
	gLives = [LIVE, LIVE, LIVE];
	gHints = [HINT, HINT, HINT];
	gSafeMoves = [SAFE_MOVE, SAFE_MOVE, SAFE_MOVE];
}

function buildBoard() {
	var board = createSquareMat(gLevel.SIZE);
	setRandomMines(board);
	setMinesNegsCount(board);
	return board;
}

function setMinesNegsCount(board) {
	for (var i = 0; i < gMinesLocations.length; i++) {
		increaseCountAroundMine(board, gMinesLocations[i]);
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
	gMinesLocations = [];
	for (var i = 0; i < gLevel.MINES; i++) {
		var mineLocation = getMineLocation(board);
		board[mineLocation.i][mineLocation.j] = {
			minesAroundCount: -1,
			isShown: false,
			isMine: true,
			isMarked: false,
		};

		gMinesLocations.push({ i: mineLocation.i, j: mineLocation.j });
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

// ---------------------------------------- CLICK HANDLERS ---------------------------------------- //

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
	if (!isVictory()) {
		if (isFullBoard())
			confirm(`REMEMBER: You have ${gLevel.MINES} mines to dicover`);
	} else return gameOver(true);
}

function leftClickHandle(cell, elCell, i, j) {
	`User made a left-click on cell: (${i},${j})`;
	if (!gGame.isOn) {
		if (gGame.secsPassed === 0) handleFirstClick(elCell, i, j);
	} else {
		if (cell.isShown) return;
		else if (cell.isMine) {
			if (gLives.length > 0) {
				saverSoulForRescue(i, j);
			} else {
				renderCell({ i: i, j: j });
				gameOver(false);
			}
			return;
		} else if (cell.isMarked) {
			if (getCellContent({ i: i, j: j }) !== SAVER_SOUL) {
				cell.isMarked = false;
				gGame.markedCount--;
				cell.isShown = true;
				gGame.shownCount++;
			}
		}
		expandShown(i, j);
		playSound('/sound/cell-click.wav');
	}
	return;
}

function rightClickHandle(cell, i, j) {
	`User made a right-click on cell: (${i},${j})`;
	if (!gGame.isOn) {
		if (gGame.secsPassed === 0) {
			gGame.isOn = true;
			startTimer();
		}
		return;
	}
	if (gBoard[i][j].isShown) {
		gGame.shownCount--;
		cell.isShown = false;
		gGame.score -= 10;
	}
	cell.isMarked = true;
	gGame.markedCount++;
	playSound('/sound/flag-click.wav');
	renderCell({ i: i, j: j }, FLAG);
}

function expandShown(i, j, toShow = true) {
	var currCell = gBoard[i][j];
	if (currCell.minesAroundCount === 0) {
		for (var diffRow = -1; diffRow < 2; diffRow++) {
			for (var diffCol = -1; diffCol < 2; diffCol++) {
				if (diffRow === 0 && diffCol === 0) continue;
				var currNegRow = i + diffRow;
				var currNegCol = j + diffCol;
				if (isLocationInRange(currNegRow, currNegCol)) {
					var negCell = gBoard[currNegRow][currNegCol];
					if (negCell.isShown !== toShow) {
						negCell.isShown = toShow;
						gGame.shownCount += toShow ? 1 : -1;
						gGame.score += toShow ? 10 : -10;
						//elCell = getCellSelector({ i: currNegRow, j: currNegCol });
						expandShown(currNegRow, currNegCol, toShow);
					}
				}
			}
		}
	}

	if (currCell.isShown !== toShow) {
		gGame.shownCount += toShow ? 1 : -1;
		gGame.score += toShow ? 10 : -10;
		currCell.isShown = currCell.isMarked = toShow;
		
	}
	renderCell({ i: i, j: j }, toShow ? currCell.minesAroundCount : EMPTY);
	return;
}

function handleFirstClick(elCell, i, j) {
	if (gGame.secsPassed === 0) {
		if (gBoard[i][j].isMine) {
			nonMineStartCell(i, j);
		}
		gGame.isOn = true;
		startTimer();
		expandShown(i, j);
		playSound('sound/cell-click.wav');
	}
}

function nonMineStartCell(i, j) {
	while (gBoard[i][j].isMine) {
		gBoard = buildBoard();
	}
	renderBoard();
}

function saverSoulForRescue(i, j) {
	if (!(gBoard[i][j].isMarked && gBoard[i][j].isMine)) {
		// if not rescued yet
		gBoard[i][j].isMarked = true;
		gGame.markedCount++;
	}
	renderCell({ i: i, j: j }, SAVER_SOUL);
	gLives.pop();
	renderLives();
}

// -------------------------------------- GAME OVER FUNCTIONS ------------------------------------- //

function isVictory() {
	return isFullBoard() && gGame.markedCount === gLevel.MINES;
}

function gameOver(isWin = false) {
	renderGameOverMsg(isWin);
	var url = isWin ? '/sound/win-game.mp3' : '/sound/mine-click.wav';
	playSound(url);
	gLives = gHints = [];
	clearTimer();
	gGame.isOn = false;
	console.log(`*** GAME OVER ***`);
	//scoreStorage();
}

// -------------------------------------- USER HELP FEATURES -------------------------------------- //

function useHint() {
	if (gHints.length > 0) {
		var rndLocation = getRandomLocation();
		var currCell = gBoard[rndLocation.i][rndLocation.j];
		while (!isFullBoard() && (currCell.isShown || currCell.isMarked)) {
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
	expandShown(row, col);
	setTimeout(() => {
		expandShown(row, col, false);
	}, HELP_DISPLAY_TIME);
}

function useSafeMove() {
	if (gSafeMoves.length > 0) {
		var rndLocation = getRandomLocation();
		var currCell = gBoard[rndLocation.i][rndLocation.j];
		while (!isFullBoard() && currCell.isMine) {
			rndLocation = getRandomLocation();
			currCell = gBoard[rndLocation.i][rndLocation.j];
			if (!currCell.isShown || !currCell.isMarked) break;
		}

		revealSafeMove(currCell, rndLocation);
		gSafeMoves.pop();
		renderSafeMoves();
	}
}

function revealSafeMove(currCell, location) {
	var prevContent = currCell.isShown ? getCellContent(rndLocation) : EMPTY;
	var prevIsShown = currCell.isShown;
	var prevIsMarked = currCell.isMarked;
	//Reavel content
	currCell.isShown = true;
	renderCell(location);
	//Unreavel
	setTimeout(() => {
		currCell.isShown = prevIsShown;
		currCell.isMarked = prevIsMarked;
		renderCell(location, prevContent);
	}, HELP_DISPLAY_TIME);
}

// --------------------------------------------- OTHERS ------------------------------------------- //

function isLocationInRange(row, col) {
	return row >= 0 && row < gLevel.SIZE && col >= 0 && col < gLevel.SIZE;
}

function isFullBoard() {
	return gGame.markedCount + gGame.shownCount === gLevel.SIZE ** 2;
}

function changeLevel(elBtnLvl = null) {
	if (elBtnLvl) {
		if (!elBtnLvl.classList.contains('marked')) {
			var elLevels = document.querySelectorAll('.btn-level');
			for (var i = 0; i < elLevels.length; i++)
				elLevels[i].classList.remove('marked');

			switch (elBtnLvl.innerText) {
				case 'Beginner':
					gLevel = { SIZE: 4, MINES: 2 };
					CELL_SIZE = 60;
					break;
				case 'Medium':
					gLevel = { SIZE: 8, MINES: 12 };
					CELL_SIZE = 30;
					break;
				case 'Expert':
					gLevel = { SIZE: 12, MINES: 30 };
					CELL_SIZE = 30;
					break;
				default:
					break;
			}
			elBtnLvl.classList.add('marked');
			initGame();
		}
	} else {
		document.querySelector('.Beginner').classList.add('marked');
		gLevel = { SIZE: 4, MINES: 2 };
		CELL_SIZE = 60;
	}
}

// function scoreStorage() {
// 	debugger
// 	var gameData = {
// 		Score: `${gGame.score}`,
// 		Time: `${gGame.secsPassed} seconds`,
// 		Level: `${gLevel.SIZE} X ${gLevel.SIZE} `,
// 	};
// 	gScores.push(gameData);
// 	if (localStorage){ 
// 		localStorage.removeItem('scores')
// 		localStorage.setItem({'scores': gScores});
// 	}
// }

// function showScores() {
	
// }
