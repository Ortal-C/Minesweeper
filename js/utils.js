'use strict';
// ----------------------------------------------- CREATE MATRIX ---------------------------------------------- //

function createSquareMat(size) {
	var mat = [];
	for (var i = 0; i < size; i++) {
		mat.push([]);
		for (var j = 0; j < size; j++) {
			mat[i][j] = {
				minesAroundCount: 0,
				isShown: false,
				isMine: false,
				isMarked: false,
			};
		}
	}
	return mat;
}

// ----------------------------------------------- MATRIX RENDER ---------------------------------------------- //
function renderBoard() {
	// creating board
	var strHTML = `<table align="center"><tbody>\n`;

	// information at top-row
	strHTML += `<tr class="info-top-row"></td>\n
	<td class="cell user" style="width:${
		(gBoard.length / 2) * CELL_SIZE
	}px; height:${CELL_SIZE}px; " onclick="initGame()">${PLAYER}</td>\n
	<td class="cell timer" style="width:${
		(gBoard.length / 2) * CELL_SIZE
	}px; height:${CELL_SIZE}px; cursor:Block">⏰ <span></span></td>
	\n</tr>`;

	// creating board cells
	for (var i = 0; i < gBoard.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < gBoard.length; j++) {
			var cell = gBoard[i][j];
			var className = `cell cell-${i}-${j}`;
			strHTML += `<td class="${className}" onmousedown="cellClicked(event, this, ${i}, ${j})" style="width:${CELL_SIZE}px; height: ${CELL_SIZE}px;">${
				cell.isShown ? cell.minesAroundCount : ''
			}</td>\n`;
		}
		strHTML += '</tr>\n';
	}

	// information at bottom-row
	strHTML += `<tr class="info-bottom-row">\n
	<td class="cell lives" style="width:${(gBoard.length / 3) * CELL_SIZE}px; height:${CELL_SIZE}px;"></td>\n
	<td class="cell hints" style="width:${(gBoard.length / 3) * CELL_SIZE}px; height:${CELL_SIZE}px;" onClick="useHint()"></td>\n
	<td class="cell safe" style="width:${(gBoard.length / 3) * CELL_SIZE}px; height:${CELL_SIZE}px;" onClick="useSafeMove()"></td>\n</tr>`;
	strHTML += '<tr class="game-over-row"></tr></tbody></table>';

	var elContainer = document.querySelector('.game-area');
	elContainer.innerHTML = strHTML;
	renderLives();
	renderHints();
	renderSafeMoves();
}

// ----------------------------------------------- CELLS RENDERS ---------------------------------------------- //

function getCellContent(location) {
	var elCell = getCellSelector(location);
	return elCell.innerHTML+'';
}

function renderCell(location, value = null) {
	if (!value) value = gBoard[location.i][location.j].minesAroundCount;
	if (value < 0) value = MINE;
	var elCell = getCellSelector(location);
	elCell.innerHTML = value;
}

function getCellSelector(location) {
	return document.querySelector(`.cell-${location.i}-${location.j}`);
}

function renderLives() {
	var strLives = gLives.join('');
	var currShownLives = gLives.length;
	while (gLives.length < 3 && currShownLives < 3) {
		strLives += DEAD;
		currShownLives++;
	}
	document.querySelector('.lives').innerText = strLives;
}

function renderHints() {
	var strHints = gHints.join('');
	document.querySelector('.hints').innerText = strHints;
}

function renderSafeMoves() {
	var strSafeMoves = gSafeMoves.join('');
	document.querySelector('.safe').innerText = strSafeMoves;
}

function renderGameOverMsg(isWin) {
	document.querySelector('.user').innerText = isWin ? WINNER : LOSER;
	document.querySelector('.info-bottom-row').style.display = 'none';

	var msg = isWin ? 'YOU WON' : `YOU LOSE`;
	var msgColor = isWin ? 'green' : 'darkred';
	var elGameOverMsg = document.querySelector('.game-over-row');
	elGameOverMsg.innerHTML = `<td class="cell" style="color: ${msgColor}; width:${gBoard.length * CELL_SIZE}px; height:40px">${msg}<br/><span style="color:black;">🕹GAME OVER🕹</span></td>\n`;
}

// -------------------------------------------------- TIMER -------------------------------------------------- //

function resetTimer() {
	document.querySelector('.timer span').innerText = '00:00';
	gGame.secsPassed = 0;
	clearTimer();
}

function startTimer() {
	if (gGame.isOn) {
		var elStopper = document.querySelector('.timer span');
		var startTime = Date.now();
		gTimerInterval = setInterval(() => {
			var currTime = ((Date.now() - startTime) / 1000).toFixed(2);
			elStopper.innerHTML = currTime;
			gGame.secsPassed = currTime;
		}, 100);
	}
}

function clearTimer() {
	clearInterval(gTimerInterval);
	gTimerInterval = null;
}

// ------------------------------------------------- GENERAL ------------------------------------------------- //

function getRandomInt(min, max) {
	// Inclusive
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomLocation() {
	var rndI = getRandomInt(0, gLevel.SIZE - 1);
	var rndJ = getRandomInt(0, gLevel.SIZE - 1);
	return { i: rndI, j: rndJ };
}

function playSound(url) {
	var sound = new Audio(url);
	sound.play();
}

function showInstructions() {
	confirm(
		'🎯  Uncover all the squares that do not contain mines without being "blown up" by clicking on a square with a mine underneath. \n\n▶ Click on emoji-face for restart the game.\n\n🖱 For switch game-level click on none-blue button. \n\nMINES TO COLLECT IN EACH LEVEL: \n👶Beginner: 2 mines      🤩Medium: 10 mines      🐱‍👤Expert: 30 mines'
	);
}
