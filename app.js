var express = require('express');
var app = express();
var body = require('body-parser');
var www = process.argv[2] || __dirname + '/www';

app.use(body.json());
app.use(body.urlencoded({ extended: true }));

app.use(express.static(www));
app.use('/ascii', express.static(__dirname + '/ascii'));

app.listen(8000);

// Put a friendly message on the terminal
console.log('Server is now running at http://127.0.0.1:8000');
