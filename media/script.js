const canvas = document.getElementById('fire');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width = 300;
const CANVAS_HEIGHT = canvas.height = 300;

const img = new Image();
img.src = fireImgSrc;

const spriteWidth = 150;
const spriteHeight = 150;

let gameFrame = 0;
const staggerFrames = 20;
let state = "init";
let currentStateIndex = 0;
let stateFrameCount = 0;

const spriteAnimations = [];
const animationStates = [
    {
        name: 'init',
        frames: 8,
    },
    {
        name: 'burn',
        frames: 8,
    },
    {
        name: 'decay',
        frames: 8,
    },
    {
        name: 'extinguish',
        frames: 4,
    }
];
animationStates.forEach((state, index) => {
    let frames = {
        loc: [],
    }
    for(let i = 0; i < state.frames; i++){
        frames.loc.push({x: i * spriteWidth, y: index * spriteHeight});
    }
    spriteAnimations[state.name] = frames;
});

function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    let position = Math.floor(gameFrame / staggerFrames) % spriteAnimations[state].loc.length;
    let frameX = spriteWidth*position;
    let frameY = spriteAnimations[state].loc[position].y;
    ctx.drawImage(img,frameX,frameY,spriteWidth,spriteHeight,0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    gameFrame++;
    
    // this moves through all rows, comment later maybe
    stateFrameCount++;
    if (stateFrameCount >= spriteAnimations[state].loc.length * staggerFrames) {
        currentStateIndex = (currentStateIndex + 1) % animationStates.length;
        state = animationStates[currentStateIndex].name;
        stateFrameCount = 0;
    }
    
    requestAnimationFrame(animate); 
}

img.onload = function() {
    animate();
};