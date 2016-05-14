var keystone = require('keystone');
var Types = keystone.Field.Types;

var Room = new keystone.List('Room');

Room.add({
	name: {type: String, required: true,initial:true, index: true,unique:true}

});

Room.defaultColumns = 'name';
Room.register();
