var Img = require('../models/Image'); // load User module
var config = require('../../config'); // load configuration file
var imageValidations = require('../validations/imageValidations'); // load image validation file
var bodyParser = require('body-parser'); // body parsing middleware for Parsing incoming request bodies in a middleware before our handlers
var fs = require("fs"); // to make file opertaion apis simple
var multipart = require('connect-multiparty'); // multipart parsing middleware for connect using multiparty
var multipartMiddleware = multipart(); // multipart parsing middleware for connect using multiparty
var jwt = require('jsonwebtoken'); // compact URL-safe means of representing claims to be transferred between two parties
var mkdirp = require('mkdirp'); // to create directories
var crypto = require("crypto"); // load module for standard and secure cryptographic algorithms
var gm = require('gm'); // GraphicsMagick and ImageMagick for image manipulations
logger = require('../logger/logger.js'); // for logging

module.exports = function (app, express) {

	var apiRouter = express.Router();

	apiRouter.route('/').post(
		multipartMiddleware,
		function (req, res) {

			logger.debug('imageapi post started');
			var validate = imageValidations.validateImage(req);
			if (validate != 'IMAGE VALIDATED') {
				res.json(validate);
			}
			if (validate === 'IMAGE VALIDATED') {
				var file = req.files;
				var image = new Img();
				image.name = file.file.originalFilename;
				image.userId = req.body.userId || 'undefined';

				var newPath = './public/uploads/';
				var imagePath = newPath
					+ crypto.randomBytes(12).toString('hex')
					+ file.file.name;
				var newThPath = './public/tn/';
				var imageThPath = newThPath
					+ crypto.randomBytes(12).toString('hex')
					+ file.file.name;
				mkdirp(newPath, function (err) {
					if (err)
						console.error(err)
				});
				mkdirp(newThPath, function (err) {
					if (err)
						console.error(err)
				});

				var watermarkText = req.body.watermarkText;
				console.log('watermarkText' + watermarkText);
				console.log(typeof watermarkText === 'undefined');
				if (typeof watermarkText === 'undefined') {
					/*fs.readFile(file.file.path, function (err, data) {
						fs.writeFile(imagePath, data, function (err) {
							if (err) {
								throw err;
							}
						});
					});*/

					gm(file.file.path).draw(['image Over 15,15,0,0 ' + __dirname + '/logo.png'])
						.write(imagePath, function (e) {
							console.log(e || 'done'); // What would you like to do here?
						});
					gm(file.file.path).resize(200, 200).autoOrient().write(
						imageThPath, function (err) {
							if (err) {
								console.log('error: ' + err);
							}
							else { console.log('Working without watermarkText'); }
						});
					var ip = req.ip;
					console.log('ip:: ' + ip);
					image.img = imagePath;
					image.imgtn = imageThPath;
					logger.debug('IMAGE' + JSON.stringify(image));
					image.save(function (err, objectToInsert) {
						if (err) {
							logger.debug('IMAGE ERRORRRR POST');
							console.log(err);
							return res.json({
								success: false,
								message: 'Image not saved. ',
								returnCode: '1'
							});
						}
						var objectId = objectToInsert._id;
						logger.debug('IMAGE DONEE POST' + objectId);
						res.json({

							success: true,
							message: 'Image saved. ',
							returnCode: '2',
							imageId: objectId

						});
					});
				} else {
					console.log('watermarkText::' + watermarkText);
					gm(file.file.path).drawText(0, 0, watermarkText, "Center").resize(200, 200).autoOrient().write(
						imageThPath, function (err) {
							if (err) {
								console.log('error: ' + err);
							}
							else { console.log('Working with watermark '); }
						});
					gm(file.file.path).drawText(0, 0, watermarkText, "Center").autoOrient().write(
						imagePath, function (err) {
							if (err) {
								console.log('error: ' + err);
							}
							else { console.log('Working with watermark '); }
						});;
					image.img = imagePath;
					image.imgtn = imageThPath;
					logger.debug('IMAGE' + JSON.stringify(image));
					image.save(function (err, objectToInsert) {
						if (err) {
							logger.debug('IMAGE ERRORRRR POST');
							console.log(err);
							return res.json({
								success: false,
								message: 'Image not saved. ',
								returnCode: '1'
							});
						}
						var objectId = objectToInsert._id;
						logger.debug('IMAGE DONEE POST' + objectId);
						res.json({

							success: true,
							message: 'Image saved. ',
							returnCode: '2',
							imageId: objectId

						});
					});
				}
			}
			logger.debug('imageapi post ended');
		})

	apiRouter.route('/:id').get(function (req, res) {
		logger.debug('imageapi get started with id' + req.params.id);
		Img.findById(req.params.id, function (err, image) {
			if (err)
				res.send(err);
			if (!image) {
				res.json({
					success: false,
					message: 'No image found. ',
					returnCode: '1'
				});
			}
			if (image) {
				res.json(image);
			}
		});
		logger.debug('imageapi get ended with id' + req.params.id);
	})
	apiRouter.route('/:id').put(function (req, res) {
		logger.debug('imageapi put started with id' + req.params.id);
		Img.findById(req.params.id, function (err, image) {
			if (err)
				res.send(err);
			image.points = image.points + 1;
			image.save(function (err) {
				if (err)
					res.send(err);
				res.json({
					success: true,
					message: 'Points updated. ',
					returnCode: '1'
				});
			});

		});
		logger.debug('imageapi put ended with id' + req.params.id);
	})
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
	return apiRouter;
};