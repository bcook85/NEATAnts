/*******************************************************************************
Favicon Silliness
*******************************************************************************/
let favLink = document.createElement("link");
favLink.rel = "shortcut icon";
favLink.href = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4woZBCsNNG3qMAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAl0lEQVQ4y6WSQRLAMAgCJf//8/bSZtCY5FBPHSMIVAHRlkSAlu9SY8Vpw9i/qVMgaekqImhUDAd9GwBpA/a5SSAJQIAmiRHgysrc3gIovk0voLOQCJIFy0HWi5LFJPANtxB9dtTGLcQoapYMksySQTS/MllIA/VoTL7PCVgsxO4aPbwXM2JzYbdKIf6pcZN67B0VOOBg8QFo06L/jDrVHwAAAABJRU5ErkJggg==";
document.getElementsByTagName("head")[0].appendChild(favLink);

/*******************************************************************************
Global Variables
*******************************************************************************/

//Grid
const tileSize = 10;
const tileSize2 = Math.floor(tileSize * 0.5);
const gridWidth = 100;
const gridHeight = 100;
var grid = [];

//Tiles
const tileEmpty = 0;
const tileFood = 0.25;
const tileScent = 0.5;
const tileColony = 0.75;
const tileWall = 1;
const foodCount = 100;
const wallCount = 75;
const decayAmount = 0.0005;

//Game
var loopID = 0;
const twoPI = Math.PI * 2;
const halfPI = Math.PI * 0.5;
const sixthPI = Math.PI / 6;
const quarterPI = Math.PI * 0.25;
var INFO = document.getElementById("info");

//Colony & Ants
var ants = [];
const colonyX = Math.floor((gridWidth * 0.25) + (Math.random() * (gridWidth * 0.5)));
const colonyXPixels = (colonyX * tileSize) + tileSize2;
const colonyY = Math.floor((gridHeight * 0.25) + (Math.random() * (gridHeight * 0.5)));
const colonyYPixels = (colonyY * tileSize) + tileSize2;
const minColonyDistance = 5;
var colonyFood = 0;
const turnSpeed = 1;
const moveSpeed = 0.5;
const antSize = 4;
const colonySize = 6;
const antAgeAmount = 0.0005;
const antCarryingSize = 3;
var highestGeneration = 1;

/*******************************************************************************
Canvas Setup
*******************************************************************************/

var canvas = document.getElementById("screen");
canvas.width = gridWidth * tileSize;
canvas.height = gridHeight * tileSize;
const aspectRatio = canvas.width / canvas.height;
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function FullScreen() {
	let newWidth = window.innerWidth;
	let newHeight = window.innerHeight;
	if (newWidth / newHeight > aspectRatio)	{//wide
		newWidth = Math.floor(newHeight * aspectRatio);
		canvas.style.height = newHeight + "px";
		canvas.style.width = newWidth + "px";
	}
	else {//tall
		newHeight = Math.floor(newWidth / aspectRatio);
		canvas.style.width = newWidth + "px";
		canvas.style.height = newHeight + "px";
	}
	canvas.style.position = "fixed";
	canvas.style.top = "50%";
	canvas.style.left = "50%";
	canvas.style.transform = "translate(-50%, -50%)";
};
FullScreen();
window.addEventListener("resize", FullScreen, false);
window.addEventListener("orientationchange", FullScreen, false);

/*******************************************************************************
Update Functions
*******************************************************************************/

function SetRandomTile(tileType, tileStrength) {
	while(true) {
		let x = Math.floor(Math.random() * gridWidth);
		let y = Math.floor(Math.random() * gridHeight);
		if (x > 0 && x < gridWidth - 1 && y > 0 && y < gridHeight - 1 &&
				((x < colonyX - minColonyDistance || x > colonyX + minColonyDistance) ||
				(y < colonyY - minColonyDistance || y > colonyY + minColonyDistance)) &&
				grid[x][y].type != tileFood && grid[x][y].type != tileWall) {
			grid[x][y].type = tileType;
			grid[x][y].strength = tileStrength;
			break;
		}
	}
}

function InitGrid() {
	//Empty Grid
	for (let x = 0; x < gridWidth; x++) {
		let col = [];
		for (let y = 0; y < gridHeight; y++) {
			col.push({
				"type": tileEmpty
				,"strength": 0
			});
		}
		grid.push(col);
	}
	//Colony
	grid[colonyX][colonyY].type = tileColony;
	//Food
	for (let i = 0; i < foodCount; i++) {
		SetRandomTile(tileFood, 1);
	}
	//Wall
	for (let i = 0; i < wallCount; i++) {
		SetRandomTile(tileWall, 1);
	}
}

