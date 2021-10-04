'use strict';

// -------------------------------------------- C R E A T E   M A T R I X ------------------------------------------ //

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
// ------------------------------------- R E N D E R  C E L L  \  M A T R I X -------------------------------------- //

function renderBoard() {
	// creating board
	var strHTML = `<table align="center"><tbody>\n`;

	// information-row
	strHTML += `<tr><span></span></td>\n
	<td class="cell info user" style="width:${(gBoard.length / 2) * 30}px" onclick="initGame()">${PLAYER}</td>\n
	<td class="cell info timer" style="width:${(gBoard.length / 2) * 30}px">⏰ <span></span></td>
	\n</tr>`;

	// creating board cells
	for (var i = 0; i < gBoard.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < gBoard.length; j++) {
			var cell = gBoard[i][j];
			var className = `cell cell-${i}-${j}`;
			strHTML += `<td class="${className}" onmousedown="cellClicked(event, this, ${i}, ${j})">${
				cell.isShown ? cell.minesAroundCount : ''
			}</td>\n`;
		}
		strHTML += '</tr>\n';
	}
	strHTML += '</tbody></table>';
	var elContainer = document.querySelector('.game-area');
	elContainer.innerHTML = strHTML;
}

function renderCell(location, value = null) {
	if (!value) value = gBoard[location.i][location.j].minesAroundCount;
	var elCell = getCellSelector(location.i, location.j);
	elCell.innerHTML = value;
}

function getCellSelector(row, col){
	return document.querySelector(`.cell-${row}-${col}`);
}

// -------------------------------------------- G E T   R A N D O M S -------------------------------------------- //

//Inclusive

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomLocation() {
	var rndI = getRandomInt(0, gLevel.SIZE - 1);
	var rndJ = getRandomInt(0, gLevel.SIZE - 1);
	return { i: rndI, j: rndJ };
}

// -------------------------------------------------- T I M E R -------------------------------------------------- //

function startTimer() {
	if (gGame.isOn) {
		var elStopper = document.querySelector('.timer span');
		var startTime = Date.now();
		gInterval = setInterval(() => {
			var currTime = ((Date.now() - startTime) / 1000).toFixed(2);
			elStopper.innerHTML = currTime;
		}, 100);
	}
}

function clearTimer() {
	clearInterval(gInterval);
	gInterval = null;
}

// ------------------------------------------------- O T H E R S ------------------------------------------------- //

function playSound(url) {
	var sound = new Audio(url);
	sound.play();
}

function showInstructions() {
	alert(
		`Uncover all the squares that do not contain mines without being "blown up" by clicking on a square with a mine underneath.`
	);
}
