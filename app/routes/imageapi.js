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

module.exports = function(app, express) {

	var apiRouter = express.Router();

	apiRouter.route('/')
	// save the image to filesystem and links to db.
	.post(
			multipartMiddleware,
			function(req, res) {
				console.log("POST CALLED");
				var validate = imageValidations.validateImage(req);
				if (validate != 'IMAGE VALIDATED') {
					console.log("OUT");
					res.json(validate);
				}
				if (validate === 'IMAGE VALIDATED') {
					var file = req.files;
					console.log('file' + JSON.stringify(file));
					console.log('body' + JSON.stringify(req.body));
					var image = new Img();
									console.log('username'+req.body.userEmail);
					image.name = file.file.originalFilename;
					
					image.userEmail = req.body.userEmail||'undefined';
						console.log('image.userEmail'+image.userEmail);
					
					var newPath = './public/uploads/';
					var imagePath = newPath
							+ crypto.randomBytes(12).toString('hex')
							+ file.file.name;
					var newThPath = './public/tn/';
					var imageThPath = newThPath
							+ crypto.randomBytes(12).toString('hex')
							+ file.file.name;
					mkdirp(newPath, function(err) {
						if (err)
							console.error(err)
					});
					mkdirp(newThPath, function(err) {
						if (err)
							console.error(err)
					});
					fs.readFile(file.file.path, function(err, data) {
						fs.writeFile(imagePath, data, function(err) {
							if (err) {
								throw err;
							}
						});
					});
					gm(file.file.path).resize(200, 200).autoOrient().write(
							imageThPath, function(err) {
								if (err)
									console.log(err);
							});
					image.img = imagePath;
					image.imgtn = imageThPath;
					console.log('imageFFFFFFFFFFFFFFFFFF' + JSON.stringify(image));
					image.save(function(err, objectToInsert) {
						if (err) {
							console.log(err);
							return res.json({
								success : false,
								message : 'Image not saved. ',
								returnCode : '1'
							});
						}
						var objectId = objectToInsert._id;
						res.json({
							success : true,
							message : 'Image saved. ',
							returnCode : '2',
							imageId:objectId
							
						});
					});
				}
			})

	apiRouter.route('/:id')
	// get the image with that id
	.get(function(req, res) {
		console.log('get called with params '+req.params.id)
		Img.findById(req.params.id, function(err, image) {
			if (err)
				res.send(err);
			if (!image) {
				res.json({
					success : false,
					message : 'No image found. ',
					returnCode : '1'
				});
			}
			if (image) {
				res.json(image);
			}
		});
	})
	apiRouter.route('/:id')
	// update the points
	.put(function(req, res) {
		Img.findById(req.params.id, function(err, image) {
			if (err)
				res.send(err);
			image.points = image.points + 1;
			// save the updated image info
			image.save(function(err) {
				if (err)
					res.send(err);
				res.json({
					success : true,
					message : 'Points updated. ',
					returnCode : '1'
				});
			});

		});
	})
	apiRouter.route('/getUserImages/:userId')
	// get the image with that id for a user
	.get(function(req, res) {
		Img.find({
			"userID" : req.params.userId
		}, function(err, imageList) {
			if (err)
				res.send(err);
			if (!imageList) {
				res.json({
					success : false,
					message : 'No images found for the given user. ',
					returnCode : '1'
				});
			}
			if (imageList) {
				res.json(imageList);
			}
		});
	})
	return apiRouter;
};