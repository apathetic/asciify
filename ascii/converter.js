

var ASCIIconverter = function(elem) {

	this.elem = elem;
	this.baseCharWidth = 9;
	// this.getTaintFreeImage(elem);
	this.calculateCharSize();

	// calculated manually for 9px, as the fn() wasn't working
	this.charSize = {
		w: 5.40625,
		h: 9
	};

	switch (elem.nodeName.toLowerCase()) {
		case 'img':
			this.img = elem;
			this.processImage();
			break;
		case 'video':
			this.processVideo();
			break;
		default:
			this.processBackground();
	}


};



ASCIIconverter.prototype = {
	calculateCharSize: function() {
		var pre = document.createElement('pre');
		var calculated = {
			w: undefined,
			h: undefined
		};
		pre.textContent = 'O';
		pre.style.fontSize = this.baseCharWidth + 'px';
		pre.style.lineHeight = '1em';
		pre.style.position = 'absolute';
		document.body.appendChild(pre);
		calculated.w = pre.getBoundingClientRect().width;
		calculated.h = pre.getBoundingClientRect().height;
		document.body.removeChild(pre);

		this.charSize = calculated;
	},

	createCanvas: function(width, height) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas;
	},

	/**
	 * Get "taint-free" image data... this is a cross-origin security thing
	 * @param  {[type]} img [description]
	 * @return {[type]}     [description]
	 */
	getTaintFreeImage: function(img) {

		var src = img.src;

		// testing
		url = src.replace('http://hugeinc.dev.hugeops.com', 'http://d249o6o0sttdia.cloudfront.net');	// ensure the request goes to cloudfront
		url += '?http_'+window.location.hostname;

		var request = new XMLHttpRequest;

		request.open('GET', url, true);
		request.onload = function() {
			if (request.status >= 200 && request.status < 400){

			// data = JSON.parse(request.responseText);
			console.log(request);

			} else {
			// error
			}
		};

		request.onerror = function() {
			// error
		};

		request.send();
	},


	convertToASCII: function() {
		// we create a "deformed" canvas so that each pixel is then
		// equivalent to size/space of a character in our monospace font
		var deformedCanvasWidth = this.canvas.width / this.charSize.w;
		var deformedCanvasHeight = this.canvas.height / this.charSize.h;
		var deformedCanvas = this.createCanvas(deformedCanvasWidth, deformedCanvasHeight);
		var deformedContext = deformedCanvas.getContext('2d');
		var asciiString, character, data;

		// prepare the canvas
		this.context.fillStyle = '#fff';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.font = this.baseCharWidth + 'px monospace';
		this.context.fillStyle = '#000';

		// process smaller image
		deformedContext.drawImage(this.img, 0, 0, deformedCanvasWidth, deformedCanvasHeight);
		data = deformedContext.getImageData(0,0,deformedCanvasWidth,deformedCanvasHeight).data;

		for (var i = 0, line = 0; line < deformedCanvasHeight; line++) {
			asciiString = '';
			for (var width = 0; width < deformedCanvasWidth; width++) {
				character = this.colorToChar(data[i], data[i + 1], data[i + 2]);
				asciiString += character;
				i += 4; // increment by 4 because the data contains rgba values and yet we only want rgb
			}
			// write the ascii string to the context adn reset the string
			this.context.fillText(asciiString, 0, line * this.charSize.h);
		}

		deformedCanvas = undefined;
	},

	colorToChar: function(r, g, b) {
		// borrowed from http://www.xanthir.com/demos/video/demo3.html
		var brightness = (3 * r + 4 * g + b) >>> 3;		// Color -> brightness

		// Chop the brightness into 12 buckets, and select a char based on that.
		return '@GLftli;:,. '[Math.floor(brightness / 256 * 12)];
	},

	/**
	 * Preserve Styles by copying over relevant positioning stuffs from the old
	 * image to the new canvas replacement
	 * @return {void}
	 */
	copyStyles: function(src, dest) {
		var props = ['width', 'height'];		// , 'position', 'top', 'left', 'scale'];
		props.forEach(function(prop) {
			var val = window.getComputedStyle(this.elem).getPropertyValue(prop);
			this.canvas.style[prop] = val;
		}, this);
	},


	/**
	 * Generates a canvas element with ASCII image data
	 * @return {void}
	 */
	generateASCIIimage: function() {
		var width =  this.img.naturalWidth;
		var height = this.img.naturalHeight;

		this.canvas = this.createCanvas(width, height);
		this.context = this.canvas.getContext('2d');
		this.context.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
		this.convertToASCII();
	},


	/**
	 * Process and convert image data from an <img> element
	 * @return {void}
	 */
	processImage: function() {
		this.generateASCIIimage();
		this.copyStyles();

		// replace ye olde <img>
		this.elem.parentNode.replaceChild(this.canvas, this.elem);
	},

	/**
	 * Process and convert background image data
	 * @return {void}
	 */
	processBackground: function() {

		this.img = new Image();

		var imgUrl = this.elem.style.backgroundImage.slice(4, -1);		// TODO. this assumes a few things about the URL
		var handleLoad = function() {
			this.generateASCIIimage();
			this.elem.style.backgroundImage = 'url(' + this.canvas.toDataURL() + ')';
			this.img.removeEventListener('load', handleLoad);
			this.img = undefined;
		}.bind(this);

		this.img.addEventListener('load', handleLoad);
		this.img.src = imgUrl;
	},

	/**
	 * [processVideo description]
	 * @param  {[type]} video [description]
	 * @return {[type]}       [description]
	 */
	processVideo: function() {

		var v = this.elem;
		var self = this;
		var cw,ch;
		var back = document.createElement('canvas');
		var backcontext = back.getContext('2d');

		// var imgUrl = v.getAttribute('poster');
		// var img = new Image();
		// var handleLoad = function() {
		// 	var converter = new ASCIIconverter(img, img.naturalWidth, img.naturalHeight);
		// 	video.parentNode.replaceChild(converter.canvas, video);
		// 	// video.setAttribute('poster', converter.canvas.toDataURL());
		// 	// video.setAttribute('poster', converter.imgCanvas.toDataURL());
		// 	// video.setAttribute('poster', converter.smCanvas.toDataURL());
		// 	img.removeEventListener('load', handleLoad);
		// 	img = undefined;
		// };

		// img.addEventListener('load', handleLoad);
		// img.src = imgUrl;




		// var out = document.getElementById('out');
		var out = document.createElement('pre');
		out.style.fontFamily = 'monospace';
		out.style.fontSize = this.baseCharWidth+'px';

		// this.copyStyles();
		// out.style.paddingLeft = '40px';
		out.style.position = 'absolute';
		out.style.top = '100px';

		v.style.opacity = 0;
		// v.style.position = 'absolute';
		v.parentNode.insertBefore(out, v.nextSibling);		// "nextSibling --> "insertAfter"
		v.addEventListener('play', play, false);

		if (!v.paused) { play(); }



		function play(){
			cw = Math.floor(v.clientWidth / self.charSize.w);
			ch = Math.floor(v.clientHeight / self.charSize.h);
			back.width = cw;
			back.height = ch;
			draw(v, out, backcontext, cw, ch);
		}

		function draw(v,out,bc,w,h) {
			if(v.paused || v.ended)	{ return false; }

			// First, draw the into the backing canvas
			bc.drawImage(v,0,0,w,h);

			// Grab the pixel data from the backing canvas
			var data = bc.getImageData(0,0,w,h).data;

			// Initialize a char array
			var chars = [];

			// Loop through the pixels
			for(var ih = 0; ih < h; ih++) {
				for(var iw = 0; iw < w; iw++) {
					// Convert a width/height into an imagedata offset
					var i = (ih*w + iw) * 4;
					// Convert the color into an appropriate character
					chars.push(self.colorToChar(data[i],data[i+1],data[i+2]));
				}
				chars.push("<br>");
			}

			// Write the char data into the output div
			out.innerHTML = chars.join('');

			// Start over!
			setTimeout(draw,50,v,out,bc,w,h);
		}

	}




};

