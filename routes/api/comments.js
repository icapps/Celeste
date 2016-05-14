var rp = require('request-promise');

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
			res.send(result);
		})
}
