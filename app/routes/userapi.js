var User = require('../models/User');
var config = require('../../config');
var userValidations = require('../validations/userValidations');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var async = require('async');
var crypto = require("crypto");
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var request = require('request');
// super secret for creating tokens
var superSecret = config.secret;
logger = require('../logger/logger.js');

module.exports = function (app, express) {

	var apiRouter = express.Router();
	apiRouter.route('/getUserImages/:userID').get(
		function (req, res) {
			logger.debug('imageapi /getUserImages started with userID'
				+ req.params.userID);
			Img.find({
				userID: req.params.userID
			}, function (err, imageList) {
				if (err)
					res.send(err);
				if (!imageList) {
					res.json({
						success: false,
						message: 'No images found for the given user. ',
						returnCode: '1'
					});
				}
				if (imageList) {
					res.json(imageList);
				}
			});
			logger.debug('imageapi /getUserImages ended with userID'
				+ req.params.userID);
		})
	apiRouter.post('/socialLogin', function (req, res) {
		logger.debug('userapi socialLogin post started');
		var user = new User();
		user.name = req.body.name;
		user.email = req.body.email;
		user.username = req.body.username;
		user.imageURL = req.body.imageURL;
		user.save(function (err, objectToInsert) {
			if (err) {
				console.log(err);
				return res.json({
					success: false,
					message: 'user not saved. ',
					returnCode: '1'
				});
			}
			var objectId = objectToInsert._id;
			res.json({
				success: true,
				message: 'user saved. ',
				returnCode: '2',
				objectId: objectId
			});
		});
		logger.debug('userapi socialLogin post ended');
	});
	apiRouter.route('/fb').post(function (req, res) {
		logger.debug('fb called');
		var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
		var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
		var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: 'dfd8e0d6d38bad445ab84313dc8c7c18',
			redirect_uri: req.body.redirectUri
		};
		var access_token = '';
		// Step 1. Exchange authorization code for access token.
		request.get({ url: accessTokenUrl, qs: params, json: true }, function (err, response, accessToken) {
			console.log('accessToken' + JSON.stringify(accessToken));
			if (response.statusCode === 200) {
				console.log('1. response.statusCode' + response.statusCode);
				getFacebookUserDetails(accessToken.access_token, res);
			}
		});

	});
	function getFacebookUserDetails(access_token, res) {
		console.log('getFacebookUserDetails::::::');
		request.get('https://graph.facebook.com/me?fields=name,email,gender,age_range,picture,location&access_token=' + access_token, function (error, response, body) {
			//Check for error
			if (error) {
				return console.log('Error:', error);
			}
			console.log('2. response.statusCode' + response.statusCode);
			if (response.statusCode !== 200) {
				return console.log('Invalid Status Code Returned:', response.statusCode);
			}
			console.log('body' + JSON.stringify(JSON.parse(body)));
			saveUser(JSON.parse(body), res);
		});
	}
	function saveUser(body, res) {
		console.log('saveUser::::::');
		var user = new User();
		user.name = body.name;
		user.email = body.email;
		user.username = body.email;
		user.imageURL = body.imageURL;
		console.log('::::::::::::::user:' + JSON.stringify(user));
		user.save(function (err, objectToInsert) {
			if (err) {
				console.log(err);
				if (err.code === 11000) {
					console.log('call findUser(user.email);' + user.email);
					findUser(user.email, res);
				}
			} else {
				console.log('objectToInsert' + JSON.stringify(objectToInsert));
				res.json({
					object: objectToInsert
				});
			}
		});

	}
	function findUser(email, res) {
		console.log('finduser called with email ' + email);
		User.findOne({
			email: email
		}, function (err, user) {
			console.log('user::::' + user);
			if (user) {
				console.log('mil gaya' + JSON.stringify(user) + user._id);
				user_id = user._id;
				var token = jwt
					.sign(
					{
						name: user.name,
						username: user.username
					},
					superSecret,
					{
						expiresIn: 1440
					});
				res.send({
					user_id: user_id,
					token: token
				});
			} else if (err) {
				console.log('err' + err);
			}
		});
		console.log('asdsaddasdsa');
	}
	apiRouter.route('/socialLogin/:email').get(function (req, res) {
		logger.debug('userapi socialLogin get with parameter email started');
		User.findOne({
			email: req.params.email
		}, function (err, user) {
			if (user) {
				console.log('mil gaya' + JSON.stringify(user) + user._id);
				user_id = user._id;
				var token = jwt
					.sign(
					{
						name: user.name,
						username: user.username
					},
					superSecret,
					{
						expiresIn: 1440
					});
				res.json({
					user_id: user_id,
					token: token
				});
			} else if (err) {
				console.log('err' + err);
			}
		});
		logger.debug('userapi socialLogin get with parameter email ended');
	});
	apiRouter
		.post(
		'/login',
		function (req, res) {
			console.log('login called' + req.body.username);
			// Validating the user information
			var validate = userValidations.validateLogin(req);
			console.log("validate: " + validate);
			/*
			 * if (validate != 'LOGIN VALIDATED') {
			 * console.log("OUT"); res.json(validate); }
			 */
			validate = 'LOGIN VALIDATED';
			if (validate === 'LOGIN VALIDATED') {
				User
					.findOne({
						username: req.body.username
					})
					.select('name username password')
					.exec(
					function (err, user) {
						if (err)
							throw err;
						// No user with that username
						// was found
						if (!user) {
							console.log('no user');
							res
								.json({
									success: false,
									message: 'Authentication failed. User not found.',
									returnCode: '1'
								});
						} else if (user) {

							console.log('user');
							// check if password matches
							var validPassword = user
								.comparePassword(req.body.password);
							if (!validPassword) {
								res
									.json({
										success: false,
										message: 'Authentication failed. Wrong password.',
										returnCode: '2'
									});
							} else {
								console.log('token');
								// if user is found and
								// password is right
								// then create a token
								var token = jwt
									.sign(
									{
										name: user.name,
										username: user.username
									},
									superSecret,
									{
										// expires
										// in
										// 24
										// hours
										expiresIn: 1440
									});

								// return the
								// information including
								// token as JSON
								res
									.json({
										success: true,
										message: 'Enjoy your token!',
										returnCode: '3',
										token: token,
										user: user
									});
							}

						}

					});
			}
		});

	apiRouter
		.route('/')
		// Create a user
		.post(
		function (req, res) {
			// Validating the user information
			var validate = userValidations.validateRegister(req);
			console.log("VALIDATION" + validate);
			/*
			 * if (validate != 'REGISTER VALIDATED') {
			 * console.log("OUT"); res.json(validate); }
			 */
			validate = 'REGISTER VALIDATED';
			if (validate === 'REGISTER VALIDATED') {
				var user = new User(); // create a new instance of
				// the User
				// model
				user.name = req.body.name; // set the users name
				user.username = req.body.username; // set the users
				// username
				user.password = req.body.password; // set the users
				// password
				user.email = req.body.username;
				user.imageURL = req.body.imageURL;
				user.confirmed = false;
				console.log(JSON.stringify('user' + user));
				user
					.save(function (err) {
						if (err) {
							// duplicate entry
							if (err.code == 11000) {
								console.log('ERROR' + 11000);
								return res
									.json({
										success: false,
										message: 'A user with that username already exists. ',
										returnCode: '1'
									});
							} else {

								return res.send(err);
							}

						}

						// return a message
						res.json({
							success: true,
							message: 'User created!',
							returnCode: '2'
						});
					});
				confirmEmail(req, res);
			}
		})

	// get all the users
	/*
	 * .get(function(req, res) { User.find({}, function(err, users) { if (err)
	 * res.send(err); // return the users res.json(users); }); });
	 */

	function confirmEmail(req, res) {
		async
			.waterfall(
			[
				function (done) {
					crypto.randomBytes(20, function (err, buf) {
						var token = buf.toString('hex');
						done(err, token);
					});
				},
				function (token, done) {
					User
						.findOne(
						{
							username: req.body.username
						},
						function (err, user) {
							if (!user) {
								res
									.json({
										success: false,
										message: 'No user with given username found.',
										returnCode: '1'
									});
							}
							user.confirmEmailToken = token;
							user
								.save(function (
									err) {
									done(
										err,
										token,
										user);
								});
						});
				},
				function (token, user, done) {
					var smtpTransport = nodemailer
						.createTransport({
							service: 'Yahoo',
							auth: {
								user: 'donupapp@yahoo.com',
								pass: 'kuchbhi77'
							}
						});
					var mailOptions = {
						to: req.body.username,
						from: 'donupapp@yahoo.com',
						subject: 'Donup Confirm Email',
						text: 'Please confirm your Email address.\n\n'
						+ 'Please click on the following link, or paste this into your browser to complete the registeration process:\n\n'
						+ 'http://'
						+ req.headers.host
						+ '/confirmEmail/'
						+ token
						+ '\n\n'
						+ 'If you did not request this, please ignore this email..\n'
					};
					smtpTransport.sendMail(mailOptions,
						function (err) {
							if (err) {
								return console.log(err);
							}
							done(err, 'done');
						});
				}], function (err) {
					if (err) {
						console.log(err);
						return next(err);
					}
					;
				});
	}
	;
	apiRouter
		.post(
		'/forgotPassword',
		function (req, res, next) {
			async
				.waterfall(
				[
					function (done) {
						crypto
							.randomBytes(
							20,
							function (
								err,
								buf) {
								var token = buf
									.toString('hex');
								done(
									err,
									token);
							});
					},
					function (token, done) {
						User
							.findOne(
							{
								username: req.body.username
							},
							function (
								err,
								user) {
								if (!user) {
									res
										.json({
											success: false,
											message: 'No user with given username found.',
											returnCode: '1'
										});
								}
								user.resetPasswordToken = token;
								user.resetPasswordExpires = Date
									.now() + 3600000; // 1
								// hour
								user
									.save(function (
										err) {
										done(
											err,
											token,
											user);
									});
							});
					},
					function (token, user, done) {
						var smtpTransport = nodemailer
							.createTransport({
								service: 'Yahoo',
								auth: {
									user: 'donupapp@yahoo.com',
									pass: 'kuchbhi77'
								}
							});
						var mailOptions = {
							to: req.body.username,
							from: 'donupapp@yahoo.com',
							subject: 'Donup Password Reset',
							text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
							+ 'Please click on the following link, or paste this into your browser to complete the process:\n\n'
							+ 'http://'
							+ req.headers.host
							+ '/resetPassword/'
							+ token
							+ '\n\n'
							+ 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
						};
						smtpTransport
							.sendMail(
							mailOptions,
							function (
								err) {
								if (err) {
									return console
										.log(err);
								}
								done(
									err,
									'done');
							});
					}], function (err) {
						if (err) {
							console.log(err);
							return next(err);
						}
					});
		});

	apiRouter.post('/resetPassword/:resetPasswordToken', function (req, res,
		next) {
		User.findOne({
			resetPasswordToken: req.params.resetPasswordToken
		}).select('username').exec(function (err, user) {
			if (err) {
				console.log("error :" + err);
				res.send(err);
			}
			if (!user) {
				res.json({
					success: false,
					message: 'Not a valid link.',
					returnCode: '1'
				})
			}
			if (user) {
				console.log(user);
				console.log(req.body);
				if (req.body.name)
					user.name = req.body.name;
				if (req.body.username)
					user.username = req.body.username;
				if (req.body.password)
					user.password = req.body.password;

				// save the user
				user.save(function (err) {
					if (err)
						res.send(err);

					// return a message
					res.json({
						success: true,
						message: 'Reset password token validated!',
						returnCode: '2'
					});
				});
			}
		});
	});

	apiRouter
		.post('/confirmEmail/:confirmEmailToken',
		function (req, res, next) {
			console.log("confirmEmailToken"
				+ req.params.confirmEmailToken);
			User.findOne({
				confirmEmailToken: req.params.confirmEmailToken
			}).select('username').exec(function (err, user) {

				if (err) {
					console.log("error :" + err);
					res.send(err);
				}
				if (!user) {
					res.json({
						success: false,
						message: 'Not a valid link.',
						returnCode: '1'
					})
				}
				if (user) {

					user.confirmed = true;

					// save the user
					user.save(function (err) {
						if (err)
							res.send(err);

						// return a message
						res.json({
							success: true,
							message: 'Email token validated!',
							returnCode: '2'
						});
					});

				}
			});
		});

	/*
	 * // route middleware to verify a token apiRouter.use(function(req, res,
	 * next) { // check header or url parameters or post parameters for token
	 * var token = req.body.token || req.query.token ||
	 * req.headers['x-access-token'];
	 *  // decode token if (token) {
	 *  // verifies secret and checks exp jwt.verify(token, superSecret,
	 * function(err, decoded) {
	 * 
	 * if (err) { res.status(403).send({ success : false, message : 'Failed to
	 * authenticate token.', returnCode : '1' }); } else { // if everything is
	 * good, save to request for use in other // routes req.decoded = decoded;
	 * 
	 * next(); // make sure we go to the next routes and don't stop // here }
	 * });
	 *  } else { // if there is no token // return an HTTP response of 403
	 * (access forbidden) and an error // message res.status(403).send({ success :
	 * false, message : 'No token provided.', returnCode : '2' });
	 *  } });
	 */

	apiRouter.route('/:user_id')
		// get the user with that id
		.get(function (req, res) {
			User.findById(req.params.user_id, function (err, user) {
				if (err)
					res.send(err);

				// return that user
				res.json(user);
			});
		})

		// update the user with this id
		.put(function (req, res) {
			User.findById(req.params.user_id, function (err, user) {

				if (err)
					res.send(err);

				// set the new user information if it exists in the request
				if (req.body.name)
					user.name = req.body.name;
				if (req.body.username)
					user.username = req.body.username;
				if (req.body.password)
					user.password = req.body.password;

				// save the user
				user.save(function (err) {
					if (err)
						res.send(err);

					// return a message
					res.json({
						success: true,
						message: 'Password changed',
						returnCode: '1'
					});
				});

			});
		});
	apiRouter.route('/updatePoints/:id').put(function (req, res) {
		logger.debug('userapi put started with id' + req.params.id)
		if (req.params.id !== 'undefined') {
			User.findById(req.params.id, function (err, user) {
				if (err)
					console.log('error   ' + err);
				if (!user == 'undefined') {
					user.points = user.points + 1;
					user.save(function (err) {
						if (err)
							console.log('2st error' + err);
						res.json({
							success: true,
							message: 'Points updated. ',
							returnCode: '1'
						});
					});
				}
			});
		}
		logger.debug('userapi put ended with id' + req.params.id);
	});
	/*
	 * // delete the user with this id .delete(function(req, res) {
	 * User.remove({ _id: req.params.user_id }, function(err, user) { if (err)
	 * res.send(err);
	 * 
	 * res.json({ message: 'Successfully deleted' }); }); // api endpoint to get
	 * user information apiRouter.get('/me', function(req, res) {
	 * res.send(req.decoded); }); });
	 */
	return apiRouter;
};