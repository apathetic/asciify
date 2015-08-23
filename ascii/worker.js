self.addEventListener('message', function(e) {

});


var CanvasConverter = function(elem, width, height) {
	// this.elem = elem;
	// console.log(elem);
	this.baseCharWidth = 7;
	this.getTaintFreeImage(elem);
	this.charSize = this.calculateCharSize();
	return;

	console.log(width, height);
	this.canvas = this.createCanvas(width, height);
	this.getImageData();
	this.imageDataToASCII();
};



CanvasConverter.prototype = {
	calculateCharSize: function() {
		var pre = document.createElement('pre');
		var calculated = {
			w: undefined,
			h: undefined
		};
		pre.textContent = 'O';
		pre.style.fontSize = this.baseCharWidth + 'px';
		pre.style.lineHeight = '1em';
		pre.style.height = 'auto';
		pre.style.width = 'auto';
		pre.style.left = '5px';
		pre.style.position = 'absolute';
		pre.style.top = '5px';
		document.body.appendChild(pre);
		calculated.w = pre.clientWidth;
		calculated.h = pre.clientHeight;
		document.body.removeChild(pre);

		return calculated;
	},

	createCanvas: function(width, height) {
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas;
	},

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

	getImageData: function() {
		this.context = this.canvas.getContext('2d');
		this.context.drawImage(this.elem, 0, 0, this.canvas.width, this.canvas.height);

		/** TESTING */
		this.imgCanvas = this.createCanvas(this.canvas.width, this.canvas.height);
		this.imgCanvas.getContext('2d').drawImage(this.elem, 0, 0, this.imgCanvas.width, this.imgCanvas.height);
		/** /TESTING */
	},

	imageDataToASCII: function() {
		// we create the small canvas because we need to calculate how many chars
		// per row we need.
		var smallCanvasWidth = Math.floor(this.canvas.width / this.charSize.w);
		var smallCanvasHeight = Math.floor(this.canvas.height / this.charSize.h);
		var smallCanvas = this.createCanvas(smallCanvasWidth, smallCanvasHeight);
		var smallContext = smallCanvas.getContext('2d');
		var asciiString, character, data;

		// prepare the canvas
		// this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = '#fff';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.font = this.baseCharWidth + 'px monospace';
		// this.context.textAlign = 'center';
		this.context.fillStyle = '#000';

		// process smaller image
		smallContext.drawImage(this.elem, 0, 0, smallCanvasWidth, smallCanvasHeight);
		data = smallContext.getImageData(0,0,smallCanvasWidth,smallCanvasHeight).data;

		for (var i = 0, line = 0; line < smallCanvasHeight; line++) {
			asciiString = '';
			for (var width = 0; width < smallCanvasWidth; width++) {
			character = this.colorToChar_(data[i], data[i + 1], data[i + 2]);
			asciiString += character;
			i += 4; // increment by 4 because the data contains rgba values and
					// we only want rgb
			}
			// write the ascii string to the context adn reset the string
			this.context.fillText(asciiString, 0, line * this.charSize.h);
		}

		/** TESTING */
		this.smCanvas = smallCanvas;
		/** /TESTING */
		smallCanvas = undefined;
	},

	colorToChar: function(pixelData) {
		var r = 0, g = 0, b = 0, a = 0;
		for (var i = 0; i < pixelData.length; i += 4) {
			r += pixelData[i];
			g += pixelData[i + 1];
			b += pixelData[i + 2];
			a += pixelData[i + 3];
		}
		return [
			r/pixelData.length,
			g/pixelData.length,
			b/pixelData.length,
			a/pixelData.length,
		]
	},

	colorToChar_: function(r, g, b) {
		// Sure... borrowed from http://www.xanthir.com/demos/video/demo3.html
		// Color -> brightness
		var brightness = (3 * r + 4 * g + b) >>> 3;
		// Chop the brightness into 13 buckets, and select a char based on that.
		return '@GLftli;:,.	'[Math.floor(brightness / 256 * 13)];
	};

}



CanvasConverter.processImage = function(img) {
	var converter = new CanvasConverter(img, img.naturalWidth, img.naturalHeight);
	converter.elem.parentNode.replaceChild(converter.canvas, converter.elem);
	// converter.elem.parentNode.appendChild(converter.imgCanvas, converter.elem);
	// converter.elem.parentNode.appendChild(converter.smCanvas, converter.elem);
	// converter.elem.parentNode.appendChild(converter.canvas, converter.elem);
}

CanvasConverter.processBackground = function(elem) {
	// return
	var imgUrl = elem.style.backgroundImage.slice(4, -1);
	var img = new Image();
	var handleLoad = function() {
		console.log({
		w: img.width,
		h: img.height,
		nw: img.naturalWidth,
		nh: img.naturalHeight
		})
		var converter = new CanvasConverter(img, img.naturalWidth, img.naturalHeight);
		elem.style.backgroundImage = 'url(' + converter.canvas.toDataURL() + ')';
		// elem.style.backgroundImage = 'url(' + converter.imgCanvas.toDataURL() + ')';
		// elem.style.backgroundImage = 'url(' + converter.smCanvas.toDataURL() + ')';
		img.removeEventListener('load', handleLoad);
		img = undefined;
	};

	img.addEventListener('load', handleLoad);
	img.src = imgUrl;
};

CanvasConverter.processVideo = function(video) {
	// return
	var imgUrl = video.getAttribute('poster');
	var img = new Image();
	var handleLoad = function() {
		var converter = new CanvasConverter(img, img.naturalWidth, img.naturalHeight);
		video.parentNode.replaceChild(converter.canvas, video);
		// video.setAttribute('poster', converter.canvas.toDataURL());
		// video.setAttribute('poster', converter.imgCanvas.toDataURL());
		// video.setAttribute('poster', converter.smCanvas.toDataURL());
		img.removeEventListener('load', handleLoad);
		img = undefined;
	};

	img.addEventListener('load', handleLoad);
	img.src = imgUrl;
	};

	return function(elems /* array of elements */) {
	var elem;
	for (var j = 0; j < elems.length; j++) {
		elem = elems[j];
		switch (elems[j].nodeName.toLowerCase()) {
		case 'img':
			CanvasConverter.processImage(elem);
			break;
		case 'video':
			CanvasConverter.processVideo(elem);
			break;
		default:
			CanvasConverter.processBackground(elem);
		}
	}
}
