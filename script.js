const canvas = document.querySelector('#canvasPlate');
const ctx = canvas.getContext('2d');


const healthNum = document.querySelector('.healthNum');
const highScoreNum = document.querySelector('.scoreNum');
const pointsNum = document.querySelector('.pointsNum');

const startBtn = document.querySelector('.startBtn');
const BtnOverlay = document.querySelector('.BtnWrapper');
var startGame = false;

var firstTime = true;

//Setting canvas width and height
canvas.width = window.innerWidth
canvas.height = window.innerHeight

ctx.beginPath();
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.fill();


var highScore = 0;


function init(){
    var frameId;

    //reset
    pointsNum.innerText = 0

    var frames = 0;
    var time = 0;
    var pointsCollected = 0;
    var pointsPerSixFrames = 1;

    var pos = []
    var radius = 5;

    var friction = 0.99

    var idleTimeout;
    var idleDelay = 100;
    var mouseIdle = false;

    var levelSpeed = 1.3;
    var currLevel = 1;

    var health = 100;
    healthNum.innerText = health;
    var playerRadius = 3;

    class Enemy{
        constructor({x, y, radius, velocityX, velocityY, color}){
            this.x = x,
            this.y = y,
            this.radius = radius,
            this.velocityX = velocityX,
            this.velocityY = velocityY,
            this.color = color
        }
    
        draw(){
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = "white"
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
            ctx.fill();
            ctx.restore();
        }
    
        update(){
            this.draw();
            this.x += this.velocityX;
            this.y += this.velocityY;
        }
    }
    
    class Projectile{
        constructor({x, y, radius, velocityX, velocityY, color}){
            this.x = x,
            this.y = y,
            this.radius = radius,
            this.velocityX = velocityX,
            this.velocityY = velocityY,
            this.color = color,
            this.alpha = 1
        }
    
        draw(){
            //save the current state of rendering context 
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = 25;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
            ctx.fill();
            ctx.restore();
            //undoes any changes done to properties of context: the changes will only affect
            //the middle lines between save and restore
        }
    
        update(){
            this.draw();
            //adding friction to projectiles
            this.velocityX *= friction;
            this.velocityY *= friction;
    
            this.x += this.velocityX;
            this.y += this.velocityY;
            this.alpha -= 0.008;
        }
    }
    
    var enemies = []
    
    function spawnEnemies(){
        var tempX
        var tempY
    
        if (Math.random() < 0.5) {
            tempX = Math.random() * canvas.width;
            tempY = 0; 
        } else {
            tempX = canvas.width;
            tempY = Math.random() * canvas.height;
        }
        
        enemies.push(new Enemy({
            x:tempX,
            y:tempY,
            radius:10,//4
            velocityX:(Math.sin(5.2))*(levelSpeed+currLevel),
            velocityY:(Math.cos(5.2))*(levelSpeed+currLevel),
            color:"red"
        }))
    }
    
    
    function enemyHit(EnemyDead, idx){
    
        for(var i=0; i<EnemyDead.radius*1.5; i++){
            projectiles.push(new Projectile({
                x:EnemyDead.x,
                y:EnemyDead.y,
                radius:EnemyDead.radius/1.8,//1.3
                velocityX:(Math.random()-0.3)*(Math.random()*8)+EnemyDead.velocityX,
                velocityY:(Math.random()-0.3)*(Math.random()*8)+EnemyDead.velocityY,
                // color:"rgb("+Math.random()*(255-100)+100+","+Math.random()*(255-100)+100+","+Math.random()*(255-100)+100+")"
                color : "hsl(" + Math.random() * 360 + ", 100%, 78%)"
            }))
        }
        
        enemies.splice(idx, 1);
        
        if(healthNum.innerText - 30 <= 0){
            healthNum.innerText = 0;
        }else{
            healthNum.innerText -= 30;
        }
        
        health -= 30;
    }
    
    var projectiles = []
    
    
    function gameOver(){
        cancelAnimationFrame(frameId);
        startGame = false;
        if(firstTime != true){
            startBtn.innerText = "Restart";
        }
        BtnOverlay.style.display = "flex";
        highScore = Math.max(highScore, pointsCollected);
        highScoreNum.innerText = highScore;
    }
    
    function animate(){
        frameId = requestAnimationFrame(animate);
        frames++;
        time++;
    
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        //---------------------------------MOUSE TRAILING ANIMATION----------------------------------------------//
    
        var prevPos = {x:undefined, y:undefined}
    
        for(var i=0; i<pos.length; i++){
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.shadowBlur = 50;
            ctx.shadowColor = "white"
            ctx.arc(pos[i].x, pos[i].y, playerRadius*1.5, 0, Math.PI*2, false);
            ctx.fill();
            ctx.restore();
    
            if(pos[i].x >= 0 && pos[i].x <= canvas.width && pos[i].y >= 0 && pos[i].y <= canvas.height){
                if(prevPos.x != undefined && prevPos.y != undefined){
                    var dist = Math.sqrt((prevPos.x - pos[i].x)**2 + (prevPos.y - pos[i].y)**2);
        
                    if(dist >= radius){
                        ctx.save();
                        ctx.beginPath();
                        ctx.lineWidth = 9.5;//1
                        ctx.shadowBlur = 40;
                        ctx.shadowColor = "white";
                        ctx.strokeStyle = "white";
                        ctx.moveTo(prevPos.x, prevPos.y);
                        ctx.lineTo(pos[i].x, pos[i].y);
                        ctx.stroke();
                        ctx.restore();
        
                        for(var j=0; j<enemies.length; j++){
                            var dist1 = Math.sqrt((prevPos.x - enemies[j].x)**2 + (prevPos.y - enemies[j].y)**2) - enemies[j].radius;
                            var dist2 = Math.sqrt((pos[i].x - enemies[j].x)**2 + (pos[i].y - enemies[j].y)**2) - enemies[j].radius;
                            var totalLen = Math.sqrt((pos[i].x - prevPos.x)**2 + (pos[i].y - prevPos.y)**2);
                            
                            if(dist1 + dist2 - totalLen <= 0.5){
                                enemies[j].color = "white";
                                enemyHit(enemies[j], j);
                            }
                        }
                    }
                }
            }
            
    
            prevPos.x = pos[i].x;
            prevPos.y = pos[i].y;
        }
    
        if(pos.length > 5 || (mouseIdle)){
            if(pos.length < 3){
                mouseIdle = false;
            }else{
                for(var i=0; i<pos.length-1; i++){
                    pos[i] = pos[i+1];
                }
                pos.splice(pos.length-1, 1);
            }
        }
    
        //---------------------------------MOUSE TRAILING ANIMATION----------------------------------------------//
    
    
        
        //Check collision with the player
        if(pos.length!=0 && pos[0].x != undefined && pos[0].y != undefined){
            for(var i=0; i<enemies.length; i++){
                var dist = Math.sqrt((enemies[i].x - pos[0].x)**2 + (enemies[i].y - pos[0].y)**2);
                if(playerRadius + enemies[i].radius > dist + 0.5){
                    enemyHit(enemies[i], i);
                }
            }
        }
    
        //check if health lower than 0
        if(health <= 0){
            gameOver();
        }
        
    
        //For projectiles animation when it collides with player
        for(var i=0; i<projectiles.length; i++){
            projectiles[i].update();
            //If value of aplha goes below zero, remove projectile
            if(projectiles[i].alpha <= 0){
                projectiles.splice(i, 1);
            }
        }
    
        for(var i=0; i<enemies.length; i++){
            enemies[i].update();
    
            if(enemies[i].y > canvas.height || enemies[i].x < 0){
                enemies.splice(i, 1);
            }
        }
    
        if(frames%30 == 0){
            for(var i=0; i<currLevel; i++){
                spawnEnemies();
            }
            
        }
        if(frames%6 == 0){
            pointsCollected += pointsPerSixFrames;
            pointsNum.innerText = pointsCollected;
        }

        //every 30 sec level should increase
        if(frames%600 == 0){
            currLevel++;
        }
    
    }
    
    var setTimer = () => {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
            mouseIdle = true;
        }, idleDelay);
    }
    
    //offsetX has reference point from topleft point of the target element
    //clientX has reference point from topleft of viewport
    
    addEventListener('mousemove', (event) => {
        if(event.target.id != "canvasPlate"){
            //mouse out of canvas
            // console.log("out");
        }else{
            pos.push({ x: event.offsetX-10, y: event.offsetY+10});
        }
        
        //mouse moved
        if(mouseIdle){
            mouseIdle = false;
        }
    
        //if mouse is idle, the pos should clear itself eventually
        setTimer();
    
    });

    startBtn.addEventListener('click', ()=> {
        if(startGame == false){
            //Start game
            firstTime = false;
            BtnOverlay.style.display =  "none";
            startGame = true;
            init();
            pos = []
            animate();
        }
    })

    addEventListener('resize', (event) => {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        ctx.beginPath();
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fill();

    })
}



//Initialize the game
init();

