// This array contains all objects in the game (targets, bombs, whatever). Each element is a plain object.
let gameObjects = []
// Dead game objects are collected here and removed once per frame. Doing it this way avoids some ugly corner-cases.
let gameObjectsThatDiedThisFrame = []

// Game time, used to calcualte the seconds since the previous frame in advanceGameToNextFrame()
let gameTime = performance.now()
// The CanvasRenderingContext2D used to draw the game world. See MDN for the available drawing operations:
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
let gameRenderingContext = null

// How many targets spawnNewTargets() should spawn over time
const spawnTargetEveryNSeconds = 0.5
// Used by spawnNewTargets() to spawn new targets. That way it even works for ridiculously small values of
// `spawnTargetEveryNSeconds` (e.g. 1/100 which would spawn a new target evey 10 milliseconds).
let gameTimeSinceLastTargetSpawn = 0


// Game initialization and input handling
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas')
  
  gameRenderingContext = canvas.getContext('2d')
  
  canvas.addEventListener('click', (event) => {
    onGameClick(event.offsetX, event.offsetY)
    event.preventDefault()
  })
  
  window.requestAnimationFrame(advanceGameToNextFrame)
})


/**
 * The main game loop. This function called once per frame by the browser.
 */
function advanceGameToNextFrame(currentTime) {
  const secondsSinceLastFrame = (currentTime - gameTime) / 1000
  gameTime = currentTime
  
  simulateGameObjects(secondsSinceLastFrame)
  markGameObjectsOutsideOfCanvasAsDead()
  
  // Remove dead game objects from our list of living game objects
  gameObjects = gameObjects.filter((gameObject) => !gameObjectsThatDiedThisFrame.includes(gameObject))
  gameObjectsThatDiedThisFrame = []
  
  spawnNewTargets(secondsSinceLastFrame)
  drawAllGameObjects()
  
  // Tell the browser to also call advanceGameToNextFrame at the next frame
  window.requestAnimationFrame(advanceGameToNextFrame)
}

/**
 * Makes game objects with a velocity move through the world. The `velocityX` and `velocityY` properties are taken as
 * pixels the object moves into the given direction per second.
 * 
 * If a game object has an `onFrame` function `gameObject.onFrame(gameObject, secondsSinceLastFrame)` is called once per
 * frame.
 * 
 * Also tracks the `secondsUntilExplosion` value of game objects and calls `gameObject.onExplosion(gameObject)` once it
 * reaches zero.
 */
function simulateGameObjects(secondsSinceLastFrame) {
  for (let gameObject of gameObjects) {
    if ( gameObject.x && gameObject.y && typeof gameObject.velocityX == 'number' && typeof gameObject.velocityY == 'number' ) {
      gameObject.x += gameObject.velocityX * secondsSinceLastFrame
      gameObject.y += gameObject.velocityY * secondsSinceLastFrame
    }
    
    if (typeof gameObject.onFrame == 'function')
      gameObject.onFrame(gameObject, secondsSinceLastFrame)
    
    if ( typeof gameObject.secondsUntilExplosion == 'number' ) {
      // Remember the full secondsUntilExplosion before we start decrementing it.
      // onBombDraw() uses this to calculate how it should draw the circle around the bomb.
      if (typeof gameObject.fullSecondsUntilExplosion != 'number')
        gameObject.fullSecondsUntilExplosion = gameObject.secondsUntilExplosion
      
      gameObject.secondsUntilExplosion -= secondsSinceLastFrame
      if (gameObject.secondsUntilExplosion <= 0) {
        if (typeof gameObject.onExplosion == 'function')
          gameObject.onExplosion(gameObject)
        gameObjectsThatDiedThisFrame.push(gameObject)
      }
    }
  }
}

/**
 * Mark game objects outside of the canvas as dead. The player can't see them anymore so we want them removed at the end
 * of the frame.
 * 
 * Calls `gameObject.onLeave(gameObject)` on game objects that are removed this way (if they have an `onLeave()`
 * function).
 */
