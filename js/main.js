'use strict';
// ----------------------------------------- GAME SYMBOLS ----------------------------------------- //

const EMPTY = ' ';
const FLAG = '🚩';
const MINE = '💥';

// ---------------------------------------- PLAYER SYMBOLS ---------------------------------------- //

const PLAYER = '😃'
const WINNER = '😎'
const LOSER = '🤯'
// ❤️ , 💔 , 💖 , 💡, 💣,

// --------------------------------------- GLOBAL VARIABLES --------------------------------------- //

const LEFT_CLICK = 1;
const RIGHT_CLICK = 3;

var gBoard;
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

var gInterval;

var cell = {
	minesAroundCount: 4,
	isShown: true,
	isMine: false,
	isMarked: true,
};

// ------------------------------------------------------------------------------------------------ //

function initGame() {
	console.log(`***INITIALIZE GAME***`);
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
	console.log(board.length);
	console.log(board);
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board.length; j++) {
			if (!board[i][j].isMine) {
				for (var row = -1; row < 2; row++) {
					for (var col = -1; col < 2; col++) {
						if (
							i + row > 0 &&
							i + row < board.length &&
							j + col > 0 &&
							j + col < board.length
							) {
							if (board[i + row][j + col].isMine)
								board[i][j].minesAroundCount++;
						}
					}
				}
			}
		}
	}
}

function setRandomMines(board) {
	 var gRandomMines =[];
	for (var i = 0; i < gLevel.MINES; i++) {
		var rndLocation = getRandomLocation();
		while (gRandomMines.includes(rndLocation)) rndLocation = getRandomLocation();
		gRandomMines.push(rndLocation);
		board[rndLocation.i][rndLocation.j] = {
			minesAroundCount: -1,
			isShown: false,
			isMine: true,
			isMarked: false,
		};
        console.log(`mine in: ${rndLocation.i},${rndLocation.j}`); //!!!!///
	}
}

function cellClicked(event, elCell, i, j) {
    if (!gGame.isOn){
        gGame.isOn = true;
        startTimer();
    }

	var cell = gBoard[i][j];
	if (!cell.isMarked && !cell.isShown) {
		var value = null;
		switch (event.which) {
			case LEFT_CLICK:
				console.log(`left clicked!`);
				if (cell.isMine) {
					renderCell({ i: i, j: j }, MINE);
					playSound('/sound/mine-click.wav');
					return gameOver();
				}
				playSound('/sound/cell-click.wav');
				cell.isShown = true;
                gGame.shownCount++;
				break;

			case RIGHT_CLICK:
				console.log(`right clicked!`);
				value = FLAG;
				playSound('/sound/flag-click.wav');
				cell.isMarked = true;
                gGame.markedCount++;
				break;

			default:
				return;
		}
        if  ((gGame.shownCount + gGame.markedCount) === gLevel.SIZE ** 2) gameOver();
		renderCell({ i: i, j: j }, value);
	}
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

function showInstructions() {
	alert(
		`The goal of the game is to uncover all the squares that do not contain mines without being "blown up" by clicking on a square with a mine underneath.`
	);
}
