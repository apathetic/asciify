
var eggs = [];

// Set up some silly default Easter Eggs:
eggs.push({
  name: 'monochrome',
  code: [77, 79, 78, 79, 67, 72, 82, 79, 77, 69],
  action: function() {
    console.log('activating monochrome...');
    var style = document.createElement('style');
    style.innerHTML = 'body { -webkit-filter: grayscale(100%);  -moz-filter: grayscale(100%); -ms-filter: grayscale(100%); -o-filter: grayscale(100%); filter: grayscale(100%); filter: gray; }';
    document.head.appendChild(style);
  }
});

eggs.push({
  name: 'sepia',
  code: [83, 69, 80, 73, 65],
  action: function() {
    console.log('activating sepia...');
    var style = document.createElement('style');
    style.innerHTML = 'body { -webkit-filter: sepia(100%);  -moz-filter: sepia(100%); -ms-filter: sepia(100%); -o-filter: sepia(100%); filter: sepia(100%); filter: sepia; }';
    document.head.appendChild(style);
  }
});

eggs.push({
  name: 'acid',
  code: [65, 67, 73, 68],
  action: () => {
  }
});

eggs.push({
  name: 'seasick',
  code: [83, 69, 65, 83, 73, 67, 75],
  action: () => {
    console.log('activating seasick...');
    let style;
    let keyframes;
    let animation, delay;

    style = document.createElement('style');
    keyframes = document.createTextNode('@keyframes seasick {'+
      '0%   { transform: translateY(0) }' +
      '50%  { transform: translateY(-10px) }' +
      '100% { transform: translateY(0) }' +
    '}');
    animation = document.createTextNode('p { animation: seasick 5s infinite }');
    delay = document.createTextNode('p:nth-child(even) { animation-delay: 1.5s }');

    style.appendChild(keyframes);
    style.appendChild(animation);
    style.appendChild(delay);

    document.head.appendChild(style);
  }
});



function detectTyping() {
  var matching = false;
  var active = [];
  var i;
  var j = 1;

  window.document.addEventListener('keydown', function easter(e) {
    if (active.length) {

      for (i = active.length; i--;) {
        if (e.keyCode === active[i].code[j]) {
          if(j === active[i].code.length - 1) {
            window.document.removeEventListener('keydown', easter); // RESET OR CANCEL...?
            active[i].action.call();
            active = [];    // this _should_ reset the thing...
          }
        } else {
          active.splice(i, 1);  // remove 1 item from the ith position
        }
      }

      j = (active.length) ? j+1 : 1;

    } else {
      for (i = eggs.length; i--;) {
        if (e.keyCode === eggs[i].code[0]) {
          active.push(eggs[i]);
        }
      }
    }
  });
}

function detectClicking() {
  var start;
  var clicks;
  var frequency;

  start = clicks = frequency = 0;

  window.document.addEventListener('click', function() {
    if (!start) { start = new Date(); }
    frequency = ++clicks / (new Date() - start) * 1000;

    if (clicks > 4 && frequency > 1) {
      console.log('super click secret activate');

      eggs[ Math.floor(Math.random()*eggs.length) ].action.call();

      start = clicks = 0;    // reset
    }
  });

}


detectTyping();
detectClicking();



export default eggs;
