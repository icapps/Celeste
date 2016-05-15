var keystone = require('keystone');
var User = keystone.list('User');
var moment = require('moment');
var Event = keystone.list('Event');
var apiResponse = require('../../services/apiResponseService');
var _ = require('underscore');
var lodash = require('lodash');

var maxDate = 14633207258;
var amountOfEventsToget = 10;
var defaultMeetingsInterval = 0.5;

exports.getAvailabilities = function (req, res) {

	var users = req.body.users;
	var duration = req.body.duration / 60;
	var rangeStart = moment().format();
	if (req.body.start)rangeStart = moment(req.body.start).format();
	var rangeEnd = moment().add(14, 'days').format();
	if (req.body.end) rangeEnd = moment(req.body.end).format();


	if (req.body.users && req.body.duration) {
		_getAvailabilities(users, duration, rangeStart, rangeEnd).then(function (av) {
			apiResponse.sendResponse(req, res, null, 'error in availabilities', av);
		})
	} else {
		apiResponse.sendResponse(req, res, true, 'wrong parameters sent', null);
	}

};

function _getAvailabilities(users, duration, rangeStart, rangeEnd) {
	return new Promise(function (mainResolve, mainReject) {
		var availabilitiesArray = [];

		_.forEach(users, function (user) {
			availabilitiesArray.push(new Promise(function (resolve, reject) {
				_getAvailibilitiesFromUser(amountOfEventsToget, duration, user, rangeStart, rangeEnd).then(function (events) {
					resolve(events);
				})
			}))

		});

		Promise.all(availabilitiesArray).then(function (availabilities) {
			mainResolve(lodash.intersection.apply(null, availabilities));
		});
	})

}


//get the Availibilities per user
function _getAvailibilitiesFromUser(amount, duration, user, rangeStart, rangeEnd) {
	//Get the first 10 events for that 
	return new Promise(function (resolve, reject) {
		Event.model.find({
			attendees: user.id,
			startDate: {$gte: rangeStart, $lt: rangeEnd}
		}).limit(amount).sort('startDate').exec(function (err, events) {
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
		availibilityArray = lodash.concat(availibilityArray, _calculateGap(events[i].endDate, startDate, duration).startTimes);
	}

	return availibilityArray;
}

//Calculate availibility
function _calculateGap(a, b, duration) {

	var availibility = {startTimes: []};
	if (b !== null) {
		availibility.startTime = a;
		availibility.endTime = b;

		if (_sameDay(a, b)) {
			var timeBetween = b - a;
			availibility.startTimes = _getPossibleStartTimes(a, timeBetween, duration);
		} else {
			var hoursTillDayEnds = _getHoursTillEndOfDay(a);
			availibility.startTimes = lodash.concat(availibility.startTimes, _getPossibleStartTimes(a, hoursTillDayEnds * 3600000, duration));
			var nextDays = _daysFromNow(a, b);
			var momentDate = moment(a);
			while (nextDays > 0) {
				momentDate = momentDate.add(1, 'days');
				var tempTimestamp = new Date(momentDate).setHours(9, 0, 0, 0);
				availibility.startTimes = lodash.concat(availibility.startTimes, _getPossibleStartTimes(new Date(tempTimestamp), 8 * 3600000, duration));
				nextDays--;
			}
			var hoursTillMeeting = _getHoursTillMeeting(b);
			var startOfFinalDay = new Date(b).setHours(9, 0, 0, 0);
			availibility.startTimes = lodash.concat(availibility.startTimes, _getPossibleStartTimes(new Date(startOfFinalDay), hoursTillMeeting, duration));

		}

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

function _getPossibleStartTimes(startDate, timeBetween, duration) {
	//Assumption meeting always start at hours or half hours
	var startTimeArray = [];
	var startDateUnix = startDate.getTime() / 1000;
	var timeBetweenUnix = timeBetween / 1000;
	var durationUnix = duration * 3600;
	var endTimeUnix = 0;
	var ctr = 0;

	if (durationUnix < timeBetweenUnix) {
		while (endTimeUnix < startDateUnix + timeBetweenUnix) {
			var startTime = startDateUnix + (defaultMeetingsInterval * 3600) * ctr;
			endTimeUnix = startTime + durationUnix;
			if (endTimeUnix < startDateUnix + timeBetweenUnix)startTimeArray.push(startTime);
			ctr++;
		}
	}
	return startTimeArray;

}


