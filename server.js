// BASE SETUP
// ======================================

// CALL THE MODULES --------------------
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose'); // MongoDB object modeling tool 
var config = require('./config'); // configuration file
var path = require('path'); //  help make path manipulation easier
var request = require('request'); // to make http call

// APP CONFIGURATION ==================
// ====================================
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers',
		'X-Requested-With,content-type, Authorization');
	next();
});

// log all requests to the console
app.use(morgan('dev'));

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API =================
// ====================================

// API ROUTES ------------------------

var apiRoutes = require('./app/routes/imageapi')(app, express);
app.use('/api/image', apiRoutes);

var apiRoutes = require('./app/routes/userapi')(app, express);
app.use('/api/user', apiRoutes);

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function (req, res) {
	res.sendFile(path.join(__dirname + '/public/app/index.html'));
});

// Connect to database
mongoose.connect(config.DATABASE,{useMongoClient: true});

//Event emitted when connection to database is open
mongoose.connection.on("open", function (ref) {
	console.log("Connected to mongo server.");
});

//Event emitted when there is an error in connectiong to database
mongoose.connection.on("error", function (err) {
	console.log("Could not connect to mongo server!");
	return console.log(err);
});
// START THE SERVER
// ====================================
app.listen(3000);
console.log('Magic happens on port ' + config.PORT);