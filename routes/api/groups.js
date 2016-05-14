var keystone = require('keystone');
var User = keystone.list('User');
var moment = require('moment');
var Event = keystone.list('Event');

exports.getAvailabilities = function (req, res) {

	var users = req.body.user;
	var rangeStart = moment(req.body.start).format();
	var rangeEnd = moment().add(14, 'days').format();
	if(req.body.end) rangeEnd = moment(req.body.end).format();
	
};

function _getAvailibilitiesFromUser(amount,duration){
	
}
