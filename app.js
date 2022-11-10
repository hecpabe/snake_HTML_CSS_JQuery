

/* Const Declarations */
const CELL_EMPTY = 0;
const CELL_PLAYER_HEAD = 1;
const CELL_PLAYER_TAIL = 2;
const CELL_FOOD = 3;

const CELL_COLORS = ["green", "greenyellow"];
const CELL_PLAYER_HEAD_COLOR = "blueviolet";
const CELL_PLAYER_COLOR = "blue";
const CELL_FOOD_COLOR = "red";

const DIRECTION_NONE = 0;
const DIRECTION_LEFT = 1;
const DIRECTION_UP = 2;
const DIRECTION_RIGHT = 3;
const DIRECTION_DOWN = 4;

const GAME_SPEEDS = {

    1: 1000,
    2: 750,
    3: 500,
    4: 250

};

const GAME_SPEEDS_NEEDED_POINTS = {

    1: 0,
    2: 250,
    3: 500,
    4: 750

};

const APPLE_POINTS = 100;
const TIME_ITERATION_POINTS = 10;

/* Global Declarations */
var gameStarted = false;

var cellArray = [];
var cellColorArray = [];

var currentDirection = DIRECTION_NONE;
var eatenApples = 0;
var currentPoints = 0;

/* Main Execution */
$(function (){

    // Needed variables
    let mapWidth = 0;
    let mapHeigth = 0;
    let snakeStartingSize = 0;
    let snakeStartingSpeed = 0;

    let parametersCorrect = true;

    // Hide screens
    $(".game").hide();

    // Event handlers
    $("#homeGameFormContinueButton").click(function (event){

        // Prevent from reload
        event.preventDefault();

        // Get form inputs
        mapWidth = $("#mapWidth").val();
        mapHeigth = $("#mapHeigth").val();
        snakeStartingSize = $("#snakeStartingSize").val();
        snakeStartingSpeed = $("#snakeStartingSpeed").val();

        // Transform data to int
        mapWidth = parseInt(mapWidth);
        mapHeigth = parseInt(mapHeigth);
        snakeStartingSize = parseInt(snakeStartingSize);
        snakeStartingSpeed = parseInt(snakeStartingSpeed);

        // Check parameters
        if(mapWidth < 5 || mapWidth > 25 || isNaN(mapWidth))
            parametersCorrect = false;
        
        if(mapHeigth < 5 || mapHeigth > 25 || isNaN(mapHeigth))
            parametersCorrect = false;

        if(snakeStartingSize < 1 || snakeStartingSize > 3 || isNaN(snakeStartingSize))
            parametersCorrect = false;
        
        if(snakeStartingSpeed < 1 || snakeStartingSpeed > 4 || isNaN(snakeStartingSpeed))
            parametersCorrect = false;

        if(parametersCorrect){

            $(".home").hide();
            initGame(mapWidth, mapHeigth, snakeStartingSize, snakeStartingSpeed);

        }
        else{

            $("#homeText").text("ERROR: No ha introducido correctamente los parámetros");
            $("#homeText").css({"color": "orange"});

        }

    });

    $("body").keydown(function (event) {

        if(gameStarted){

            switch(event.keyCode){

                case 37:
                    if(currentDirection != DIRECTION_RIGHT)
                        currentDirection = DIRECTION_LEFT;
                    break;
                
                case 38:
                    if(currentDirection != DIRECTION_DOWN)
                        currentDirection = DIRECTION_UP;
                    break;
                
                case 39:
                    if(currentDirection != DIRECTION_LEFT)
                        currentDirection = DIRECTION_RIGHT;
                    break;
                
                case 40:
                    if(currentDirection != DIRECTION_UP)
                        currentDirection = DIRECTION_DOWN;
                    break;
    
            }
            
        }

    });

    $("#restartGameButton").click(function (){

        window.location.reload();

    });

});

/* Functions Code */
function sleep(ms){

    return new Promise(resolve => setTimeout(resolve, ms))

}

