let	express						= require('express');
let	app								= express();
let passport					= require('passport');
let request						= require('request');
let FortyTwoStrategy	= require('passport-42').Strategy;
let dbConfig 					= require(process.env.PWD + '/db.js');
middleware						= require(process.env.PWD + "/functions/middleware.js"),
mongoose							= require('mongoose');
let User							= require(process.env.PWD + '/models/user');
let oauth2lib					= require('oauth20-provider');
// let auth 							= require('./config/auth.js');



app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
mongoose.connect(dbConfig.url , {useMongoClient: true});

passport.use(new FortyTwoStrategy({
    clientID: "YOUR CLIENT ID",
    clientSecret: "YOUR CLIENT SECRET",
    callbackURL: "http://localhost:3030/auth/intra/callback"
  },
  function (token, refreshToken, profile, done){
    User.findOne({intraID: profile.id}, (err, user)=>{
      if (user)
        return done(null, user);
      else {
        var newUser = fillIntraUser(token, profile);

        try {
          newUser.save((err)=>{
            middleware.handleError(err);
            return done(null, newUser);
          });
        } catch (e) {
            console.error(e);
        }
      }
    });
  }
));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/wall', (req, res) => {
  res.render('wall');

});
// FUNCTION FOR GET API DATA
app.get('YOUR ROAD', (req, res) => {
	const credentials = {
	client: {
		id: 'YOUR CLIENT ID',
		secret: 'YOUR CLIENT SECRET',
	},
	auth: {
		tokenHost: 'https://api.intra.42.fr/oauth/authorize'
	}
};
	const oauth2 = require('simple-oauth2').create(credentials);
	const tokenConfig = {};

oauth2.clientCredentials.getToken(tokenConfig, (error, result) => {
	if (error) {
		return console.log('Access Token Error', error.message);
	}
	const accessToken = oauth2.accessToken.create(result);
});
	oauth2.clientCredentials
		.getToken(tokenConfig)
		.then((result) => {
	const accessToken = oauth2.accessToken.create(result);
	console.log(accessToken.token.access_token);
	const options = {
		// YOUR API URL HERE
		uri		: 'https://api.intra.42.fr//v2/closes?page=' + req.params.page,
		method	: 'GET',
		headers: {
			'Authorization': 'Bearer ' + accessToken.token.access_token,
		}
	};
	// all_user = [];
	var blackhole = request(options, (err, result)=>{
		if (err) console.log("ERR +" + err);
		ret = JSON.parse(result.body)
		//YOUR CB
		// res.setHeader('Content-Type', 'application/json');
		// res.send(JSON.stringify(ret));
	});
});
});
app.get('/auth/intra42', passport.authenticate('42'));

app.get('/auth/intra/callback',
    passport.authenticate('42', {
      successRedirect : '/',
      failureRedirect : '/'
    }
));


// UID = "805ffb1479a15da3bfd1268eb1fea91bdbed50affc7a14d957ce3afc932f4b07"
// SECRET = "7438f6de3bde946ea9b8990591e1b23f5951524ac7f4616881f9c506e61e4679"
// client = Client.new(UID, SECRET, site: "https://api.intra.42.fr")
// token = client.client_credentials.get_token

function fillIntraUser(token, profile){
  var newUser = new User();

  newUser.login       = profile.username;
  newUser.intraID     = profile.id;
  newUser.token       = token;
  newUser.name        = profile.name.familyName;
  newUser.firstName   = profile.name.givenName;
  newUser.email       = profile.emails[0].value;
  newUser.photo       = profile.photos[0].value;
  return newUser;
}

app.listen(3030, function() {
	console.log('App listening on port 3030!');
});


