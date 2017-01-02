var Img = require('../models/Image');
var config = require('../../config');
var bodyParser = require('body-parser');
var imageValidations = require('../validations/imageValidations');
var fs = require("fs");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var jwt = require('jsonwebtoken');
var mkdirp = require('mkdirp');
var crypto = require("crypto");
var gm = require('gm');
logger = require('../logger/logger.js');

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
				fs.readFile(file.file.path, function (err, data) {
					fs.writeFile(imagePath, data, function (err) {
						if (err) {
							throw err;
						}
					});
				});
				var watermarkText = req.body.watermarkText;
				if (typeof watermarkText === 'undefined') {
					gm(file.file.path).resize(200, 200).autoOrient().write(
						imageThPath, function (err) {
							if (err) {
								console.log('error: ' + err);
							}
							else { console.log('Working '); }
						});
					gm(imagePath)
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
					gm(file.file.path).drawText(0, 0, watermarkText, "NorthWest").resize(200, 200).autoOrient().write(
						imageThPath, function (err) {
							if (err) {
								console.log('error: ' + err);
							}
							else { console.log('Working '); }
						});
					gm(imagePath).drawText(0, 0, watermarkText, "NorthWest");
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