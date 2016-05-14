var keystone = require('keystone');
var User = keystone.list('User');
var rp = require('request-promise');
var _ = require('underscore');

exports.getAll = function (req, res) {
	var options = {
		uri: 'https://slack.com/api/channels.list?',
		qs: {
			token: 'xoxp-2186825377-14603377189-42848621732-2e85220052'
		},
		json: true
	};

	rp(options)
		.then(function (result) {
			var channels = [];
			var channelPromises = [];
			_.each(result.channels, function (channel) {
				channelPromises.push(new Promise(function (parentResolve, parentReject) {

					var channelObject = channel;

					var memberPromiseArray = [];
					var memberArray = [];
					_.each(channel.members, function (member) {

						memberPromiseArray.push(new Promise(function (resolve, reject) {
							User.model.find({slack_id: member}).exec(function (err, user) {
								
								if(user[0]){
									var userToSend = {
										id:user[0].id,
										real_name:user[0].real_name,
										title: user[0].profile.title
									};

									memberArray.push(userToSend);
								}
								
								resolve();
							})
						}))

					});

					Promise.all(memberPromiseArray).then(function () {
						channelObject.members = memberArray;
						channels.push(channelObject);
						parentResolve();
					})
				}));


			});

			Promise.all(channelPromises).then(function () {
				res.json(channels);
			})
		});
};