function initGame(mapWidth, mapHeigth, snakeStartingSize, snakeStartingSpeed){

    // Needed variables
    let player = [];

    let firstPlayerPosition = [];
    let firstFoodPosition = [];

    let newSnakeBodyPart = {};

    // Initialize text
    updateStats();

    // Initialize Board
    initGameBoard(mapWidth, mapHeigth);

    // Init player
    firstPlayerPosition = selectRandomFreeCell(mapWidth, mapHeigth);

    //player.push(newSnakeBodyPart);

    //cellArray[player[0]["y"]][player[0]["x"]] = CELL_PLAYER_HEAD;

    for(let i = 0; i < snakeStartingSize; i++){

        newSnakeBodyPart = {

            "x": firstPlayerPosition[0],
            "y": firstPlayerPosition[1]
    
        };

        player.push(newSnakeBodyPart);
        
        //console.log(player);

        if(i == 0)
            cellArray[player[i]["y"]][player[i]["x"]] = CELL_PLAYER_HEAD;
        else
            cellArray[player[i]["y"]][player[i]["x"]] = CELL_PLAYER_TAIL;

    }

    // Init first food
    firstFoodPosition = selectRandomFreeCell(mapWidth, mapHeigth);
    cellArray[firstFoodPosition[1]][firstFoodPosition[0]] = CELL_FOOD;
    paintCell(transformCoorToArrayIndex(firstFoodPosition[0], firstFoodPosition[1], mapWidth), CELL_FOOD_COLOR);

    // Show game screen
    $(".game").show();

    // Game Loop
    gameStarted = true;
    gameLoop(player, mapWidth, mapHeigth, snakeStartingSpeed);

}

function initGameBoard(mapWidth, mapHeigth){

    let gameBoardContent = "";
    let idCounter = 0;
    let currentColor = 0;

    for(let i = 0; i < mapHeigth; i++){

        gameBoardContent += '<div class="game-board-row">'

        for(let j = 0; j < mapWidth; j++){

            gameBoardContent += '<div id="' + idCounter + '" class="game-board-cell"></div>';
            idCounter++;

        }

        gameBoardContent += "</div>";

    }

    $(".game-board").html(gameBoardContent);

    idCounter = 0;

    for(let i = 0; i < mapHeigth; i++){

        let cellArrayRow = [];
        let cellColorArrayRow = [];

        for(let j = 0; j < mapWidth; j++){

            cellArrayRow.push(CELL_EMPTY);

            cellColorArrayRow.push(CELL_COLORS[currentColor]);
            $("#" + idCounter).css({"background-color": CELL_COLORS[currentColor]});
            currentColor = currentColor == 0 ? 1 : 0;
            idCounter++;

        }

        cellArray.push(cellArrayRow);
        cellColorArray.push(cellColorArrayRow);

        if(mapWidth % 2 == 0)
            currentColor = currentColor == 0 ? 1 : 0;

    }

}

function selectRandomFreeCell(mapWidth, mapHeigth){

    let randomX = 0;
    let randomY = 0;

    do{

        randomX = Math.floor(Math.random() * mapWidth);
        randomY = Math.floor(Math.random() * mapHeigth);

    }while(!checkCellIsEmpty(randomX, randomY));

    return [randomX, randomY];

}

function checkCellIsEmpty(x, y){

    return cellArray[y][x] == CELL_EMPTY;

}

async function gameLoop(player, mapWidth, mapHeigth, snakeSpeed){

    let gameLost = false;

    do{

        if(!gameLost)
            drawBoard(mapWidth, mapHeigth, player);

        if(snakeSpeed < Object.keys(GAME_SPEEDS).length){

            if(currentPoints >= GAME_SPEEDS_NEEDED_POINTS[snakeSpeed + 1])
                snakeSpeed++;

        }

        //await sleep(8000);
        //let x = player[0]["x"];
        //let y = player[0]["y"];
        //console.log("X: " + x + " / Y: " + y + " /: " + transformCoorToArrayIndex(x, y, mapWidth));
        //paintCell(transformCoorToArrayIndex(x, y, mapWidth), CELL_FOOD_COLOR);
        //paintCell(transformCoorToArrayIndex(x, y, mapWidth), CELL_COLORS[y][x]);
        //cellArray[y][x] = CELL_EMPTY;
        //cellArray[y][x + 1] = CELL_PLAYER_HEAD;
        //console.log("PRUEBA");

        //gameLost = true;

        //await sleep(GAME_SPEEDS[snakeSpeed]);
        await sleep(GAME_SPEEDS[snakeSpeed]);

        gameLost = movePlayer(player, mapWidth, mapHeigth);
        
        //drawBoard(mapWidth, mapHeigth, player);

        //console.log(player);
        //console.log(cellArray);

        if(currentDirection != DIRECTION_NONE)
            currentPoints += TIME_ITERATION_POINTS;

        updateStats();

    }while(!gameLost);



}

