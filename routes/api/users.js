var keystone = require('keystone');
var User = keystone.list('User');
var apiResponse = require('../../services/apiResponseService');

exports.getAll = function (req, res) {
	
	User.model.find().exec(function (err, users) {
		apiResponse.sendResponse(req,res,err,'error in users',users);
	});
};