function markGameObjectsOutsideOfCanvasAsDead() {
  for (let gameObject of gameObjects) {
    const objectXIsOutside = (gameObject.x + gameObject.radius < 0 || gameObject.x - gameObject.radius > gameRenderingContext.canvas.width)
    const objectYIsOutside = (gameObject.y + gameObject.radius < 0 || gameObject.y - gameObject.radius > gameRenderingContext.canvas.height)
    if ( objectXIsOutside || objectYIsOutside ) {
      if (typeof gameObject.onLeave == 'function')
        gameObject.onLeave(gameObject)
      gameObjectsThatDiedThisFrame.push(gameObject)
    }
  }
}

/**
 * Spawns new targets in regular intervals given by `spawnTargetEveryNSeconds` above. Spawning means it creates new game
 * objects and adds them to the world (the `gameObjects` array).
 */
function spawnNewTargets(secondsSinceLastFrame) {
  gameTimeSinceLastTargetSpawn += secondsSinceLastFrame
  
  while (gameTimeSinceLastTargetSpawn > spawnTargetEveryNSeconds) {
    const radius = randomValueBetween(5, 15)
    const positionX = gameRenderingContext.canvas.width + radius
    const positionY = randomValueBetween(radius, gameRenderingContext.canvas.height - radius);
    const target = {
      type: 'target', onDraw: onTargetDraw, onLeave: onTargetLeave,
      x: positionX, y: positionY, radius: radius,
      velocityX: randomValueBetween(-25, -100), velocityY: 0
    }
    gameObjects.push(target)
    
    gameTimeSinceLastTargetSpawn -= spawnTargetEveryNSeconds
  }
}

/**
 * Draws all game objects currently in the `gameObjects` array.
 * 
 * Calls `gameObject.onDraw(gameObject, gameRenderingContext)` if a game object has an `onDraw()` function.
 */
function drawAllGameObjects() {
  gameRenderingContext.clearRect(0, 0, gameRenderingContext.canvas.width, gameRenderingContext.canvas.height)
  for (let gameObject of gameObjects) {
    if (typeof gameObject.onDraw == 'function') {
      gameObject.onDraw(gameObject, gameRenderingContext)
    } else {
      gameRenderingContext.fillStyle = 'blue'
      gameRenderingContext.beginPath();
      gameRenderingContext.arc(gameObject.x, gameObject.y, 20, 0, 2 * Math.PI)
      gameRenderingContext.fill();
    }
  }
}


/**
 * Returns `true` if both game objects intersect (their circles touch each other).
 * Expects both game objects to have an `x`, `y` and `radius` property.
 */
function gameObjectsIntersect(gameObjectA, gameObjectB) {
  const toTargetX = gameObjectB.x - gameObjectA.x
  const toTargetY = gameObjectB.y - gameObjectA.y
  const distanceToTarget = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY)
  return (distanceToTarget < gameObjectA.radius + gameObjectB.radius)
}

/**
 * Returns a random value between `start` and `end`.
 */
function randomValueBetween(start, end) {
  return start + Math.random() * (end - start)
}


function onGameClick(x, y) {
  // Empty, should be redefined in the HTML page
}


function onTargetDraw(target, renderingContext) {
  renderingContext.fillStyle = 'hsla(0, 0%, 0%, 0.5)'
  renderingContext.beginPath();
  renderingContext.arc(target.x, target.y, target.radius, 0, 2 * Math.PI)
  renderingContext.fill();
}

function onTargetLeave(target) {
  // Empty, can be redefined in the HTML page
}


function onBombDraw(bomb, renderingContext) {
  renderingContext.fillStyle = 'hsla(0, 50%, 50%, 0.5)'
  renderingContext.beginPath();
  renderingContext.arc(bomb.x, bomb.y, bomb.radius, 0, 2 * Math.PI)
  renderingContext.fill();
  
  renderingContext.strokeStyle = 'hsla(0, 50%, 25%, 0.5)'
  renderingContext.lineWidth = 5
  renderingContext.beginPath();
  renderingContext.arc(bomb.x, bomb.y, bomb.radius - 5 / 2, 0, (bomb.secondsUntilExplosion / bomb.fullSecondsUntilExplosion) * (2 * Math.PI))
  renderingContext.stroke();
}

function onBombExplosion(bomb) {
  // Empty, should be redefined in the HTML page
}