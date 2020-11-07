function clear() {
  [...document.querySelectorAll('.field')].map((o) =>
    o.classList.remove('red', 'green', 'blue')
  );
  [...document.querySelectorAll('.blinder')].map((o) =>
    o.classList.remove('on')
  );
  [...document.querySelectorAll('.strobe')].map((o) =>
    o.classList.remove('on')
  );
}

function drawFields() {
  [...document.querySelectorAll('.field')]
    .filter((o) => Math.random() >= 0.8)
    .map((o) => o.classList.add(getRandomColor()));
}

function drawBlinders() {
  [...document.querySelectorAll('.blinder')].map((o) => o.classList.add('on'));
}

function drawStrobes() {
  [...document.querySelectorAll('.strobe')].map((o) => o.classList.add('on'));
}

function draw() {
  clear();

  [...document.querySelectorAll('.field')]
    .filter((o) => isFieldOn())
    .map((o) => o.classList.add(getRandomColor()));

  if (isStrobeOn()) {
    drawStrobes();
  }

  if (isBlinderOn()) {
    drawBlinders();
  }
}

function toggle(control) {
  switch (control) {
    case 'rgb':
      rgbEnabled = !rgbEnabled;
      break;
    case 'blinder':
      blinderEnabled = !blinderEnabled;
      break;
    case 'strobe':
      strobeEnabled = !strobeEnabled;
      break;
    case 'black':
      blackEnabled = !blackEnabled;
      break;
    case 'random':
      randomEnabled = !randomEnabled;
      break;
  }
  ['rgb', 'blinder', 'strobe', 'black', 'random'].map((o) => {
    const el = document.getElementById(o);
    el.classList.remove('active');
    if (
      (o === 'rgb' && rgbEnabled) ||
      (o === 'blinder' && blinderEnabled) ||
      (o === 'strobe' && strobeEnabled) ||
      (o === 'black' && blackEnabled) ||
      (o === 'random' && randomEnabled)
    ) {
      el.classList.add('active');
    }
  });
}

function run() {
  draw();
  setTimeout(() => {
    run();
  }, 1000);
}

function start() {
  const fields = document.getElementById('fields');
  fields.innerHTML = Array(25)
    .fill(null)
    .map((o) => `<div class="field">RGB</div>`)
    .join('');

  run();
}
