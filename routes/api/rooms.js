var keystone = require('keystone');
var Room = keystone.list('Room');
var Event = keystone.list('Event');
var _ = require('lodash');
var moment = require('moment');
var apiResponse = require('../../services/apiResponseService');

exports.getAll = function (req, res) {
	
	//example:
	//api/rooms?events=true&start=somedate&end=somedate
	//Gets all rooms with the events during that timeperiod
	var rangeStart = moment(7, "HH").format();
	var rangeEnd = moment(18, "HH").format();
	
	
	if(req.query.start) rangeStart = moment(req.query.start).format();
	if(req.query.end) rangeEnd = moment(req.query.end).format();
	var includeEvents = !!req.query.events;
	
	Room.model.find().exec(function (err, rooms) {
		if (err) console.log('error getting rooms', err);
		var promiseArray = [];
		var resultArray = [];
		
		if(includeEvents && rangeStart !== 'Invalid date' && rangeEnd !== 'Invalid date' && !err){
			_.forEach(rooms, function (room) {
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
				apiResponse.sendResponse(req,res,null,null,resultArray);
			},function(err){
				apiResponse.sendResponse(req,res,err,'error getting rooms and events',null);
			});
		} else {
			apiResponse.sendResponse(req,res,err,'error getting rooms',rooms);
		}

		

	});
};
