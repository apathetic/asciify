;(function() {

	"use strict";

	var secret = [

		{
			cheat: 'ascii',									// cheat
			code: [65, 83, 67, 73, 73]		// code
		},
		{
			cheat: 'monochrome',
			code: [77, 79, 78, 79, 67, 72, 82, 79, 77, 69]
		},
		{
			cheat: 'sepia',
			code: [83, 69, 80, 73, 65]
		},
		{
			cheat: 'acid',
			code: [65, 67, 73, 68]
		},
		{
			cheat: 'seasick',
			code: [83, 69, 65, 83, 73, 67, 75]

		}
	];

	var i, j = 1;
	var matching = false, active = [];

	window.document.addEventListener('keydown', function easter(e) {
		if (active.length) {

			for (i = active.length; i--;) {
				if (e.keyCode === active[i].code[j]) {

					if(j === active[i].code.length - 1) {
						window.document.removeEventListener('keydown', easter);
						activate(active[i].cheat);
						active = [];		// this _should_ reset the thing...
					}

				} else {
					active.splice(i, 1);	// remove 1 item from the ith position
				}
			}

			j = (active.length) ? j+1 : 1;

		} else {
			for (i = secret.length; i--;) {
				if (e.keyCode === secret[i].code[0]) {
					active.push(secret[i]);
				}
			}
		}
	});



	function activate(code){

		console.log('activating ', code);

		switch(code) {
			case 'ascii':

				// if( !!Worker ) { return }

				// var worker = new Worker('worker.js');
				// var elems = [];


				// worker.addEventListener('message', function(e) {
				// 	resultImageData = e.data;
				// }, false);

				// worker.postMessage(elems)

				var imgs = document.querySelectorAll('img');
				Array.prototype.forEach.call(imgs, function(img) {
					new ASCIIconverter(img);
				});

				var bgs = document.querySelectorAll('[style*="background"]');
				Array.prototype.forEach.call(bgs, function(bg) {
					new ASCIIconverter(bg);
				});

				var vids = document.querySelectorAll('video');
				Array.prototype.forEach.call(vids, function(vid) {
					new ASCIIconverter(vid);
				});



			case 'monochrome':
				$('head').append('<style> body { -webkit-filter: grayscale(100%);  -moz-filter: grayscale(100%); -ms-filter: grayscale(100%); -o-filter: grayscale(100%); filter: grayscale(100%); filter: gray; }</style>');
				break;

			case 'sepia':
				$('head').append('<style> body { -webkit-filter: sepia(100%);  -moz-filter: sepia(100%); -ms-filter: sepia(100%); -o-filter: sepia(100%); filter: sepia(100%); filter: sepia; }</style>');
				break;

			default:
				break;

		}
	}


})();