function BuildAnt() {
	return {
		"x": colonyXPixels
		,"y": colonyYPixels
		,"tx": colonyX
		,"ty": colonyY
		,"dir": Math.random() * twoPI
		,"alive": true
		,"hasFood": 0
		,"age": 0
		,"brain": new Brain(14, 14, 3)
		,"desireTurn": 0
		,"desireMove": 0
		,"desireStrength": 0
		,"generation": 1
		,"facing": 0
	};
}

function InitAnts() {
	ants = [];
	for (let i = 0; i < 100; i++) {
		let ant = BuildAnt();
		ants.push(ant);
	}
}

function VisionPoints(a) {
	let vision = [];
	let tx = 0;
	let ty = 0;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 2; j++) {
			tx = Math.floor((a.x + (Math.cos(a.dir + (quarterPI * (i - 1))) * (tileSize * (j + 1)))) / tileSize);
			ty = Math.floor((a.y + (Math.sin(a.dir + (quarterPI * (i - 1))) * (tileSize * (j + 1)))) / tileSize);
			if (tx >= 0 && tx < gridWidth && ty >= 0 && ty < gridHeight) {
				vision.push(grid[tx][ty].type);
				vision.push(grid[tx][ty].strength);
			} else {
				vision.push(tileWall);
				vision.push(1);
			}
		}
	}
	return vision;
}

function GetInputs(a) {
	let inputs = VisionPoints(a);//12 inputs
	// Has Food
	inputs.push(a.hasFood);//13
	// Facing Colony
	let colDir = Math.atan2(colonyYPixels - a.y, colonyXPixels - a.x) - a.dir;
	if (colDir >= -quarterPI && colDir <= quarterPI) {
		a.facing = 1;
	} else {
		a.facing = 0;
	}
	inputs.push(a.facing);//14
	return inputs;
}

function AntAge(a) {
	a.age += antAgeAmount;
	if (a.age >= 1) {
		a.alive = false;
	}
}

function AntThink(a) {
	let inputs = GetInputs(a);
	let outputs = a.brain.predict(inputs);
	a.desireTurn = outputs[0] - 0.5;
	a.desireMove = outputs[1];
	a.desireStrength = outputs[2];
}

function IsWall(x, y) {
	let fx = Math.floor(x / tileSize);
	let fy = Math.floor(y / tileSize);
	if (fx >= 0 && fx < gridWidth && fy >= 0 && fy < gridHeight) {
		if (grid[fx][fy].type == tileWall) {
			return true;
		}
	}
	return false;
}

function AntAction(a) {
	a.dir += turnSpeed * a.desireTurn;
	a.dir = (a.dir + twoPI) % twoPI;
	a.x += (Math.cos(a.dir) * moveSpeed * (a.desireMove));
	a.y += (Math.sin(a.dir) * moveSpeed * (a.desireMove));
	if (IsWall(a.x, a.y)) {
		a.alive = false;
	}
	if (a.alive) {
		if (a.x < 0) {
			a.x = 0;
			a.alive = false;
		} else if (a.x >= (gridWidth * tileSize)) {
			a.x = (gridWidth * tileSize) - 1;
			a.alive = false;
		}
		if (a.y < 0) {
			a.y = 0;
			a.alive = false;
		} else if (a.y >= (gridHeight * tileSize)) {
			a.y = (gridHeight * tileSize) - 1;
			a.alive = false;
		}
	}
	if (a.alive) {
		let tx = Math.floor(a.x / tileSize);
		let ty = Math.floor(a.y / tileSize);
		if (tx != a.tx || ty != a.ty) {
			a.tx = tx;
			a.ty = ty;
			AntInteract(a);
		}
	}
}

