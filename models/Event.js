var keystone = require('keystone');
var Types = keystone.Field.Types;

var Event = new keystone.List('Event');

Event.add({
		name: {type: String, required: true, initial: true, index: true},
		startDate: {type: Types.Datetime, required: true,initial:true, index: true},
		endDate: {type: Types.Datetime, required: true,initial:true, index: true},
		meetingRoomId:{type:Types.Relationship, ref: 'Room'},
		content: {type: String, index: true},
		context: {type: String, index: true},
		organizerId: {type: Types.Relationship, ref: 'User', index: true}

	},
	'attendees',
	{
		attendees: {type: Types.Relationship, ref: 'User', many: true}
	});

Event.defaultColumns = 'name, startDate, attendees';
Event.register();
