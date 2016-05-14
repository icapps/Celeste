var keystone = require('keystone');
var User = keystone.list('User');
var moment = require('moment');
var Event = keystone.list('Event');
var apiResponse = require('../../services/apiResponseService');
var _ = require('underscore');
var lodash = require('lodash');

exports.getAvailabilities = function (req, res) {

	//var users = req.body.users;
	var duration = req.body.duration;
	var rangeStart = moment(req.body.start).format();
	var rangeEnd = moment().add(14, 'days').format();
	if (req.body.end) rangeEnd = moment(req.body.end).format();

	var testUser = {
		id: '57371f8cb57ac0d546e2c5d5',
		name: 'andybats'
	};

	var testUser2 = {
		id: '57371f8cb57ac0d546e2c609',
		name: 'maarten.anckaert'
	};
	var users = [];
	users.push(testUser, testUser2);
	duration = 2;

	var availabilitiesArray = [];

	//Get the first 10 events/availabilities for each user
	_.forEach(users, function (user) {
		availabilitiesArray.push(new Promise(function (resolve, reject) {
			_getAvailibilitiesFromUser(10, duration, user).then(function (events) {
				resolve(events);
			})
		}))

	});

	Promise.all(availabilitiesArray).then(function (availabilities) {
		var trueAvailabilities = [];

		_.forEach(availabilities, function (available) {
			trueAvailabilities.push(_.filter(available, function (o) {
				return o.suitable !== false;
			}))
		});

		_determineAvailibilityAll(trueAvailabilities);

	});


};

//get the Availibilities per user
function _getAvailibilitiesFromUser(amount, duration, user) {
	//Get the first 10 events for that 
	return new Promise(function (resolve, reject) {
		Event.model.find({attendees: user.id}).limit(amount).sort('startDate').exec(function (err, events) {
			resolve(_calculateAvailibilities(events, duration));
		})
	})

}

//Calculate the availibilities trough the events
function _calculateAvailibilities(events, duration) {
	var availibilityArray = [];
	for (var i = 0; i < events.length; i++) {
		var startDate = null;
		if (i !== events.length - 1) startDate = events[i + 1].startDate;
		availibilityArray.push(_calculateGap(events[i].endDate, startDate, duration));
	}

	return availibilityArray;
}

//Calculate availibility
function _calculateGap(a, b, duration) {

	var availibility = {};
	if (b !== null) {
		availibility.startTime = a;
		availibility.endTime = b;

		if (_sameDay(a, b)) {
			availibility.timeBetween = (b - a) / 1000 / 60 / 60;
		} else {
			var hoursTillDayEnds = _getHoursTillEndOfDay(a);
			var nextDays = _daysFromNow(a, b);
			availibility.timeBetween = hoursTillDayEnds + nextDays * 8 + _getHoursTillMeeting(b);
		}

		if (availibility.timeBetween < duration)availibility.suitable = false;
	} else {
		availibility.startTime = a;
		availibility.endTime = 'N/A'
	}

	return availibility;
}

//Check if two dates are on the same day
function _sameDay(a, b) {
	return a.toDateString() === b.toDateString();
}

//Gets the amount of hours till the end of the day
function _getHoursTillEndOfDay(datetime) {
	var endOfLastMeeting = new Date(datetime);
	//We need to use a temp timestamp because 'setHours' changes our date object
	var tempTimestamp = new Date(datetime);
	var endOfDay = tempTimestamp.setHours(17, 0, 0, 0);
	return (endOfDay - endOfLastMeeting) / 1000 / 60 / 60;
}

//Gets the amount of Hours from the start of the day till the meeting
function _getHoursTillMeeting(datetime) {
	var beginningOfMeeting = new Date(datetime);
	//We need to use a temp timestamp because 'setHours' changes our date object
	var tempTimestamp = new Date(datetime);
	var beginningOfDay = tempTimestamp.setHours(9, 0, 0, 0);
	return (beginningOfMeeting - beginningOfDay) / 1000 / 60 / 60;
}

//Gets the days that are between 
function _daysFromNow(datetime, nextMeetingDate) {
	var date1 = datetime;
	var date2 = new Date(nextMeetingDate);
	var timeDiff = Math.abs(date2.getTime() - date1.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

	//Don't count weekend days
	var count = 0;
	var date = moment(datetime);
	while (diffDays > 0) {
		date = date.add(1, 'days');
		// decrease "days" only if it's a weekday.
		if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
			diffDays -= 1;
			count++;
		}
	}

	return count - 1;
}

//You have an array of availibilities, now determine the possibilities
//An intersection gets checked every 30 mins.
function _determineAvailibilityAll(availibilities) {
	var intersections = [];

	for(var i = 0;i<availibilities.length;i++){
		for (var j=0;i<availibilities[i].length;j++){
			var startIntersection = availibilities[i][j].startTime.getTime()/1000;
			
			
		}
	}
	
	
	
	//for (var i = 1; i < availibilities.length; i++) {
	//	if ((i + 1) <= availibilities.length) {
	//		intersections[i] = lodash.intersectionWith(startIntersection, availibilities[i], function(x, y) {
	//			return x.startTime === y.startTime;
	//		})
	//	}
	//}
	console.log(intersections);
}


