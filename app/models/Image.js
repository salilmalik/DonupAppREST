var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// images schema
var ImageSchema = new Schema({
	userEmail: String,
	name : String,
	img: String,
	imgtn: String,
	points : { type: Number, default: 0 }
});

module.exports = mongoose.model('Image', ImageSchema);