var rp = require('request-promise');
var Promise = require('promise');

module.exports.getUserComments = function (req, res) {
	var options = {
		uri: 'https://slack.com/api/channels.history?',
		qs: {
			token: process.env.SLACK_TOKEN,
			channel: 'C025GQ9B9',
		},
		json: true
	};
	rp(options)
		.then(function (result) {
			var promises = [];
			result.messages.forEach(function (message, i) {
				var options = {
					uri: 'https://slack.com/api/users.info?',
					qs: {
						token: process.env.SLACK_TOKEN,
						user: message.user
					},
					json: true
				};
				var promise = rp(options);
				promises.push(promise);
			});

			Promise.all(promises).then(function (result2) {
				// TODO: possible that the values don't map to the correct user HYPE
				var results = result.messages.map(function (message, i) {
					var finalMessage = message;
					finalMessage.user = result2[i].user;
					return finalMessage;
				});
				res.send(results);
			})
			
		});
	
}
