var rgbEnabled = true;
var randomEnabled = false;
var blinderEnabled = false;
var strobeEnabled = false;
var blackEnabled = false;

function getRandomColor() {
  color = Math.random()

  if (color <= 1/3) return 'red';
  if (color <= 2/3 && color > 1/3) return 'green';
  if (color > 2/3) return 'blue';

}

function isFieldOn() {
  if (Math.random() <= 0.2 && rgbEnabled) return true;
  if (blackEnabled || strobeEnabled) return false;
  if (isRandomOn()) return true;
  return false;
}

function isStrobeOn() {
  if (blackEnabled) return false;
  if (strobeEnabled) return true;
  if (isRandomOn()) return true;
}

function isBlinderOn() {
  if (blackEnabled || strobeEnabled) {
    return false;
  }
  if (blinderEnabled) {
    return true;
  }
}

function isRandomOn() {
  if (Math.random() <= 0.4 && randomEnabled) return true;
  if (blackEnabled || strobeEnabled) {
    return false;
  }

}