function AntInteract(a) {
	if (grid[a.tx][a.ty].type != tileFood && grid[a.tx][a.ty].type != tileColony && grid[a.tx][a.ty].type != tileWall) {
		grid[a.tx][a.ty].type = tileScent;
		grid[a.tx][a.ty].strength = a.desireStrength;
	}
	if (a.hasFood == 0 && grid[a.tx][a.ty].type == tileFood) {
		a.hasFood = 1;
		a.age = 0;
		a.brain.score += 5;
		grid[a.tx][a.ty].strength -= 0.1;
		if (grid[a.tx][a.ty].strength <= 0) {
			grid[a.tx][a.ty].type = tileEmpty;
			grid[a.tx][a.ty].strength = 0;
			SetRandomTile(tileFood, 1);
		}
	}
	if (a.hasFood == 1) {
		if (a.tx == colonyX && a.ty == colonyY) {
			colonyFood += 1;
			a.brain.score += 20;
			a.hasFood = 0;
			a.age = 0;
			UpdateUI();
		}
	}
}

function AntRespawn(a) {
	if ((a.tx < colonyX - minColonyDistance || a.tx > colonyX + minColonyDistance) &&
		(a.ty < colonyY - minColonyDistance || a.ty > colonyY + minColonyDistance)) {
		if (a.hasFood == 1) {
			a.brain.score -= 1;
		} else {
			a.brain.score += 1;
		}
	}
	let currentBrains = [];
	for (let i = 0; i < ants.length; i++) {
		currentBrains.push(ants[i].brain);
	}
	let newBrain = Brain.reproduce(currentBrains);
	currentBrains = [];
	let gen = a.generation + 1;
	let newAnt = BuildAnt();
	newAnt.brain = newBrain;
	newAnt.generation = gen;
	if (gen > highestGeneration) {
		highestGeneration = gen;
		UpdateUI();
	}
	return newAnt;
}

function UpdateAnts() {
	for (let i = 0; i < ants.length; i++) {
		//Age
		AntAge(ants[i]);
		if (ants[i].alive) {
			//Think
			AntThink(ants[i]);
			//Action
			AntAction(ants[i]);
		}
		if (!ants[i].alive) {
			//If dead, respawn
			ants[i] = AntRespawn(ants[i]);
		}
	}
}

/*******************************************************************************
Draw Functions
*******************************************************************************/

function DrawGrid() {
	//BG
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//Tiles
	for (let x = 0; x < gridWidth; x++) {
		for (let y = 0; y < gridHeight; y++) {
			if (grid[x][y].type != tileEmpty) {
				if (grid[x][y].type == tileWall) {//Wall
					ctx.fillStyle = "rgba(138,43,226,1)";
				} else if (grid[x][y].type == tileFood) {//Food
					ctx.fillStyle = "rgba(0,255,0," + grid[x][y].strength + ")";
				} else if (grid[x][y].type == tileScent) {//Scent
					ctx.fillStyle = "rgba(0,165,255," + grid[x][y].strength + ")";
					grid[x][y].strength -= decayAmount;
					if (grid[x][y].strength <= 0) {
						grid[x][y].strength = 0;
						grid[x][y].type = tileEmpty;
					}
				}
				ctx.fillRect((x * tileSize) + 1, (y * tileSize) + 1, tileSize - 2, tileSize - 2);
			}
		}
	}
}

function DrawAnts() {
	for (let i = 0; i < ants.length; i++) {
		if (ants[i].alive) {
			ctx.fillStyle = "rgba(255,0,0,1)";
			ctx.beginPath();
			ctx.arc(Math.floor(ants[i].x), Math.floor(ants[i].y), antSize, 0, twoPI);
			ctx.fill();

			if (ants[i].hasFood == 1) {
				let x = Math.floor(ants[i].x + (Math.cos(ants[i].dir) * 2));
				let y = Math.floor(ants[i].y + (Math.sin(ants[i].dir) * 2));
				ctx.beginPath();
				ctx.fillStyle = "rgba(0,255,0,1)";
				ctx.arc(x, y, antCarryingSize, 0, twoPI);
				ctx.fill();
			}
		}
	}
	//Colony
	ctx.fillStyle = "rgba(255,255,0,1)";
	ctx.beginPath();
	ctx.arc(colonyXPixels, colonyYPixels, colonySize, 0, twoPI);
	ctx.fill();
}

function UpdateUI() {
	INFO.innerHTML = "HGen: " + highestGeneration + "<br>Food: " + colonyFood;
}

/*******************************************************************************
Game Loop
*******************************************************************************/


function Loop(RAFTS) {
	loopID = window.requestAnimationFrame(Loop);
	UpdateAnts();
	DrawGrid();
	DrawAnts();
}

//Start
InitGrid();
InitAnts();
UpdateUI();
loopID = window.requestAnimationFrame(Loop);