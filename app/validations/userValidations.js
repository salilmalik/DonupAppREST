module.exports = {
	validateRegister : function(req) {
		if (req.body.username.length == 0 || req.body.username.length >= 320
				|| this.validateEmail(req)) {
			return 'Email is not valid';
		}
		if (req.body.password != req.body.confirmPassword) {
			return 'Passwords do not match';
		}
		return 'REGISTER VALIDATED';
	},
	validateLogin : function(req) {
		if (req.body.username.length == 0 || req.body.username.length >= 320
				|| this.validateEmail(req)) {
			return 'Email is not valid';
		}
		return 'LOGIN VALIDATED';
	},
	validateEmail : function(req) {
		var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
		if (!reg.test(req.body.username)) {
			return (true);
		}
		return (false);
	}
};
