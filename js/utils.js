'use strict';

function init() {
	//in here => need to initialize all global variables
	// build board
	// create
	// render
	// intervals initials if needed
}
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
// ------------------------------------------ R E N D E R   M A T R I X ------------------------------------------ //

function renderBoard() {
	// creating board 
	var strHTML = `<table align="center"><tbody>\n`

	// information-row
	strHTML+= `<tr><td class="cell score" style="width:${gBoard.length/4 * 40}px"><span></span></td>\n<td class="cell user" style="width:${gBoard.length/2 * 40}px">${PLAYER}</td><td class="cell timer" style="width:${gBoard.length/4 * 40}px"><span></span></td></tr>`

	// creating board cells 
	for (var i = 0; i < gBoard.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < gBoard.length; j++) {
			var cell = gBoard[i][j];
			var className = `cell cell${i}-${j}`;
            strHTML += `<td class="${className}" onmousedown="cellClicked(event, this, ${i}, ${j})">${ cell.isShown ? cell.minesAroundCount: ''}</td>\n`;
			
		}
		strHTML += '</tr>\n';
	}
	strHTML += '</tbody></table>';
	var elContainer = document.querySelector('.game-area');
	elContainer.innerHTML = strHTML;
}

function renderCell(location, value = '') {
    var theValue = (value ? value :  gBoard[location.i][location.j].minesAroundCount)
	var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = theValue;
}


// -------------------------------------------- G E T   R A N D O M S -------------------------------------------- //

//Inclusive
function getRandomInt(min, max) {
    min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function getRandomLocation() {
    var rndI = getRandomInt(0, gLevel.SIZE - 1);
	var rndJ = getRandomInt(0, gLevel.SIZE - 1);
	return /* ([FOOD,EMPTY].includes(gBoard[rndI][rndJ])?*/ {
        i: rndI,
		j: rndJ,
	}; /* : null);*/
}

// ----------------------------------------- R E S E T   + S H U F F L E ----------------------------------------- //

function resetNums(range) {
    var arr = [];
	for (var i = 1; i <= range; i++) {
        arr.push(i);
	}
	return arr;
}

function shuffle(items) {
    var rndIdx, keep;
	for (var i = items.length - 1; i > 0; i--) {
        rndIdx = getRandomInt(1, items.length - 1);
		//swapping
		keep = items[i];
		items[i] = items[rndIdx];
		items[rndIdx] = keep;
	}
	return items;
}

// -------------------------------------------------- T I M E R -------------------------------------------------- //

function startTimer() {
	if (gGame.isOn) {
        var elStopper = document.querySelector('.timer');
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