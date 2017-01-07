var User = require('../models/User'); // load User module
var config = require('../../config'); // load configuration file
var userValidations = require('../validations/userValidations'); // load user validation file
var jwt = require('jsonwebtoken'); //  compact URL-safe means of representing claims to be transferred between two parties
var bodyParser = require('body-parser'); // body parsing middleware for Parsing incoming request bodies in a middleware before our handlers
var async = require('async'); // utility module for working with asynchronous JavaScript
var crypto = require("crypto"); // load module for standard and secure cryptographic algorithms
var nodemailer = require('nodemailer'); // for sending e-mails 
var mongoose = require('mongoose'); //  MongoDB object modeling tool 
var request = require('request'); // to make http call
var superSecret = config.SECRET; // super secret for creating tokens
var logger = require('../logger/logger.js'); // for logging


module.exports = function (app, express) {

	var apiRouter = express.Router();

	// get all the user's uploaded images using the user ID from the request parameter
	apiRouter.get('/getUserImages/:userID',
		function (req, res) {
			logger.debug('userapi /getUserImages started with userID'
				+ req.params.userID);
			Img.find({
				userID: req.params.userID
			}, function (err, imageList) {
				if (err) {
					logger.error(err);
					res.send(err);
				}
				if (!imageList) {
					res.json({
						success: false,
						message: 'No images found for the given user. ',
						returnCode: '1'
					});
				}
				if (imageList) {
					res.json({ success: true, imageList: imageList, returnCode: '0' });
				}
			});
			logger.debug('userapi /getUserImages completed with userID'
				+ req.params.userID);
		});

	// user logins using OAuth Social Login  
	apiRouter.post('/socialLogin', function (req, res) {
		logger.debug('userapi socialLogin post started');
		var user = new User();
		user.name = req.body.name;
		user.email = req.body.email;
		user.username = req.body.username;
		user.imageURL = req.body.imageURL;
		user.save(function (err, objectToInsert) {
			if (err) {
				logger.error(err)
				return res.json({
					success: false,
					message: 'The user\'s details were not saved.',
					returnCode: '1'
				});
			}
			var objectId = objectToInsert._id;
			res.json({
				success: true,
				message: 'The user\'s details were saved',
				returnCode: '0',
				objectId: objectId
			});
		});
		logger.debug('userapi socialLogin post completed');
	});

	// user logins using facebook
	apiRouter.post('/fb', (function (req, res) {
		logger.debug('userapi fb post started');
		var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
		var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
		var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.FB_CLIENT_SECRET,
			redirect_uri: req.body.redirectUri
		};
		var access_token = '';
		// Step 1. Exchange authorization code for access token.
		request.get({ url: accessTokenUrl, qs: params, json: true }, function (err, response, accessToken) {
			if (response.statusCode === 200) {
				getFacebookUserDetails(accessToken.access_token, res);
			}
		});
		logger.debug('userapi fb post completed');
	}));

	// user logins using google
	apiRouter.post('/google', (function (req, res) {
		logger.debug('userapi google post started');
		var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.GOOGLE_CLIENT_SECRET,
			redirect_uri: req.body.redirectUri,
			grant_type: 'authorization_code'
		};
		// Step 1. Exchange authorization code for access token.
		request.post(accessTokenUrl, { json: true, form: params }, function (err, response, token) {
			if (response.statusCode === 200) {
				getGoogleUserDetails(token.access_token, res);
			}
			logger.debug('userapi google post completed');
		})
	}));

	// get user details using access token	
	function getGoogleUserDetails(access_token, res) {
		logger.debug('userapi getGoogleUserDetails started');
		var headers = { Authorization: 'Bearer ' + access_token };
		request.get({ url: 'https://www.googleapis.com/plus/v1/people/me/openIdConnect', headers: headers, json: true }, function (err, response, body) {
			if (body.error) {
				return res.status(500).send({ message: body.error.message });
			}
			if (response.statusCode !== 200) {
				return response.statusCode;
			}
			console.log('body' + JSON.stringify(body));
			saveUser(body, res);
		});
		logger.debug('userapi getGoogleUserDetails completed');
	};

	// get user details using access token	
	function getFacebookUserDetails(access_token, res) {
		logger.debug('userapi getFacebookUserDetails started');
		request.get('https://graph.facebook.com/me?fields=name,email,gender,age_range,picture,location&access_token=' + access_token, function (error, response, body) {
			if (error) {
				logger.error(error);
				return error;
			}
			if (response.statusCode !== 200) {
				return response.statusCode;
			}
			saveUser(JSON.parse(body), res);
		});
		logger.debug('userapi getFacebookUserDetails completed');
	};

	// save the user after fetching the user details from social logins. If the user exists then find the user details
	function saveUser(body, res) {
		logger.debug('userapi saveUser started');
		var user = new User();
		user.name = body.name;
		user.email = body.email;
		user.username = body.email;
		user.imageURL = body.imageURL || body.picture;
		user.save(function (err, objectToInsert) {
			if (err) {
				logger.error(err);
				if (err.code === 11000) {
					findUser(user.email, res);
				}
			} else {
				res.json({
					object: objectToInsert
				});
			}
		});
		logger.debug('userapi saveUser completed');
	};

	// find the user's details
	function findUser(email, res) {
		logger.debug('userapi finduser called with email ' + email);
		User.findOne({
			email: email
		}, function (err, user) {
			if (user) {
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
					success: true,
					message: 'Enjoy your token!',
					returnCode: '0',
					token: token,
					user: user
				});
			} else if (err) {
				logger.error(err);
				res.send(err);
			}
		});
		logger.debug('userapi finduser completed with email ' + email);
	};

	// user logins using social login 
	apiRouter.get('/socialLogin/:email', function (req, res) {
		logger.debug('userapi socialLogin get started with email' + req.params.email);
		User.findOne({
			email: req.params.email
		}, function (err, user) {
			if (user) {
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
				logging.error(err);
				res.send(err);
			}
		});
		logger.debug('userapi socialLogin get completed with email' + req.params.email);
	});

	// user logins using credentials
	apiRouter
		.post(
		'/login',
		function (req, res) {
			logger.debug('userapi login post started');
			var validate = userValidations.validateLogin(req);
			if (validate != 'LOGIN VALIDATED') {
				res.json({
					validate: validate,
					success: false
				});
			}
			//validate = 'LOGIN VALIDATED';
			if (validate === 'LOGIN VALIDATED') {
				User
					.findOne({
						username: req.body.username
					})
					.select('name username password')
					.exec(
					function (err, user) {
						if (err) {
							logger.error(err);
							throw err;
						}
						if (!user) {
							res
								.json({
									success: false,
									message: 'Authentication failed. User not found.',
									returnCode: '1'
								});
						} else if (user) {
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
									success: true,
									message: 'Enjoy your token!',
									returnCode: '0',
									token: token,
									user: user
								});
							}

						}

					});
			}
			logger.debug('userapi login post completed');
		});

	// user registers
	apiRouter
		.post('/register', function (req, res) {
			logger.debug('userapi register post started');
			var validate = userValidations.validateRegister(req);
			if (validate != 'REGISTER VALIDATED') {
				res.json({
					validate: validate,
					success: false
				});
			}
			//validate = 'REGISTER VALIDATED';
			if (validate === 'REGISTER VALIDATED') {
				var user = new User();
				user.name = req.body.name;
				user.username = req.body.username;
				user.password = req.body.password;
				user.email = req.body.username;
				user.imageURL = req.body.imageURL;
				user.confirmed = false;
				user
					.save(function (err) {
						if (err) {
							logger.err(err);
							if (err.code == 11000) {
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
						res.json({
							success: true,
							message: 'User created!',
							returnCode: '0'
						});
					});
				confirmEmail(req, res);
			}
			logger.debug('userapi register post completed');
		});

	// get all the users
	/*
	 * .get(function(req, res) { User.find({}, function(err, users) { if (err)
	 * res.send(err); // return the users res.json(users); }); });
	 */

	// send mail to the users id so that user can confirm the email
	function confirmEmail(req, res) {
		logger.debug('userapi confirmEmail started');
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
								logger.error(err);
								return err;
							}
							done(err, 'done');
						});
				}], function (err) {
					if (err) {
						logger.error(err);
						return next(err);
					}
					;
				});
		logger.debug('userapi confirmEmail completed');
	};

	// Send the token for resetting the password as the user forgot the password and wants to reset it
	apiRouter
		.post(
		'/forgotPassword',
		function (req, res, next) {
			logger.debug('userapi forgotPassword post started');
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
									logger.error(err);
									return console
										.log(err);
								}
								done(
									err,
									'done');
							});
					}], function (err) {
						if (err) {
							logger.error(err);
							return next(err);
						}
					});
			logger.debug('userapi forgotPassword post completed');
		});

	// reset the users password if the reset password token is valid
	apiRouter.post('/resetPassword/:resetPasswordToken', function (req, res,
		next) {
		logger.debug('userapi resetPassword post started');
		User.findOne({
			resetPasswordToken: req.params.resetPasswordToken
		}).select('username').exec(function (err, user) {
			if (err) {
				logger.error(err);
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
				if (req.body.name)
					user.name = req.body.name;
				if (req.body.username)
					user.username = req.body.username;
				if (req.body.password)
					user.password = req.body.password;
				user.save(function (err) {
					if (err) {
						logger.error(err);
						res.send(err);
					}
					res.json({
						success: true,
						message: 'Reset password token validated!',
						returnCode: '0'
					});
				});
			}
		});
		logger.debug('userapi resetPassword post completed');
	});

	// confirm user's email if the confirm email token is valid
	apiRouter
		.post('/confirmEmail/:confirmEmailToken',
		function (req, res, next) {
			logger.debug('userapi confirmEmail post started');
			User.findOne({
				confirmEmailToken: req.params.confirmEmailToken
			}).select('username').exec(function (err, user) {
				if (err) {
					logger.error(err);
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
					user.save(function (err) {
						if (err) {
							logger.error(err);
							res.send(err);
						}
						res.json({
							success: true,
							message: 'Email token validated!',
							returnCode: '0'
						});
					});

				}
			});
			logger.debug('userapi confirmEmail post started');
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
	//  get the user's details using the userID
	apiRouter.get('/:user_id', function (req, res) {
		logger.debug('userapi get started');
		if (req.params.user_id !== 'undefined') {
			User.findById(req.params.user_id, function (err, user) {
				if (err) {
					logger.error(err);
					res.send(err);
				}
				res.json(user);
			});
			logger.debug('userapi get started');
		}
	});

	// update the user with this id
	apiRouter.put('/', function (req, res) {
		logger.debug('userapi put started');
		User.findById(req.params.user_id, function (err, user) {
			if (err) {
				logger.error(err);
				res.send(err);
			}
			if (req.body.name)
				user.name = req.body.name;
			if (req.body.username)
				user.username = req.body.username;
			if (req.body.password)
				user.password = req.body.password;
			user.save(function (err) {
				if (err)
					res.send(err);
				res.json({
					success: true,
					message: 'Password changed',
					returnCode: '0'
				});
			});
		});
		logger.debug('userapi put completed');
	});

	// update the user's points
	apiRouter.put('/updatePoints/:id', function (req, res) {
		logger.debug('userapi updatePoints put started with id' + req.params.id);
		if (req.params.id !== 'undefined') {
			User.findById(req.params.id, function (err, user) {
				if (err) {
					logger.error(err);
				}
				else {
					user.points = user.points + 1;
					user.save(function (err) {
						if (err)
							logger.error(err);
						res.json({
							success: true,
							message: 'Points updated. ',
							returnCode: '0'
						});
					});
				}
			});
		}
		logger.debug('userapi put completed with id' + req.params.id);
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