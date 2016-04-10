module.exports = {
	validateImage : function(req) {
		if (req.files.file.size <= 0) {
			return 'Image not valid';
		}
		if (!this.validateExtension(req)) {
			return 'Image not valid';
		}
		return 'IMAGE VALIDATED';
	},
	validateExtension : function(req) {
		var ext = req.files.file.name.substring(
				req.files.file.name.lastIndexOf('.') + 1).toLowerCase();
		if (ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "bmp"
				|| ext == "gif") {
			return true;
		}
	}
};
