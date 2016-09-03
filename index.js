var express = require('express');
var app = express();

// "public" directory contains static resources.
app.use(express.static(__dirname + '/public'));

// "views" directory contains ejs templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Utility that will allow us to parse POST request data
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Configure URL routes.
app.get('/', function(request, response) {
	response.render('pages/index');
});

app.post('/get-synonyms', function(request, response) {
	response.writeHead(200);

	require('./synonyms-crawler')(
		request.body.word, request.body.append,
		function(processedBlockspringOutput, res) {
			res.write(JSON.stringify(processedBlockspringOutput));
			res.end();
		}, response
	);
});

// Start server.
var port = process.env.PORT || 5000;
app.listen(port, function(){
  console.log("NodeJS app is running on port", port);
});
