/*********************************************************

The Game Project
Author: Nerissa Goh Wei Wen

Game Mechanics:
--------------
1. Collectables:
	- When a cherry is collected, your score will be added by 1.
	- When a pineapple is collected, your score will be added by 5.
2. Losing lives (When lives are not 0)
	- The score remains unchanged and you will move to the start of the current level.
3. Advancing to the next level
	- When you have reached the teleport end flag, you will advance to the next level.
	- Your score would remain unchanged and your lives will be set to 3.

4. Game over
	- When you have lost all lives, your score will be reset to 0 but the level will remain unchanged.

Extensions implemented:
----------------------
1. Created different scroll levels to create visual depth.  Used randomised factory method to populate canvas on every startgame.  Used free svgs from https://freesvg.org.

2. Platforms created using randomised factory method.
I have used an svg image to draw each platform. I have used the factory method to generate the x-position, y-position, length and height of the platforms on the canvas.  I have randomised the y-position and the length of each of the platforms.  The x-position of the platforms are generated at a fixed interval.  The problem that I face with this is that sometimes the platforms are placed over the canyons (canyons are also generated using the factory method).  To avoid this, I need to ensure that the platform x-position interval is a multiple of the x-position interval of the canyon.  The relative positions between the platforms and canyons can then be adjusted using a lag by adjusting their starting positions.

Another issue is enabling the character to jump while on the platform.  I have added an additional condition to the checkContact method to disable the isContact if the y-position of the character is greater than that of the top of the platform by a threshold.

I have learnt how to generate and access arrays of objects with confidence.  (176 words)

3. Added sounds from https://www.freesound.org.

4. Created two types of enemies with horizontal and vertical fire power.
I have used constructor functions to create two different enemy characters.  The spaceships have vertical firepower while the the robots (Kelads) have horizontal firepower.  These enemy characters are then populated across the canvas using the factory method.  The constructor function is a powerful way to generate numerous instances of the same function object.  The spaceships move and fire vertically and presented no problem to me.  But the horizontal patrolling Kelads that fire horizontal laser bolts while they move needed more mathematical consideration.  A bolt fired must travel with speed different from the shooter and the bolt will have to traverse a specified distance from the point of fire.

I have learnt how to use constructor functions in conjunction with factory method to generate different enemy characters to interact with the character.  The instantiation of the constructor function in an array allows each enemy to maintain their own contextual states during gameplay.


*********************************************************/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var enemyKill;
var firstTime;
var fireKill;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isFound;
var trapped;
var isContact;

var trees_x;
var specialTrees_x;
var specialTrees;
var clouds;
var mountains;
var cloud_pos;
var mountain_pos;
var mt_x;
var platforms;
var platforms_x;
var fireRad;

var canyon;
var collectable;
var collectable_x;
var house_x;
var flagpole;
var alpha_val;
var alpha_char;

var scrollPos;
var scrollCloud;
var scrollMt;
var scrollsplMt;
var scrollTree;
var scrollsplTree;
var scrollHouse;
var scrollPlatform;

var walk;

var game_score;
var lives;
var livesDelay;
var level;
var blink;
var timer;
var timer2;
var timer3;

var spbar;

function preload() {
	//Images
	liveImage = loadImage('images/life.svg');
	crateImage = loadImage('images/crate.svg');
	keladImage = loadImage('images/kelads.svg');
	ufoImage = loadImage('images/UFO.svg');
	fireballImage = loadImage('images/fireball.svg');
	hitImage = loadImage('images/explosion.svg');
	castleImage = loadImage('images/castle.svg')

	//Sounds
	jumpSound = loadSound("assets/jump.wav");
	jumpSound.setVolume(0.1);

	fallSound = loadSound("assets/ouch.mp3");
	fallSound.setVolume(0.2);

	teleportSound = loadSound("assets/teleport.wav");
	teleportSound.setVolume(0.05);

	collectSound = loadSound("assets/collect.wav");
	collectSound.setVolume(0.1);

	blasterSound = loadSound("assets/blaster.wav");
	blasterSound.setVolume(0.05);

	ufoSound = loadSound("assets/ufo.wav");
	ufoSound.setVolume(0.05);

	bombSound = loadSound("assets/blasterbombs.wav");
	bombSound.setVolume(0.1);
}

function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	game_score = 0;
	level = 1;
	startGame();
}

