'use strict';
// ----------------------------------------- GAME SYMBOLS ----------------------------------------- //

const EMPTY = ' ';
const FLAG = '🚩';
const MINE = '💥';

// ---------------------------------------- PLAYER SYMBOLS ---------------------------------------- //

const PLAYER = '😃';
const WINNER = '😎';
const LOSER = '🤯';
// ❤️ , 💔 , 💖 , 💡, 💣,

// --------------------------------------- GLOBAL VARIABLES --------------------------------------- //

const LEFT_CLICK_CODE = 1;
const RIGHT_CLICK_CODE = 3;

var gBoard;
var gLevel = {
	SIZE: 4,
	MINES: 2,
};
var gMineLocations = [];
var gGame = {
	isOn: false,
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0,
};

var gInterval;

var cell = {
	minesAroundCount: 4,
	isShown: true,
	isMine: false,
	isMarked: true,
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
		var currMineRow = gMineLocations[i].i;
		var currMineCol = gMineLocations[i].j;
		for (var diffRow = -1; diffRow < 2; diffRow++) {
			for (var diffCol = -1; diffCol < 2; diffCol++) {
				if (
					currMineRow + diffRow >= 0 &&
					currMineRow + diffRow < board.length &&
					currMineCol + diffCol >= 0 &&
					currMineCol + diffCol < board.length &&
					!board[currMineRow + diffRow][currMineCol + diffCol].isMine
				) {
					board[currMineRow + diffRow][currMineCol + diffCol]
						.minesAroundCount++;
				}
			}
		}
	}
}

function setRandomMines(board) {
	gMineLocations = [];
	for (var i = 0; i < gLevel.MINES; i++) {
		var rndLocation = getRandomLocation();
		while (board[rndLocation.i][rndLocation.j].isMine)
			rndLocation = getRandomLocation();
		board[rndLocation.i][rndLocation.j] = {
			minesAroundCount: -1,
			isShown: false,
			isMine: true,
			isMarked: false,
		};
		gMineLocations.push({ i: rndLocation.i, j: rndLocation.j });
		console.log({ i: rndLocation.i, j: rndLocation.j });
	}
}

function cellClicked(event, elCell, i, j) {
	if (!gGame.isOn) {
		gGame.isOn = true;
		startTimer();
	}

	var cell = gBoard[i][j];
	if (!cell.isMarked && !cell.isShown) {
		var value = null;
		switch (event.which) {
			case LEFT_CLICK_CODE:
				console.log(`left click!`);
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
				console.log(`right click!`);
				playSound('/sound/flag-click.wav');
				value = FLAG;
				cell.isMarked = true;
				gGame.markedCount++;
				renderCell({ i: i, j: j }, value);
				console.log(gGame);

				break;

			default:
				return;
		}
		if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
			console.log('Checking if gameover:', gGame);
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
				var currCellRow = i + diffRow;
				var currCellCol = j + diffCol;
				if (
					currCellRow >= 0 &&
					currCellRow < board.length &&
					currCellCol >= 0 &&
					currCellCol < board.length
				) {
					var negCell = board[i + diffRow][j + diffCol];
					if (!negCell.isShown) {
						negCell.isShown = true;
						gGame.shownCount++;
						elCell = document.querySelector(
							`.cell-${i + diffRow}-${j + diffCol}`
						);
						expandShown(board, elCell, i + diffRow, j + diffCol);
					}
				}
			}
		}
	} else {
		if (!currCell.isShown) {
			currCell.isShown = true;
			gGame.shownCount++;
		}
	}
	renderCell({ i: i, j: j });
	return;
}

function gameOver() {
	console.log(`***GAME OVER***`);
	clearTimer();
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
