import asciify from './asciify';
// import clippy from 'clippy';
// import cssfilters from 'cssfilters';
import eggs from './addEaster';



eggs.push({
  name: 'ascii',                 // name
  code: [65, 83, 67, 73, 73],
  action: function() {

    console.log('YASS');

    var imgs = document.querySelectorAll('img');
    var bgs = document.querySelectorAll('[style*="background"]');
    var vids = document.querySelectorAll('video');

    Array.from(imgs, (img) => { new asciify(img) });
    Array.from(bgs, (bg) => { new asciify(bg) });
    // Array.from(vids, (vid) => { new asciify(vid) });
  }
});