function draw()
{
	background(100, 155, 255); // fill the sky blue

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground

	push();
	translate(scrollCloud,0);

	// Draw clouds.
	drawClouds();

	pop();
	push();
	translate(scrollMt,0);

	// Draw mountains.
	drawMountains();

	pop();
	push();
	translate(scrollsplMt, 0);
	
	drawMt();

	pop();
	push();
	translate(scrollHouse,0);

	// Draw houses.
	drawHouses();

	//Draw castles
	image(castleImage, castle.xPos, castle.yPos, 200, 200);

	// Draw trees.

	pop();
	push();
	translate(scrollTree, 0)

	drawTrees();

	pop();
	push();
	translate(scrollsplTree,0);

	drawSpecialtrees();

	pop();
	push();
	translate(scrollPos, 0);

	// Draw canyons.
	drawCanyon();
	checkCanyon();

	//create platform
	drawPlatforms();

	// Draw collectable items.
	drawCollectable();
	checkCollectable();
	drawCollectable2();
	checkCollectable2();
	
	//Draw and check endflag.
	checkDrawtele(gameChar_world_x);
	
	//Make some Enemies
	drawEnemies();

	pop();

	// Draw game character.
	if(gameChar_y > floorPos_y && !endFlag.isReached) {
		drawGameChar(gameChar_world_x);
	};

	if(gameChar_y <= floorPos_y && !endFlag.isReached) {
		drawGameChar(gameChar_x);
	};

	// Logic to make the game character move or the background scroll.
	if(isLeft && !endFlag.isReached && !enemyKill && !fireKill)
	{
		if(gameChar_x > width * 0.2 && gameChar_y <= floorPos_y)
		{
			gameChar_x -= 5;
		}
		else if (gameChar_y <= floorPos_y)
		{
			scrollPos += 5;
			scrollCloud += 2;
			scrollsplMt += 3;
			scrollMt += 2.5;
			scrollTree += 4;
			scrollsplTree += 4.5;
			scrollHouse += 3.5;
 		}
	}

	if(isRight && !endFlag.isReached && !enemyKill && !fireKill)
	{
		if(gameChar_x < width * 0.8 && gameChar_y <= floorPos_y)
		{
			gameChar_x  += 5;
		}
		else if (gameChar_y <= floorPos_y)
		{
			scrollPos -= 5; // negative for moving against the background
			scrollCloud -= 2;  
			scrollsplMt -= 3;
			scrollMt -= 2.5;
			scrollTree -= 4;
			scrollsplTree -= 4.5;
			scrollHouse -= 3.5;
		}
	}

	// Logic to make the game character rise and fall.
	if(gameChar_y < floorPos_y && !enemyKill && !fireKill)
	{
		for(var i=0; i < platforms.length;i++){
			if(platforms[i].checkContact()){
				isContact = true;
				gameChar_y = platforms[i].yPos - platforms[i].height;
				isFalling = false;
				break;
			}
			else{
				isContact = false;
			}
		}
		if(!isContact){
			isFalling = true;
			gameChar_y += 3;
		}
	}  
	if(isFalling && !isPlummeting && !trapped && gameChar_y >= floorPos_y && !enemyKill && !fireKill)
	{
		isFalling = false;
		gameChar_y = floorPos_y;
	}
	

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	
	checkPlayerDie();

}

// ---------------------
// Key control functions
// ---------------------

function keyPressed(){

	if(keyCode === 37 && lives > 0){
        isLeft = true;
    }
    
    if(keyCode === 39 && lives > 0){
        isRight = true;
    }
    
    if(keyCode === 32 && gameChar_y == floorPos_y && !isPlummeting && lives > 0 && !enemyKill && !fireKill){
        gameChar_y -= 100;
	}

	if(keyCode === 32 && isContact && !enemyKill && !fireKill){
		gameChar_y -= 100;
	}
	
	if(keyCode === 32){
		spbar = true;
		if(!endFlag.isReached && lives > 0 && !enemyKill && !fireKill && gameChar_y < floorPos_y){
			jumpSound.play();
		}
	}
	
}

