var keystone = require('keystone');
var User = keystone.list('User');
var apiResponse = require('../../services/apiResponseService');

exports.getAll = function (req, res) {
	User.model.find().where('slack_id').ne(null).exec(function (err, users) {
		apiResponse.sendResponse(req,res,err,'error in users',users);
	});
};

exports.getDetails =function(req,res){
	if(req.query.userId){
		var userId = req.query.userId;
		User.model.find({_id:userId}).exec(function (err, user) {
			apiResponse.sendResponse(req,res,err,'error in user details',user);
		});	
	}
};
