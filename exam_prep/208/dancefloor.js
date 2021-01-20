var rgbEnabled = true;
var randomEnabled = false;
var blinderEnabled = false;
var strobeEnabled = false;
var blackEnabled = false;

function getRandomColor() {
  let num = Math.random();
  if (num <= 0.33) {
    return 'red'
  }
  if (num <= 0.66) {
    return 'green'
  }
  if (num <= 1) {
    return 'blue'
  }
}

function isFieldOn() {
  if (blackEnabled || strobeEnabled) {
    return false
  }
  if (rgbEnabled) {
    if (Math.random() <= 0.2) {
      return true
    }
  }
  if (isRandomOn()) {
    return true;
  }
}

function isStrobeOn() {
  if (blackEnabled) {
    return false
  }
  if (strobeEnabled) {
    return true
  }
  if (isRandomOn()) {
    return true;
  }
}

function isBlinderOn() {
  if (blackEnabled || strobeEnabled) {
    return false;
  }
  if (blinderEnabled) {
    return true;
  }
  if (isRandomOn()) {
    return true;
  }
}

function isRandomOn() {
  if (randomEnabled && Math.random() <= 0.4) {
    return true;
  }
  if (blackEnabled || strobeEnabled) {
    return false;
  }
  return false;
}
