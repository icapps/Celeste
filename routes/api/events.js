var keystone = require('keystone');
var Event = keystone.list('Event');
var moment = require('moment');

exports.postEvent = function (req, res) {
	var eventDataFromBody = {
		name:req.body.name,
		meetingRoomId:req.body.meetingRoomId,
		startDate:moment(req.body.startDate).format(),
		endDate:moment(req.body.endDate).format(),
		attendees: req.body.attendees,
		content:req.body.content,
		organizerId:req.body.organizerId,
		context: req.body.context
	};
	
	var newEvent = Event.model(eventDataFromBody);
	newEvent.save(function(err,result){
		if(err){
			console.log('err',err);
			res.status(500);
			res.send(err);
		}
		else {
			console.log('event saved');
			res.json(result);
		}
		
	});
};
