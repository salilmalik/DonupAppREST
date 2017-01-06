module.exports = {
	// Checks whether image size is more than 0 and extension is valid
	validateImage: function (req) {
		if (req.files.file.size <= 0) {
			return 'Image not valid';
		}
		if (!this.validateExtension(req)) {
			return 'Image not valid';
		}
		return 'IMAGE VALIDATED';
	},
	// Checks whether extension is valid
	validateExtension: function (req) {
		var ext = req.files.file.originalFilename.substring(
			req.files.file.originalFilename.lastIndexOf('.') + 1).toLowerCase();
		if (ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "bmp"
			|| ext == "gif") {
			return true;
		}
	}
};
