//environment variables
class Cell {
  constructor(x, y, list) {
    this.x = x;
    this.y = y;
    this.path = [].concat(list);
  }
  append(c) {
    this.path.push(c);
  }
  reset() {
      this.path = [];
  }
}
const cellWidth = 20;
const cellHeight = 20;
const canvasWidth = 500;
const canvasHeight = 300;
const gridColor = "#ffffff"; //white
const startColor = "#29f469"; // green
const targetColor = "#ff0000"; //red
const wallColor = "#000000"; //black
const prevColor = "#11f9e2" // pale teal
const currColor = "#f000f0"; // fuschia
const pathColor = "#f000f0"; //
const visited = 1;
const unvisited = 0;

//variables for cell locations and moving through cells
var grid = [];
var start = {
    set: false,
    x:   0,
    y:   0
}
var target = {
    set: false,
    x:   0,
    y:   0
}
var previous = new Cell(0, 0, []);
var current = new Cell(0, 0, []);

//variables for coloring the cells that were searched
var enableClick = true;
var solve = false;
var colorPath = false;
var path = [];
var stack = {
    s: [],
    size: function(){
        return this.s.length;
    },
    push: function(cell) {
        this.s.push(cell);
    },
    pop: function() {
        return this.s.pop();
    },
    clear: function() {
        this.s = [];
    }
}

var canvasArea = {
    canvas : document.getElementById("canvas"),
    createGrid : function() {
        for(let i = 0; i < canvasWidth / cellWidth; i++){
            grid[grid.length] = [];
            for(let j = 0; j < canvasHeight / cellHeight; j++){
                colorCell(i, j, gridColor);
                grid[i][grid[i].length] = unvisited;
            }
        }
    },
    init : function() {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.context = this.canvas.getContext("2d");
        // restricts update speed and holds it constant
        this.interval = setInterval(colorVisited, 100);
        this.createGrid();
        this.canvas.addEventListener("mousedown", function (e) {colorEndpoints(e)});
    },
    reset : function() {
        grid = [];
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.createGrid();
    }
}

function colorCell(x, y, color) {
    let ctx = canvasArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(x * cellWidth + 1, y * cellHeight + 1, cellWidth-2, cellHeight-2);
    ctx.beginPath();
    ctx.lineWidth = "0.5";
    ctx.strokeStyle = "black";
    ctx.rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    ctx.stroke();
}

function colorEndpoints(e){
    if(enableClick == true){
        ctx = canvasArea.context;
        let rect = canvasArea.canvas.getBoundingClientRect();
        let x = Math.floor((e.clientX - rect.left) / cellWidth) * cellWidth;
        let y = Math.floor((e.clientY - rect.top) / cellHeight) * cellHeight;
        let pixel = ctx.getImageData(x + cellWidth/2, y + cellHeight/2, 1, 1);
        pixel = pixel.data[0]*256*256 + pixel.data[1]*256 + pixel.data[2];
        let cellColor = pixel.toString(16);
        while(cellColor.length != 6){cellColor = "0" + cellColor;}
        cellColor = "#" + cellColor;

        if(cellColor == gridColor){
            if(!start.set) {
                ctx.fillStyle = startColor;
                start.set = true;
                start.x = x/cellWidth;
                start.y = y/cellHeight;
            }
            else if(!target.set){
                ctx.fillStyle = targetColor;
                target.set = true;
                target.x = x/cellWidth;
                target.y = y/cellHeight;
            }
            else{
                ctx.fillStyle = wallColor;
                grid[x/cellWidth][y/cellHeight] = visited;
            }
        }
        else if (cellColor == startColor) {
            if(!target.set){
                ctx.fillStyle = targetColor;
                target.set = true;
                target.x = x/cellWidth;
                target.y = y/cellHeight;
                start.set = false;
            }
            else{
                ctx.fillStyle = wallColor;
                grid[x/cellWidth][y/cellHeight] = visited;
                start.set = false;
            }
        }
        else if(cellColor == targetColor){
            ctx.fillStyle = wallColor;
            grid[x/cellWidth][y/cellHeight] = visited;
            target.set = false;
        }
        else {
            ctx.fillStyle = gridColor;
            grid[x/cellWidth][y/cellHeight] = unvisited;
        }
        ctx.fillRect(x+1, y+1, cellWidth-2, cellHeight-2);
    }
}

function colorVisited() {

    if (solve == true) {
        if(stack.size() == 0) {
            console.log("stack empty or unsolvable path");
            solve = false;
            return;
        }

        let previous = new Cell(current.x, current.y, []);
        current = stack.pop();
        if(grid[current.x][current.y] == visited) {return;}
        grid[current.x][current.y] = visited;
        colorCell(previous.x, previous.y, prevColor);
        colorCell(current.x, current.y, currColor);

        if(current.x == target.x && current.y == target.y) {
            solve = false;
            colorPath = true;
            return;
        }

        current.append(current);
        if(current.x > 0 && grid[current.x - 1][current.y] == unvisited) {
            stack.push(new Cell(current.x - 1, current.y, current.path));
        }
        if(current.y < grid[0].length - 1 && grid[current.x][current.y + 1] == unvisited) {
            stack.push(new Cell(current.x, current.y + 1, current.path));
        }
        if(current.x < grid.length - 1 && grid[current.x + 1][current.y] == unvisited) {
            stack.push(new Cell(current.x + 1, current.y, current.path));
        }
        if(current.y > 0 && grid[current.x][current.y - 1] == unvisited) {
            stack.push(new Cell(current.x, current.y - 1, current.path));
        }
    }
    else if (colorPath == true) {
        if (current.path.length == 0) {
            colorPath = false;
            colorCell(start.x, start.y, startColor);
            colorCell(target.x, target.y, targetColor);
        }
        else {
            let cell = current.path.shift();
            colorCell(cell.x, cell.y, pathColor);
        }
    }
}

function initiate() {
    if(start.set && target.set && enableClick == true){
        enableClick = false;
        current.x = start.x;
        current.y = start.y;
        stack.push(current);
        solve = true;

    }
    else{}
}
function reset(){
    start.x = 0;
    start.y = 0;
    start.set = false;

    target.x = 0;
    target.y = 0;
    target.set = false;

    current.reset();

    solve = false;
    colorPath = false;

    enableClick = true;

    stack.clear();
    canvasArea.reset();
}
//start script
canvasArea.init();
