var cnv;
var score, points = 0;
var lives, x = 0;
var isPlay = false;
var gravity = 0.1;
var sword;
var fruit = [];
var fruitsList = ['apple', 'banana', 'peach', 'strawberry', 'watermelon', 'boom'];
var fruitsImgs = [], slicedFruitsImgs = [];
var livesImgs = [], livesImgs2 = [];
var boom, spliced, missed, over, start; // sounds
var bg, foregroundImg, fruitLogo, ninjaLogo, scoreImg, newGameImg, fruitImg, gameOverImg, restartImg, quitImg;
var scoreHistory = [];
var highScore = 0; // High score variable
var volumeSlider; // Volume slider
var volumeIcon; // Volume icon

// FRUIT CLASS
function Fruit(x, y, speed, color, size, fruit, slicedFruit1, slicedFruit2, name) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.color = color;
    this.size = size;
    this.xSpeed = randomXSpeed(x);
    this.ySpeed = random(-10.4, -7.4);
    this.fruit = fruit;
    this.slicedFruit1 = slicedFruit1;
    this.slicedFruit2 = slicedFruit2;
    this.name = name;
    this.sliced = false;
    this.visible = true;
}

Fruit.prototype.draw = function () {
    fill(this.color);
    if (this.sliced && this.name != 'boom') { // Draw sliced fruit
        image(this.slicedFruit1, this.x - 25, this.y, this.size, this.size);
        image(this.slicedFruit2, this.x + 25, this.y, this.size, this.size);
    } else { // Draw whole fruit
        image(this.fruit, this.x, this.y, this.size, this.size);
    }
};

Fruit.prototype.update = function () {
    if (this.sliced && this.name != 'boom') {
        this.x -= this.xSpeed;
        this.y += this.ySpeed;
        this.ySpeed += gravity * 5;
    } else {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.ySpeed += gravity;
    }
    if (this.y > height) {
        this.visible = false;
    }
};

function randomFruit() { // Create random fruit
    var x = random(width);
    var y = height;
    var size = noise(frameCount) * 20 + 40;
    var col = color(random(255), random(255), random(255));
    var speed = random(3, 5);
    var idx = round(random(0, fruitsList.length - 1));
    var fruit = fruitsImgs[idx];
    var slicedFruit1 = slicedFruitsImgs[2 * idx];
    var slicedFruit2 = slicedFruitsImgs[2 * idx + 1];
    var name = fruitsList[idx];
    return new Fruit(x, y, speed, col, size, fruit, slicedFruit1, slicedFruit2, name);
}

function randomXSpeed(x) {
    if (x > width / 2) {
        return random(-2.8, -0.5); // If fruit generated on right side, go left
    } else {
        return random(0.5, 2.8); // If fruit generated on left side, go right
    }
}

// PRELOAD FUNCTION
function preload() {
    // LOAD SOUNDS
    boom = loadSound('sounds/boom.mp3');
    spliced = loadSound('sounds/splatter.mp3');
    missed = loadSound('sounds/missed.mp3');
    start = loadSound('sounds/start.mp3');
    over = loadSound('sounds/over.mp3');

    // LOAD IMAGES
    for (var i = 0; i < fruitsList.length - 1; i++) {
        slicedFruitsImgs[2 * i] = loadImage('images/' + fruitsList[i] + '-1.png');
        slicedFruitsImgs[2 * i + 1] = loadImage('images/' + fruitsList[i] + '-2.png');
    }
    for (var i = 0; i < fruitsList.length; i++) {
        fruitsImgs[i] = loadImage('images/' + fruitsList[i] + '.png');
    }
    for (var i = 0; i < 3; i++) {
        livesImgs[i] = loadImage('images/x' + (i + 1) + '.png');
    }
    for (var i = 0; i < 3; i++) {
        livesImgs2[i] = loadImage('images/xx' + (i + 1) + '.png');
    }
    bg = loadImage('images/background.jpg');
    foregroundImg = loadImage('images/home-mask.png');
    fruitLogo = loadImage('images/fruit.png');
    ninjaLogo = loadImage('images/ninja.png');
    scoreImg = loadImage('images/score.png');
    newGameImg = loadImage('images/new-game.png');
    fruitImg = loadImage('images/fruitMode.png');
    gameOverImg = loadImage('images/game-over.png');
    restartImg = loadImage('images/retry.png'); // Load the provided restart button image
    quitImg = loadImage('images/quit.png'); // Load the provided quit button image
    volumeIcon = loadImage('images/volume.png'); // Load the volume icon image
}

