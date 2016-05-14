var keystone = require('keystone');
var Room = keystone.list('Room');
var Event = keystone.list('Event');
var _ = require('underscore');
var moment = require('moment');

exports.getAll = function (req, res) {
	
	//example:
	//api/rooms?events=true&start=somedate&end=somedate
	//Gets all rooms with the events during that timeperiod
	
	var rangeStart = moment(req.query.start).format();
	var rangeEnd = moment(req.query.end).format();
	var includeEvents = req.query.events;
	
	Room.model.find({}).exec(function (err, rooms) {
		if (err) console.log('error getting rooms', err);
		var promiseArray = [];
		var resultArray = [];
		
		if(includeEvents == 'true' && rangeStart != 'Invalid date' && rangeEnd != 'Invalid date'){
			_.each(rooms, function (room) {
				promiseArray.push(new Promise(function(resolve,reject){
					Event.model.find({meetingRoomId: room.id,startDate:{$gte:rangeStart,$lt:rangeEnd}}).populate('attendees').exec(function (err, events) {
						if (err) console.log('error getting events', err);
						var resultObject = {
							name: room.name,
							events: events
						};
						
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
		} else {
			res.json(rooms);
		}

		

	});
};
