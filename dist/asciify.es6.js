/*
 * asciify
 * https://github.com/apathetic/asciify
 *
 * Copyright (c) 2016 Wes Hatch
 * Licensed under the MIT license.
 *
 */

var asciify = function asciify(elem) {
  this.elem = elem;
  this.baseCharWidth = 9;

  // this.calculateCharSize();
  // calculated manually for 9px, as the fn() wasn't working

  this.charSize = {
    w: 5.40625, // 8.14
    h: 9      // 9
  };

  switch (elem.nodeName.toLowerCase()) {
    case 'img':
      this.processImage();
      break;
    case 'video':
      this.processVideo();
      break;
    default:
      this.processBackground();
  }
};

// process(element) {
// this.elem = element;
// switch (element.nodeName.toLowerCase()) {
//   case 'img':
//     this.processImage();
//     break;
//   case 'video':
//     this.processVideo();
//     break;
//   default:
//     this.processBackground();
// }
// }


/**
 * Calculate the size of a mono-spaced character, in pixels
 */
asciify.prototype.calculateCharSize = function calculateCharSize () {
  var pre = document.createElement('pre');
  var calculated = {};

  pre.textContent = 'O';
  pre.style.fontSize = this.baseCharWidth + 'px';
  pre.style.lineHeight = '1em';
  pre.style.position = 'absolute';
  document.body.appendChild(pre);
  calculated.w = pre.getBoundingClientRect().width;
  calculated.h = pre.getBoundingClientRect().height;
  document.body.removeChild(pre);

  this.charSize = calculated;
};


/**
 * Create a canvas at a specified size
 * @param{[type]} width[description]
 * @param{[type]} height [description]
 * @return {[type]}      [description]
 */
asciify.prototype.createCanvas = function createCanvas (width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};


/**
 * [ description]
 * @return {[type]} [description]
 */
asciify.prototype.convertToASCII = function convertToASCII (img) {
    var this$1 = this;

  var width = img.naturalWidth;
  var height = img.naturalHeight;
  var deformedCanvasWidth = Math.floor(width / this.charSize.w);
  var deformedCanvasHeight = Math.floor(height / this.charSize.h);
  // we create a "deformed" canvas so that each pixel is then
  // equivalent to size/space of a character in our monospace font
  var deformedCanvas = this.createCanvas(deformedCanvasWidth, deformedCanvasHeight);
  var deformedContext = deformedCanvas.getContext('2d');

  // prepare the canvas
  this.canvas = this.createCanvas(width, height);
  this.context = this.canvas.getContext('2d');
  this.context.font = this.baseCharWidth + 'px monospace';

  // this.context.drawImage(img, 0, 0, width, height);
  // this.context.fillStyle = '#fff'; // = '#000';
  // this.context.fillRect(0, 0, width, height);

  // process smaller image
  deformedContext.drawImage(img, 0, 0, deformedCanvasWidth, deformedCanvasHeight);
  var data = deformedContext.getImageData(0, 0, deformedCanvasWidth, deformedCanvasHeight).data;

  for (var i = 0, line = 0; line < deformedCanvasHeight; line++) {
    var asciiString = '';
    for (var w = 0; w < deformedCanvasWidth; w++) {
      var character = this$1.colorToChar(data[i], data[i + 1], data[i + 2]);
      asciiString += character;
      i += 4; // increment by 4 because the data contains rgba values and yet we only want rgb
    }
    this$1.context.fillText(asciiString, 0, line * this$1.charSize.h);
  }
};


/**
 * Convert the average brightness in a "pixel" (i.e. a character grid)
 * to the corresponding ASCII character
 * @param{[type]} r [description]
 * @param{[type]} g [description]
 * @param{[type]} b [description]
 * @return {[type]} [description]
 */
asciify.prototype.colorToChar = function colorToChar (r, g, b) {
  // borrowed from http://www.xanthir.com/demos/video/demo3.html
  var brightness = (3 * r + 4 * g + b) >>> 3; // Color -> brightness

  // Chop the brightness into 12 buckets, and select a char based on that.
  return '@GLftli;:,. '[Math.floor(brightness / 256 * 12)];
};


/**
 * Process and convert image data from an <img> element
 * @return {void}
 */