// SETUP FUNCTION
function setup() {
    cnv = createCanvas(1280, 720);
    sword = new Sword(color("#FFFFFF"));
    frameRate(60);
    resetGame();
    cnv.mouseClicked(handleCanvasClick); // Add a mouseClicked event to handle canvas clicks

    // Create the volume slider
    volumeSlider = createSlider(0, 1, 0.5, 0.01);
    volumeSlider.position(width - 120, 10);
    volumeSlider.style('width', '100px');
}

// DRAW FUNCTION
function draw() {
    clear();
    background(bg);

    // Update volume based on slider value
    var volume = volumeSlider.value();
    boom.setVolume(volume);
    spliced.setVolume(volume);
    missed.setVolume(volume);
    start.setVolume(volume);
    over.setVolume(volume);

    image(foregroundImg, 0, 0, 1280, 350);
    image(fruitLogo, 40, 20, 358, 195);
    image(ninjaLogo, 880, 50, 318, 165);
    image(newGameImg, 540, 360, 200, 200);
    image(fruitImg, 595, 415, 90, 90);

    // Draw volume icon beside the slider
    image(volumeIcon, width - 160, 5, 40, 40);

    if (isPlay) {
        game();
    } else if (lives === 0) {
        gameOverScreen();
    } else {
        if (showScoreDetails) {
            displayScoreDetails(selectedScoreIndex);
        }
    }
}

// CHECK FUNCTION
function check() { // Check for game start
    if (!isPlay && (mouseX > 540 && mouseX < 740 && mouseY > 360 && mouseY < 560)) {
        start.play();
        isPlay = true;
    }
}

// GAME FUNCTION
function game() {
    if (lives <= 0) {
        gameOver();
        return;
    }

    clear();
    background(bg);
    if (mouseIsPressed) { // Draw sword
        sword.swipe(mouseX, mouseY);
    }
    if (frameCount % 5 === 0) {
        if (noise(frameCount) > 0.69) {
            fruit.push(randomFruit()); // Display new fruit
        }
    }
    points = 0;
    for (var i = fruit.length - 1; i >= 0; i--) {
        fruit[i].update();
        fruit[i].draw();
        if (!fruit[i].visible) {
            if (!fruit[i].sliced && fruit[i].name != 'boom') { // Missed fruit
                image(livesImgs2[0], fruit[i].x, fruit[i].y - 120, 50, 50);
                missed.play();
                lives--;
                x++;
            }
            if (lives < 1) { // Check for lives
                gameOver();
            }
            fruit.splice(i, 1);
        } else {
            if (fruit[i].sliced && fruit[i].name == 'boom') { // Check for bomb
                boom.play();
                gameOver();
            }
            if (sword.checkSlice(fruit[i]) && fruit[i].name != 'boom') { // Sliced fruit
                spliced.play();
                points++;
                fruit[i].update();
                fruit[i].draw();
            }
        }
    }
    if (frameCount % 2 === 0) {
        sword.update();
    }
    sword.draw();
    score += points;
    drawScore();
    drawLives();
}

// DRAW LIVES FUNCTION
function drawLives() {
    image(livesImgs[0], width - 110, 20, livesImgs[0].width, livesImgs[0].height);
    image(livesImgs[1], width - 88, 20, livesImgs[1].width, livesImgs[1].height);
    image(livesImgs[2], width - 60, 20, livesImgs[2].width, livesImgs[2].height);
    if (lives <= 2) {
        image(livesImgs2[0], width - 110, 20, livesImgs2[0].width, livesImgs2[0].height);
    }
    if (lives <= 1) {
        image(livesImgs2[1], width - 88, 20, livesImgs2[1].width, livesImgs2[1].height);
    }
    if (lives === 0) {
        image(livesImgs2[2], width - 60, 20, livesImgs2[2].width, livesImgs2[2].height);
    }
}

// DRAW SCORE FUNCTION
function drawScore() {
    image(scoreImg, 10, 10, 40, 40);
    textAlign(LEFT);
    noStroke();
    fill(255, 147, 21);
    textSize(50);
    text(score, 50, 50);
}