function drawBoard(mapWidth, mapHeigth, player){

    let x, y = 0;

    for(let i = 0; i < mapHeigth; i++)
        for(let j = 0; j < mapWidth; j++)
            if(cellArray[i][j] == CELL_PLAYER_HEAD || cellArray[i][j] == CELL_PLAYER_TAIL)
                cellArray[i][j] = CELL_EMPTY;

    for(let i = 0; i < player.length; i++){

        x = player[i]["x"];
        y = player[i]["y"];

        if(i == 0){

            cellArray[y][x] = CELL_PLAYER_HEAD;
            paintCell(transformCoorToArrayIndex(x, y, mapWidth), CELL_PLAYER_HEAD_COLOR);

        }
        else{

            cellArray[y][x] = CELL_PLAYER_TAIL;
            paintCell(transformCoorToArrayIndex(x, y, mapWidth), CELL_PLAYER_COLOR);

        }

    }

}

function paintCell(cellID, color){

    $("#" + cellID).css({"background-color": color});

}

function transformCoorToArrayIndex(x, y, mapWidth){

    return (y * mapWidth + x);

}

function movePlayer(player, mapWidth, mapHeigth){

    let lastX = player[player.length - 1]["x"];
    let lastY = player[player.length - 1]["y"];

    paintCell(transformCoorToArrayIndex(lastX, lastY, mapWidth), cellColorArray[lastY][lastX]);

    for(let i = player.length - 1; i > 0; i--){

        player[i]["x"] = player[i - 1]["x"];
        player[i]["y"] = player[i - 1]["y"];

    }

    switch(currentDirection){

        case DIRECTION_LEFT:
            player[0]["x"] = player[0]["x"] - 1;
            break;
        
        case DIRECTION_UP:
            player[0]["y"] = player[0]["y"] - 1;
            break;
        
        case DIRECTION_RIGHT:
            player[0]["x"] = player[0]["x"] + 1;
            break;
        
        case DIRECTION_DOWN:
            player[0]["y"] = player[0]["y"] + 1;
            break;

    }

    if(currentDirection == DIRECTION_NONE)
        return false;

    return checkCollision(player, mapWidth, mapHeigth);

}

function checkCollision(player, mapWidth, mapHeigth){

    // Needed variables
    let currentX = player[0]["x"];
    let currentY = player[0]["y"];

    // Check Border Collision
    if(currentX < 0 || currentY < 0 || currentX >= mapWidth || currentY >= mapHeigth)
        return true;
    
    // Check Body Collision
    if(cellArray[currentY][currentX] == CELL_PLAYER_TAIL)
        return true;

    // Check Food Collision
    if(cellArray[currentY][currentX] == CELL_FOOD)
        eatApple(mapWidth, mapHeigth, player);

    return false;

}

function updateStats(){

    $("#scoreboardScreenApples").text("Manzanas comidas: " + eatenApples);
    $("#scoreboardScreenScore").text("Puntos: " + currentPoints);

}

function eatApple(mapWidth, mapHeigth, player){

    // Needed Variables
    let newPlayerBodyPart = {};

    eatenApples++;
    currentPoints += APPLE_POINTS;

    newPlayerBodyPart = {
        "x": player[player.length - 1]["x"],
        "y": player[player.length - 1]["y"]
    };
    player.push(newPlayerBodyPart);

    drawBoard(mapWidth, mapHeigth, player);

    generateApple(mapWidth, mapHeigth);

}

function generateApple(mapWidth, mapHeigth){

    // Needed Variables
    let newApplePosition = [];

    newApplePosition = selectRandomFreeCell(mapWidth, mapHeigth);

    paintCell(transformCoorToArrayIndex(newApplePosition[0], newApplePosition[1], mapWidth), CELL_FOOD_COLOR);
    cellArray[newApplePosition[1]][newApplePosition[0]] = CELL_FOOD;

}