asciify.prototype.processImage = function processImage () {
    var this$1 = this;

  var imgUrl = this.elem.src;

  this.getImageData(imgUrl).then(function (img) {
    this$1.convertToASCII(img);
    this$1.elem.src = this$1.canvas.toDataURL();
  });
};


/**
 * Process and convert background image data
 * @return {void}
 */
asciify.prototype.processBackground = function processBackground () {
    var this$1 = this;

  // TODO. this assumes a few things about the URL
  var imgUrl = this.elem.style.backgroundImage.slice(4, -1).replace(/['"]+/g, '');

  this.getImageData(imgUrl).then(function (img) {
    this$1.convertToASCII(img);
    this$1.elem.style.backgroundImage = 'url(' + this$1.canvas.toDataURL() + ')';
  });
};


/**
 * [getImageData description]
 * @param{[type]} url [description]
 * @return {[type]}   [description]
 */
asciify.prototype.getImageData = function getImageData (url) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.addEventListener('load', function() {
      resolve(img);

      // if (0) {
        // console.log('Security Error: Trying to alter an image fetched from a different domain, insufficient CORS headers');
        // reject();
      // }

    });

    img.crossOrigin = '';
    img.src = url;
  });
};


/**
 * Will dynamically ASCIIFY frames from a video. The only caveat is
 * that it must be an HTML5 <video> to work.
 * @param{[type]} video [description]
 * @return {[type]}     [description]
 */
asciify.prototype.processVideo = function processVideo () {
  var v = this.elem;
  var self = this;

  var cw = Math.floor(v.clientWidth / self.charSize.w);
  var ch = Math.floor(v.clientHeight / self.charSize.h) - 10; // TODO. This. Why 10?
  var back = this.createCanvas(cw, ch);
  var backcontext = back.getContext('2d');
  var out = document.createElement('pre');

  // var imgUrl = v.getAttribute('poster');
  // var img = new Image();
  // var handleLoad = function() {
  //var converter = new ASCIIconverter(img, img.naturalWidth, img.naturalHeight);
  //video.parentNode.replaceChild(converter.canvas, video);
  //// video.setAttribute('poster', converter.canvas.toDataURL());
  //// video.setAttribute('poster', converter.imgCanvas.toDataURL());
  //// video.setAttribute('poster', converter.smCanvas.toDataURL());
  //img.removeEventListener('load', handleLoad);
  // };


  // If the video doesn't live on the same domain, we will run into "tainted canvas"
  // exceptions. Need to make sure CORS headers are set correctly
  if (v.src.indexOf(document.domain) === -1) {
    // check if getImageData will work
    // return;
  }

  out.style.fontFamily = 'monospace';
  out.style.fontSize = this.baseCharWidth + 'px';
  out.style.position = 'absolute';
  out.style.top = 0;
  out.style.left = 0;
  out.style.right = 0;
  out.style.bottom = 0;
  out.style.margin = 0;
  out.style.zIndex = -1;// put it underneath, so video controls still work (although hidden)

  v.style.opacity = 0.0;
  v.parentNode.insertBefore(out, v.nextSibling);  // "nextSibling --> "insertAfter"
  v.addEventListener('play', play);

  if (!v.paused) { play(); }

  function play() {
    draw(v, out, backcontext, cw, ch);


  }

  function draw(v, out, bc, w, h) {
    // Initialize a char array
    var chars = [];
    var data;

    if (v.paused || v.ended) { return false; }

    // First, draw the frame into the backing canvas
    // bc.crossOrigin = 'Anonymous';
    bc.drawImage(v, 0, 0, w, h);

    // Grab the pixel data from the backing canvas
    data = bc.getImageData(0, 0, w, h).data;

    // TODO. this is redundant with convertToASCII
    // Loop through the pixels
    for (var ih = 0; ih < h; ih++) {
      for (var iw = 0; iw < w; iw++) {
        var i = (ih * w + iw) * 4;
        // Convert the color into an appropriate character
        chars.push(self.colorToChar(data[i], data[i + 1], data[i + 2]));
      }
      chars.push('<br>');
    }

    // Write the char data into the output div
    out.innerHTML = chars.join('');

    // Start over!
    setTimeout(draw, 50, v, out, bc, w, h);
  }
};

export default asciify;