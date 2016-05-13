var _ = require('underscore'),
	rp = require('request-promise');
	keystone = require('keystone');
	User = keystone.list('User');

module.exports = {

	//TODO Continuous sync
	syncUsersToDb: function () {
		var options = {
			uri: 'https://slack.com/api/users.list?',
			qs: {
				token: 'xoxp-2186825377-14603377189-42848621732-2e85220052'
			},
			json: true
		};

		_getInfoFromSlack(options);
	}


};

function _getInfoFromSlack(options) {

	var userArray = [];

	rp(options)
		.then(function (res) {
			_.each(res.members, function (member) {
				
				userArray.push(new Promise(function(resolve,reject){
					//Define the userObject
					var userToSave = {
						name: member.name,
						email: member.profile.email,
						slack_id: member.id,
						team_id: member.team_id,
						deleted: member.deleted,
						status: member.status,
						color: member.color,
						real_name: member.real_name,
						profile: {
							first_name: member.profile.first_name,
							last_name: member.profile.last_name,
							title: member.profile.title,
							skype: member.profile.skype,
							phone: member.profile.phone,
							image: member.profile.image_192
						}
					};
					
					var newUser = User.model(userToSave);
					newUser.save().then(function(){
						resolve()
					});
				}))
				
			});
			
			Promise.all(userArray).then(function(res){
				console.log('all users posted to db');
			})
			
			
		})
		.catch(function (err) {
			console.log(err);
		});

}

