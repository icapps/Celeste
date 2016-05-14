var keystone = require('keystone');
var Room = keystone.list('Room');
var Event = keystone.list('Event');
var _ = require('underscore');

exports.getAll = function (req, res) {
	
	var rangeStart = req.query.start;
	var rangeEnd = req.query.end;

	Room.model.find({}).exec(function (err, rooms) {
		if (err) console.log('error getting rooms', err);
		var promiseArray = [];
		var resultArray = [];

		_.each(rooms, function (room) {
			promiseArray.push(new Promise(function(resolve,reject){
				Event.model.find({meetingRoomId: room.id}).populate('attendees').exec(function (err, events) {
					if (err) console.log('error getting events', err);
					var resultObject = {
						name: room.name,
						events: events
					};
					
					console.log(resultObject);

					resultArray.push(resultObject);
					resolve();
				})
			}))
			
		});
		
		Promise.all(promiseArray).then(function(){
			res.json(resultArray);
		},function(err){
			console.log('error getting rooms and events',err);
		});

	});
};
