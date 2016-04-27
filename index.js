
import http from 'http';
import fs from 'fs';
import path from 'path';

http.createServer(function (request, response) {
    console.log('request starting...');

    var filePath = (request.url == '/') ? './demo/index.html' : './demo/' + request.url;
    var extname = path.extname(filePath);
    var contentType = 'text/html';

    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
    }

    fs.readFile(filePath, function(error, content) {
      if (error) {
        if(error.code == 'ENOENT'){
          response.writeHead(200, {'Content-Type': 'text/plain'});
          response.end('404 not found');
        }
        else {
          response.writeHead(500);
          response.end('Server error: ' + error.code);
        }
      }
      else {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
      }
    });

}).listen(8125);
console.log('Server running at http://127.0.0.1:8125/');