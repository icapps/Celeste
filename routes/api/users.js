var keystone = require('keystone');
var User = keystone.list('User');

exports.getAll = function (req, res) {
	
	User.model.find({}).exec(function (err, users) {
		if (err)
			console.log('error getting user',err);
		if (!users)
			console.log('no users found');
		
		res.json(users);


	});
};