// GAME OVER FUNCTION
function gameOver() {
    isPlay = false;
    noLoop();
    over.play();
    scoreHistory.push(score); // Add the current score to the history
    if (scoreHistory.length > 5) {
        scoreHistory.shift(); // Keep only the last five scores
    }
    if (score > highScore) {
        highScore = score; // Update high score
    }
    gameOverScreen();
    console.log("lost");
}

// GAME OVER SCREEN FUNCTION
function gameOverScreen() {
    clear();
    background(bg);
    image(gameOverImg, 395, 260, 490, 85);

    var buttonWidth = 250; // Increase the button size
    var buttonHeight = 125;

    var restartX = width / 2 - buttonWidth - 50;
    var restartY = 350;
    image(restartImg, restartX, restartY, buttonWidth, buttonHeight); // Draw larger restart button under Game Over button

    var quitX = width / 2 + 50;
    var quitY = 350;
    image(quitImg, quitX, quitY, buttonWidth, buttonHeight); // Draw larger quit button under Game Over button

    displayHighScore();
}

// RESET GAME FUNCTION
function resetGame() {
    fruit = [];
    score = 0;
    points = 0;
    lives = 3;
    x = 0;
    isPlay = false;
    showScoreDetails = false;
    selectedScoreIndex = -1;
    sword = new Sword(color("#FFFFFF"));
    loop();
}

// RESTART GAME FUNCTION
function restartGame() {
    resetGame();
    isPlay = true;
}

// QUIT GAME FUNCTION
function quitGame() {
    resetGame();
    // Additional code to return to main menu, e.g., show main menu screen
}

// HANDLE CANVAS CLICK FUNCTION
function handleCanvasClick() {
    if (!isPlay && lives === 0) {
        var buttonWidth = 250;
        var buttonHeight = 125;

        var restartX = width / 2 - buttonWidth - 50;
        var restartY = 350;
        if (mouseX > restartX && mouseX < restartX + buttonWidth && mouseY > restartY && mouseY < restartY + buttonHeight) {
            restartGame();
        } else {
            var quitX = width / 2 + 50;
            var quitY = 350;
            if (mouseX > quitX && mouseX < quitX + buttonWidth && mouseY > quitY && mouseY < quitY + buttonHeight) {
                quitGame();
            }
        }
    } else if (!isPlay) {
        check();
        if (showScoreDetails) {
            showScoreDetails = false;
            selectedScoreIndex = -1;
        }
    }
}

// DISPLAY HIGH SCORE FUNCTION
function displayHighScore() {
    textAlign(CENTER);
    fill(255, 147, 21);
    textSize(50);
    text('High Score', width / 2, 150);
    text(highScore, width / 2, 250); // Display the high score on the scoreboard
}

// SWORD CLASS
function Sword(color) {
    this.swipes = [];
    this.color = color;
}

Sword.prototype.draw = function () {
    var l = this.swipes.length;
    for (var i = 0; i < this.swipes.length; i++) {
        var size = map(i, 0, this.swipes.length, 2, 27);
        noStroke();
        fill(this.color);
        ellipse(this.swipes[i].x, this.swipes[i].y, size);
    }
    if (l < 1) {
        return;
    }
    fill(255);
    textSize(20);
}

Sword.prototype.update = function () {
    if (this.swipes.length > 20) { // fade swipe - delete last value
        this.swipes.splice(0, 1);
        this.swipes.splice(0, 1);
    }
    if (this.swipes.length > 0) {
        this.swipes.splice(0, 1);
    }
}

Sword.prototype.checkSlice = function (fruit) {
    if (fruit.sliced || this.swipes.length < 2) {
        return false;
    }
    var length = this.swipes.length;
    var stroke1 = this.swipes[length - 1]; // latest stroke
    var stroke2 = this.swipes[length - 2]; // second last stroke
    var d1 = dist(stroke1.x, stroke1.y, fruit.x, fruit.y); // distance between stroke1 and fruit
    var d2 = dist(stroke2.x, stroke2.y, fruit.x, fruit.y); // distance between stroke2 and fruit
    var d3 = dist(stroke1.x, stroke1.y, stroke2.x, stroke2.y); // distance between stroke1 and stroke2
    var sliced = (d1 < fruit.size) || ((d1 < d3 && d2 < d3) && (d3 < width / 4));
    fruit.sliced = sliced;
    return sliced;
}

Sword.prototype.swipe = function (x, y) { // sword swipe
    this.swipes.push(createVector(x, y));
}