function keyReleased()
{

	if(keyCode === 37){
        isLeft = false;
    }
    
    if(keyCode === 39){
        isRight = false;
	}
	
	if(keyCode === 32){
		spbar = false;
	}

}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
	strokeWeight(0);
	if(isLeft && isFalling)
	{
		// add your jumping-left code
        fill(200,100,100,alpha_char);
        ellipse(gameChar_x,gameChar_y-59,35);
        triangle(gameChar_x-16,gameChar_y-64,gameChar_x-16,gameChar_y-54,gameChar_x-22,gameChar_y-59);

        fill(255, 20, 147,alpha_char);
        rect(gameChar_x - 13,gameChar_y - 45,26,30);
        rect(gameChar_x-15,gameChar_y-43,10,10);
        fill(200,100,100,alpha_char);
        rect(gameChar_x-25,gameChar_y-43,15,9);

        fill(0,0,0,alpha_char);
        rect(gameChar_x - 12,gameChar_y - 15,10,10);
        rect(gameChar_x,gameChar_y - 15,10,10);
        ellipse(gameChar_x-10,gameChar_y-65,4,4);

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
        fill(200,100,100,alpha_char);
        ellipse(gameChar_x,gameChar_y-59,35);
        triangle(gameChar_x+16,gameChar_y-64,gameChar_x+16,gameChar_y-54,gameChar_x+22,gameChar_y-59);

        fill(255, 20, 147,alpha_char);
        rect(gameChar_x - 13,gameChar_y - 44,26,27);
        rect(gameChar_x-5,gameChar_y-43,10,10);
        fill(200,100,100);
        rect(gameChar_x+10,gameChar_y-43,15,9);

        fill(0,0,0,alpha_char);
        rect(gameChar_x - 11,gameChar_y - 17,10,10);
        rect(gameChar_x + 2,gameChar_y - 17,10,10);
        ellipse(gameChar_x+10,gameChar_y-65,4,4);
	}
	else if(isLeft)
	{
		// add your walking left code

		if ((frameCount % 10) === 0)
		{
			walk = !walk;
		}
 
		if (walk) {
			// frame 1
			fill(200,100,100,alpha_char);
			ellipse(gameChar_x,gameChar_y-50,35);
			triangle(gameChar_x-16,gameChar_y-55,gameChar_x-16,gameChar_y-45,gameChar_x-22,gameChar_y-50);
	
			fill(255, 20, 147,alpha_char);
			rect(gameChar_x - 13,gameChar_y - 35,26,30);
			rect(gameChar_x-5,gameChar_y-35,10,10);
			fill(200,100,100,alpha_char);
			rect(gameChar_x-5,gameChar_y-25,9,15);
	
			fill(0,0,0,alpha_char);
			rect(gameChar_x - 15,gameChar_y - 5,10,10);
			rect(gameChar_x + 5,gameChar_y - 5,10,10);
	
			ellipse(gameChar_x-10,gameChar_y-55,4,4);
		}

		else {
			//frame 2
			fill(200,100,100,alpha_char);
			ellipse(gameChar_x,gameChar_y-50,35);
			triangle(gameChar_x-16,gameChar_y-55,gameChar_x-16,gameChar_y-45,gameChar_x-22,gameChar_y-50);
			
			fill(255, 20, 147,alpha_char);
			rect(gameChar_x - 13,gameChar_y - 35,26,30);
			rect(gameChar_x-5,gameChar_y-35,10,10);
			fill(200,100,100,alpha_char);
			rect(gameChar_x-5,gameChar_y-25,9,15);
			
			fill(0,0,0,alpha_char);
			rect(gameChar_x+1,gameChar_y - 5,10,10);
			rect(gameChar_x - 11,gameChar_y - 5,10,10);


			ellipse(gameChar_x-10,gameChar_y-55,4,4);
		}

	}
	else if(isRight)
	{
		// add your walking right code

		if ((frameCount % 10) === 0)
		{
			walk = !walk;
		}

		if (walk) {
			//frame 1
			fill(200,100,100,alpha_char);
			ellipse(gameChar_x,gameChar_y-50,35);
			triangle(gameChar_x+16,gameChar_y-55,gameChar_x+16,gameChar_y-45,gameChar_x+22,gameChar_y-50);
	
			fill(255, 20, 147,alpha_char);
			rect(gameChar_x - 13,gameChar_y - 35,26,30);
			rect(gameChar_x-5,gameChar_y-35,10,10);
			fill(200,100,100,alpha_char);
			rect(gameChar_x-5,gameChar_y-25,9,15);
	
			fill(0,0,0,alpha_char);
			rect(gameChar_x - 15,gameChar_y - 5,10,10);
			rect(gameChar_x + 5,gameChar_y - 5,10,10);
			ellipse(gameChar_x+10,gameChar_y-55,4,4);
		}

		else {
			//frame 2
			fill(200,100,100,alpha_char);
			ellipse(gameChar_x,gameChar_y-50,35);
			triangle(gameChar_x+16,gameChar_y-55,gameChar_x+16,gameChar_y-45,gameChar_x+22,gameChar_y-50);
			
			fill(255, 20, 147,alpha_char);
			rect(gameChar_x - 13,gameChar_y - 35,26,30);
			rect(gameChar_x-5,gameChar_y-35,10,10);
			fill(200,100,100,alpha_char);
			rect(gameChar_x-5,gameChar_y-25,9,15);
			
			fill(0,0,0,alpha_char);
			rect(gameChar_x - 11,gameChar_y - 5,10,10);
			rect(gameChar_x+1,gameChar_y - 5,10,10);
			ellipse(gameChar_x+10,gameChar_y-55,4,4);
		}

	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
        fill(200,100,100,alpha_char);
        ellipse(gameChar_x,gameChar_y-59,35);
        rect(gameChar_x-22,gameChar_y-62,9,15);
        rect(gameChar_x+13,gameChar_y-62,9,15);
        fill(160, 82, 45);
        ellipse(gameChar_x,gameChar_y-58,4,4);

        fill(255, 20, 147,alpha_char);
        rect(gameChar_x - 13,gameChar_y - 43,26,27);
        rect(gameChar_x-22,gameChar_y-47,9,10);
        rect(gameChar_x+13,gameChar_y-47,9,10);

        fill(0,0,0,alpha_char);
        rect(gameChar_x - 15,gameChar_y - 16,10,10);
        rect(gameChar_x + 5,gameChar_y - 16,10,10);
        ellipse(gameChar_x-5,gameChar_y-65,4,4);
        ellipse(gameChar_x+5,gameChar_y-65,4,4);
	}
	else
	{
		// add your standing front facing code
        fill(200,100,100,alpha_char);
        ellipse(gameChar_x,gameChar_y-50,35);
        rect(gameChar_x-22,gameChar_y-25,9,15);
        rect(gameChar_x+13,gameChar_y-25,9,15);
        fill(160, 82, 45,alpha_char);
        ellipse(gameChar_x,gameChar_y-48,4,4);

        fill(255, 20, 147,alpha_char);
        rect(gameChar_x - 13,gameChar_y - 35,26,30);
        rect(gameChar_x-22,gameChar_y-35,9,10);
        rect(gameChar_x+13,gameChar_y-35,9,10);

        fill(0,0,0,alpha_char);
        rect(gameChar_x - 15,gameChar_y - 5,10,10);
        rect(gameChar_x + 5,gameChar_y - 5,10,10);

        ellipse(gameChar_x-5,gameChar_y-55,4,4);
        ellipse(gameChar_x+5,gameChar_y-55,4,4);
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds()
{
	for(var i=0;i < cloud_pos.length;i++){
		fill(230,230,230);
		ellipse(cloud_pos[i].cloudX, cloud_pos[i].cloudY, 30*cloud_pos[i].cloudScale, 30*cloud_pos[i].cloudScale); 
	
		ellipse(cloud_pos[i].cloudX+30, cloud_pos[i].cloudY, 50*cloud_pos[i].cloudScale, 50*cloud_pos[i].cloudScale);

		ellipse(cloud_pos[i].cloudX+50, cloud_pos[i].cloudY, 50*cloud_pos[i].cloudScale, 50*cloud_pos[i].cloudScale);

		ellipse(cloud_pos[i].cloudX+80, cloud_pos[i].cloudY, 30*cloud_pos[i].cloudScale, 30*cloud_pos[i].cloudScale);

		ellipse(cloud_pos[i].cloudX+100, cloud_pos[i].cloudY, 20*cloud_pos[i].cloudScale, 20*cloud_pos[i].cloudScale);
	}
}

// Function to draw mountains objects.
function drawMountains()
{
	for(var k=0;k < mountain_pos.length;k++){
		fill(mountain_pos[k].colour, 70, 20);
		triangle(mountain_pos[k].posX,floorPos_y,mountain_pos[k].posX+250,floorPos_y-mountain_pos[k].height,mountain_pos[k].posX+600,floorPos_y);
		// mountain caps
		fill(255);
		triangle(mountain_pos[k].posX*mountain_pos.iceScale,floorPos_y*mountain_pos.iceScale,mountain_pos[k].posX+250,floorPos_y-mountain_pos[k].height,(mountain_pos[k].posX+600)*mountain_pos.iceScale,floorPos_y*mountain_pos.iceScale);
	}
}

function drawMt()
{
	for(var k=0;k < mt_x.length;k++) {
		fill(mt_x[k].colour,mt_x[k].colour,mt_x[k].colour);
		triangle(mt_x[k].posX, 433, mt_x[k].posX+600, 100, mt_x[k].posX+1024, 433);

		fill(255,255,255);
		beginShape();
		vertex(mt_x[k].posX+450, 183);
		vertex(mt_x[k].posX+600,100);
		vertex(mt_x[k].posX+728,200);
		vertex(mt_x[k].posX+650,180);
		vertex(mt_x[k].posX+590,200);
		vertex(mt_x[k].posX+510,170);
		endShape();
	}
}

// Function to draw houses.
function drawHouses()
{
	for(var i=0;i < house_x.length;i++) {
		//House
		stroke(0,0,0);
		strokeWeight(3);
		//chimney
		fill(232, 126, 21);
		rect(house_x[i].xPos+10,floorPos_y-150,30,50);

		//House body
		fill(161, house_x[i].blueColour, house_x[i].blueColour);
		rect(house_x[i].xPos, floorPos_y-90, 150, 90);
		fill(0,0,0);
		triangle(house_x[i].xPos+75, floorPos_y-150, house_x[i].xPos+160, floorPos_y-90, house_x[i].xPos-10, floorPos_y-90);

		fill(255,255,255);
		rect(house_x[i].xPos+20, floorPos_y-60, 30, 30);
		line(house_x[i].xPos+20,floorPos_y-45,house_x[i].xPos+50,floorPos_y-45);
		line(house_x[i].xPos+35,floorPos_y-60,house_x[i].xPos+35,floorPos_y-30);

		fill(100,0,0)
		rect(house_x[i].xPos+85,floorPos_y-70,40,70);
		
		noStroke();
	}
}

// Function to draw trees objects.
function drawTrees()
{
	// Draw trees.
	for(var i=0;i < trees_x.length;i++){
		fill(160, 82, 45);
		rect(trees_x[i], floorPos_y-height/4, 40, 150);
		
		//branches
		fill(0,100,0);
		ellipse(trees_x[i] + 40, floorPos_y-height/4, 100*1.5, 80*1.5);
		ellipse(trees_x[i] - 5, floorPos_y-height/4, 100*1.5, 80*1.5);
		ellipse(trees_x[i] + 20, floorPos_y-height/4-30, 100*1.5, 80*1.5);
	}
	
}

function drawSpecialtrees()
{
	for(var i=0;i < specialTrees_x.length;i++) {
		//Foliage
		fill(0, 128, 0);
		ellipse(specialTrees_x[i].xPos-30,specialTrees_x[i].ground-specialTrees_x[i].height-40,50*specialTrees_x[i].foliageScale,50*specialTrees_x[i].foliageScale);

		ellipse(specialTrees_x[i].xPos-10,specialTrees_x[i].ground-specialTrees_x[i].height-50,50*specialTrees_x[i].foliageScale,50*specialTrees_x[i].foliageScale);

		ellipse(specialTrees_x[i].xPos+10,specialTrees_x[i].ground-specialTrees_x[i].height-60,50*specialTrees_x[i].foliageScale,50*specialTrees_x[i].foliageScale);

		ellipse(specialTrees_x[i].xPos+30,specialTrees_x[i].ground-specialTrees_x[i].height-40,50*specialTrees_x[i].foliageScale,50*specialTrees_x[i].foliageScale);

		//Trunk & branches
		fill(153, 77, 0);
	
		beginShape();
		vertex(specialTrees_x[i].xPos,specialTrees_x[i].ground);
		vertex(specialTrees_x[i].xPos+10,specialTrees_x[i].ground-specialTrees_x[i].height);
		vertex(specialTrees_x[i].xPos-20, specialTrees_x[i].ground-specialTrees_x[i].height-30);
	
		vertex(specialTrees_x[i].xPos+15,specialTrees_x[i].ground-specialTrees_x[i].height-6);
		vertex(specialTrees_x[i].xPos+30,specialTrees_x[i].ground-specialTrees_x[i].height-20);
	
		vertex(specialTrees_x[i].xPos+20,specialTrees_x[i].ground-specialTrees_x[i].height);
		vertex(specialTrees_x[i].xPos+specialTrees_x[i].width,specialTrees_x[i].ground);
		endShape();

	}
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
	for(var n = 0;n < canyon.length;n++){
		fill(163, 106, 13);
		rect(canyon[n].xPos,432,canyon[n].width,floorPos_y+canyon[n].depth);
		fill(205, 133, 63);
		quad(canyon[n].xPos+canyon[n].width,432,canyon[n].xPos+canyon[n].width+30,432+10,canyon[n].xPos+canyon[n].width + 30,432+height,canyon[n].xPos+canyon[n].width,432+height);
		quad(canyon[n].xPos,432,canyon[n].xPos-30,432+10,canyon[n].xPos-30,432+height,canyon[n].xPos,432+height);
		
		fill(101,67,33);
		quad(canyon[n].xPos,floorPos_y+canyon[n].depth,canyon[n].xPos+canyon[n].width,floorPos_y+canyon[n].depth,canyon[n].xPos+canyon[n].width+30,floorPos_y+canyon[n].depth+30,canyon[n].xPos-30,floorPos_y+canyon[n].depth+30);
		
		fill(0, 155, 0);
		rect(canyon[n].xPos-30,floorPos_y+canyon[n].depth+30,canyon[n].width+60,height-(floorPos_y+canyon[n].depth+30));
	}
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
	for(var i=0;i < canyon.length;i++) {
		if(gameChar_world_x < canyon[i].xPos + canyon[i].width 	&& gameChar_world_x > canyon[i].xPos && 
			gameChar_y >= floorPos_y && 
			gameChar_y < floorPos_y+canyon[i].depth){
			isFalling = false;
			isPlummeting = true;
			if(lives > 0) {
				lives --;
				fallSound.play();
			}
		}
		else {
			isPlummeting = false;
			if(gameChar_y > floorPos_y) {
				gameChar_y = floorPos_y+canyon[i].depth;
			}
		}
		if(isPlummeting){
			if(gameChar_y < floorPos_y+canyon[i].depth && gameChar_y >= floorPos_y){
				gameChar_y += 3;
			}
		}
	}
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable()
{
	for(var c = 0;c < collectable.length;c++){
		if(!collectable[c].isFound){
			fill(139,0,collectable[c].blueColour);
			stroke(139,0,collectable[c].blueColour);
			ellipse(collectable[c].xPos,collectable[c].yPos,20,20);
			noFill();
			strokeWeight(2);
			stroke(0, 255, 0);
			arc(collectable[c].xPos,collectable[c].yPos-30,20,50,0,PI*0.5);
			noStroke();
		}
	}
	
}

function drawCollectable2()
{
	for(var c = 0;c < collectable2.length;c++){
		if(!collectable2[c].isFound){
			stroke(0);
			fill(255,215,0);
			ellipse(collectable2[c].xPos,collectable2[c].yPos+10,20,30);
			strokeWeight(1.5);
			line(collectable2[c].xPos-8,collectable2[c].yPos+4,collectable2[c].xPos+9,collectable2[c].yPos+15);
			line(collectable2[c].xPos-9,collectable2[c].yPos+11,collectable2[c].xPos+6,collectable2[c].yPos+21);
			line(collectable2[c].xPos-8,collectable2[c].yPos+17,collectable2[c].xPos+8,collectable2[c].yPos+2);
			line(collectable2[c].xPos-5,collectable2[c].yPos+23,collectable2[c].xPos+10,collectable2[c].yPos+9);
			strokeWeight(1);
			fill(0,128,0);
			beginShape();
			vertex(collectable2[c].xPos-8, collectable2[c].yPos);
			vertex(collectable2[c].xPos-13, collectable2[c].yPos-10);
			vertex(collectable2[c].xPos-7, collectable2[c].yPos-6);
			vertex(collectable2[c].xPos-6, collectable2[c].yPos-15);
			vertex(collectable2[c].xPos, collectable2[c].yPos-7);
			vertex(collectable2[c].xPos+4, collectable2[c].yPos-15);
			vertex(collectable2[c].xPos+7, collectable2[c].yPos-7);
			vertex(collectable2[c].xPos+14, collectable2[c].yPos-10);
			vertex(collectable2[c].xPos+8, collectable2[c].yPos);
			endShape();
		}
	}
	
}

// Function to check character has collected an item.

function checkCollectable()
{
	for(var c = 0;c < collectable.length;c++){
		if(dist(gameChar_world_x, gameChar_y, collectable[c].xPos, collectable[c].yPos) < 10 && collectable[c].isFound == false){
			collectable[c].isFound = true;
			game_score += 1;
			collectSound.play();
		}
	}

}

function checkCollectable2()
{
	for(var c = 0;c < collectable2.length;c++){
		if(dist(gameChar_world_x, gameChar_y, collectable2[c].xPos, collectable2[c].yPos) < 60 && collectable2[c].isFound == false){
			collectable2[c].isFound = true;
			game_score += 2;
			collectSound.play();
		}
	}
}

// Functions to render and check end flag.

function drawOpenedflag() 
{
	stroke(0);
	strokeWeight(1);
	fill(30,144,255);
	rect(endFlag.xPos-25,endFlag.yPos-100,50,100);
	stroke(0);
	quad(endFlag.xPos-25,endFlag.yPos-100, endFlag.xPos+25, endFlag.yPos-100, endFlag.xPos+10, endFlag.yPos-110, endFlag.xPos-10, endFlag.yPos-110);
	fill(123,104,238);
	ellipse(endFlag.xPos,endFlag.yPos-113,10,10);
	fill(65, 105, 225);
	rect(endFlag.xPos-15,endFlag.yPos-90,30,25);
	rect(endFlag.xPos-15,endFlag.yPos-35,30,25);
	fill(255,192,203);
	rect(endFlag.xPos-20,endFlag.yPos-60,40,20);
	fill(0);
	textSize(12);
	strokeWeight(1);
	text("Toilet",endFlag.xPos-15,endFlag.yPos-45);
}

function drawDoor()
{
	fill(30,144,255);
	stroke(0);
	strokeWeight(1);
	rect(endFlag.xPos-55,endFlag.yPos-100,29,100);
}

function drawClosedflag() 
{
	alpha_val -= 2;
	xPos = endFlag.xPos + 5*random(-1,1);
	yPos = endFlag.yPos + 5*random(-1,1);

	stroke(0,0,0,alpha_val);
	strokeWeight(1);
	if (frameCount % 10 == 0) 
	{
		blink = !blink;
	}
	if(blink)
	{
		fill(255,255,0,alpha_val);
	}
	else{
		fill(255,0,0,alpha_val);
	}
	ellipse(xPos,yPos-113,10,10);
	fill(30,144,255,alpha_val);
	rect(xPos-25,yPos-100,50,100);
	stroke(0,0,0,alpha_val);
	rect(xPos-30,yPos-100,5,100);
	fill(255,255,255,alpha_val);
	stroke(0,0,0,alpha_val);
	quad(xPos-25,yPos-100, xPos+25, yPos-100, xPos+10, yPos-110, xPos-10, yPos-110);
	fill(65, 105, 225,alpha_val);
	rect(xPos-15,yPos-90,30,25);
	rect(xPos-15,yPos-35,30,25);
	fill(255,192,203,alpha_val);
	rect(xPos-20,yPos-60,40,20);
	fill(0,0,0,alpha_val);
	textSize(12);
	text("Toilet",xPos-15,yPos-45);

	if(alpha_val > 0){
		teleportSound.play();
	}
}

function checkDrawtele(gameChar_x_)
{
	if(endFlag.xPos - gameChar_x_ < 10)
	{
		endFlag.isReached = true;
	}

	if (!endFlag.isReached) {
		drawDoor();
	}

	if (endFlag.isReached){
		drawGameChar(gameChar_world_x);
		drawClosedflag();
	}
	else{
		drawOpenedflag();
	}
}


function startGame() 
{
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;
	scrollCloud = 0;
	scrollMt = 0;
	scrollTree = 0;
	scrollHouse = 0;
	scrollPlatform = 0;
	scrollsplMt = 0;
	scrollsplTree = 0;
	lives = 3;
	livesDelay = 3;
	walk = 0;
	alpha_val = 255;
	alpha_char = 255;
	blink = true;
	timer = 2;
	timer2 = 2;
	timer3 = 2;
	enemyKill = false;
	firstTime = true;
	fireKill = false;
	fireRad = 150;
	spbar = false;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	isFound = false;
	isContact = false;

	// Initialise arrays of scenery objects.
	trees_x = [];
	for(var i=0;i < 5000; i = i+400)
	{
		trees_x.push(i);
	}

	specialTrees_x = [];
	for(var i=0;i < 5000;i = i+550) {
		specialTrees_x.push(
			specialTrees = {
				xPos: i,
				width: 50,
				height: random(80,150),
				ground: floorPos_y+5,
				foliageScale: 1.8
			}
		);

	}

	cloud_pos = [];
	
	for(var i=0;i < 5000;i= i+300){
		cloud_pos.push(
			clouds = {
				cloudX: i,
				cloudY: 100 + 50*random(-1, 1),
				cloudScale: 1.0 +random(-0.1, 1)
			}
		);
	}

	mountain_pos = [];
	for(var j=0;j < 5000; j = j+800){
		mountain_pos.push(
			mountains = {
				posX: j,
				posY: 430,
				height: 250 + 100*random(-1,1),
				colour: random(120,210),
				iceScale: random(0,2,0.5)
			}
		);
	}

	mt_x = [];
	for(var j=0;j < 5000; j = j+800){
		mt_x.push(
			mountains = {
				posX: j,
				posY: 430,
				colour: random(80,180)
			}
		)
	}

	endFlag = 
	{
		xPos: 6000,
		yPos: floorPos_y+5,
		isReached: false
	}

	castle = 
	{
		xPos: 4000,
		yPos: floorPos_y-193
	}

	canyon = [];
	for(var i=800; i<5000; i = i+800){
		canyon.push(
			canyon_x = {
				width: 80+floor(random(-1,1)*10),
				xPos: i,
				depth: 100
			}
		)
	}

	collectable = [];
	for(var i = 780; i<5000;i = i+400){
		collectable.push(
			collectable_x = {
				xPos: i,
				yPos: floorPos_y,
				blueColour: floor(random(0,255)),
				isFound: false
			}
		)	
		
	}

	house_x = [];
	for(var i=0;i < 4000; i=i+800){
		house_x.push(
			house = {
				xPos: i,
				blueColour: floor(random(0,255))
			}
		);
		
	}

	platforms = [];
	for(var i=1000;i < 5000; i=i+1600){
		platforms.push(
			createPlatforms(i,floorPos_y - floor(random(30,55)),floor(random(150,300)),40)
		);
	}

	collectable2 = [];
	for(var i=1000,j=0;i<5000; i=i+1600,j++){
		collectable2.push(
			collectable2_x = {
				xPos: i + platforms[j].length/2,
				yPos: platforms[j].yPos - floor(random(150,180)),
				isFound: false
			}
		);
	}

	enemies = [];
	for(var i=1250; i < 5000; i = i+1600){
		enemies.push(new Enemy(i,floorPos_y-80,floor(random(100,200))));
	}

	ufos = [];
	for(var i=780; i<5000;i = i+800){
		ufos.push(new CreateUFO(i,floor(random(150,200)),250,25));
	}

}

function recover() {
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;
	scrollCloud = 0;
	scrollMt = 0;
	scrollTree = 0;
	scrollHouse = 0;
	scrollsplMt = 0;
	scrollsplTree = 0;
	walk = 0;
	alpha_val = 255;
	alpha_char = 255;
	blink = true;
	timer = 2;
	timer2 = 2;
	timer3 = 2;
	enemyKill = false;
	firstTime = true;
	fireKill = false;
	fireRad = 150;
	spbar = false;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	isFound = false;
	isContact = false;
}

function checkPlayerDie() {
	//draw text
	fill(255,0,255);
	textSize(32);
	stroke(0);
	strokeWeight(3);
	text("Score : ", 50, 50);
	text(game_score, 180, 50);
	text("Lives  : ", 53, 100);
	
	for(i= livesDelay,x=165;i > 0; i--,x+=30) 
	{
		image(liveImage,x,70,40,40);
	}
	
	text("Level :  ", 850, 50);
	text(level, 960, 50);

	// Game over
	if(lives < 1) {
		textSize(64);
		stroke(0);
		strokeWeight(3);
		text("GAME OVER ", width/2 - 230, height/2 - 50);
		textSize(48);
		text("Press space bar", width/2 - 200, height/2 + 70);
		if(frameCount % 60 == 0 && timer2 >0) {
			timer2 --;
		}
		if(spbar && timer2 == 0) {
			game_score = 0;
			startGame(); 
		}
	}

	// Level completion
	if(alpha_val <= 0) {
		textSize(64);
		text("Completed Level : ", width/2 - 300, height/2-50);
		text(level, width/2 + 250, height/2-50);
		textSize(48);
		text("Press space bar", width/2 - 200, height/2 + 70);
		if(spbar) {
			level ++;
			startGame(); 
		}
	}

	strokeWeight(1);

	//Lose a live token
	if(gameChar_y == floorPos_y + canyon[0].depth && lives != 0) {
		if(frameCount%60 == 0 && timer > 0){
			timer --;
		}
		if(timer == 0) {
			recover();
			livesDelay = lives;
		}
		
	}

	//Check Enemies' fire
	if(enemyKill || fireKill) {
		if(lives > 0 && firstTime) {
			lives --;
			fallSound.play();
		}
		firstTime = false;
		alpha_char = 0;
		if(timer3 > 0) {
			image(hitImage, gameChar_x-100, gameChar_y-80, fireRad, fireRad);
		}
		if(frameCount%60==0 && timer3>0){
			timer3 --;
		}
		if(timer3==0){
			if(lives>0){
				recover();
				livesDelay = lives;
			}
			else{
				textSize(64);
				stroke(0);
				strokeWeight(3);
				text('GAME OVER',width/2-230,height/2-50);
				textSize(48);
				text("Press space bar",width/2-200,height/2+70);
				if(spbar){
					game_score = 0;
					startGame();
				}
			}
		}
	}

}

function createPlatforms(x,y,l,h) {
	var p = {
		xPos: x,
		yPos: y,
		length: l,
		height: h,

		draw: function() {
			image(crateImage, this.xPos, this.yPos-this.height+5, this.length, this.height);
		},

		checkContact: function() {
			if(gameChar_world_x > this.xPos && gameChar_world_x < this.xPos + this.length) {
				if(this.yPos - gameChar_y >= this.height && this.yPos - gameChar_y < this.height + 40) {
					return true;
				}
			}
			return false;
		}
	}
	return p;
}

function drawPlatforms() {
	for(var i=0;i < platforms.length; i++){
		platforms[i].draw();
	}
}

function Enemy(x,y,range){
	this.x = x;
	this.y = y;
	this.range = range;
	this.currentX = x;
	this.incr = 1;
	this.fXpos = x;
	this.start_fXpos = x;

	this.update = function() {
		this.currentX += this.incr;
		if(this.currentX >= this.x + this.range) {
			this.incr = -1;
		}
		else if(this.currentX < this.x) {
			this.incr = 1;
		}
	}
	this.draw = function() {
		this.update();
		strokeWeight(0);
		fill(255,0,0);
		if(this.incr < 0)
		{
			ellipse(this.fXpos,this.y+50,10,10);
		}
		else
		{
			ellipse(this.fXpos,this.y+50,10,10);
		}
		if(this.start_fXpos-this.fXpos <= this.range)
		{
			this.fXpos -= 2;
		}
		else
		{
			this.fXpos = this.currentX;
			this.start_fXpos = this.currentX;
			if(abs(gameChar_world_x-this.currentX) < 450) {
				blasterSound.play();
			}
		}
		image(keladImage, this.currentX, this.y + 10, 90, 90);
	}

	this.checkContact = function() {
		d = dist(gameChar_world_x,gameChar_y,this.currentX + 55,this.y+80);
		d2 = dist(gameChar_world_x,gameChar_y,this.fXpos,this.y+50);

		if(d < 35 || d2 < 35){
			return true;
		} else {
			return false;
		}
	}
}

function CreateUFO(x,y,distance,range){
	this.x = x;
	this.y = y;
	this.currentY = 0;
	this.distance = distance;
	this.descend = false;
	this.ascend = false;
	this.fYpos = y;
	this.d = undefined;
	this.range = range;
	
	this.drawDescend = function() {
		if(this.currentY < this.y){
			this.currentY += 3;
			this.descend = true;
		}
		else{
			this.descend = false;
		}
		image(ufoImage, this.x, this.currentY-90, 120, 120);
	}

	this.drawAscend = function() {
		if(this.currentY > 0){
			this.currentY -= 3;
			this.ascend = true;
		}
		else{
			this.currentY = 0;
			this.ascend = false;
		}
		image(ufoImage, this.x, this.currentY-90, 120, 120);
	}

	this.checkContact = function() {
		if(abs(this.x - gameChar_world_x) <= distance) {
			return true;
		}
		else{
			return false;
		}
	}

	this.checkFireHit = function() {
		this.d = dist(gameChar_world_x,gameChar_y-45,this.x+70,this.fYpos);
		if(this.d < this.range) {
			return true;
		}
		else {
			return false;
		}
	}
 
	this.drawFireball = function() {
		if(this.currentY >= this.y) {
			if(this.fYpos < floorPos_y-20) {
				this.fYpos += 4;
				image(fireballImage, this.x+50, this.fYpos, 25, 25);
			}
			else{
				this.fYpos = this.y;
				image(fireballImage,this.x+50,this.fYpos,25,25);
				bombSound.play();
			}
		}
		else {
			this.fYpos = this.y;
		}
	}
}

//Draw Enenmies
function drawEnemies() {
	for(var i=0; i < enemies.length; i++){
		enemies[i].draw();
		if(enemies[i].checkContact()){
			enemyKill = true;
			break;
		}
	}
	
	//draw UFO
	for(var i=0; i < ufos.length; i++){
		if(ufos[i].checkContact()){
			ufos[i].drawDescend();
			ufos[i].drawFireball();
			if(ufos[i].descend)
			{
				ufoSound.play();
			}
		}
		else{
			ufos[i].drawAscend();
			if(ufos[i].ascend)
			{
				ufoSound.play();
			}
		}
		if(ufos[i].checkFireHit()) {
			fireKill = true;
			break;
		}
	}
}