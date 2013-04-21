var express = require("express");
var pg = require('pg');

var app = express();
app.use(express.logger());
app.use(express.bodyParser());

var port = process.env.PORT || 5000;
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/hell'

console.log("Connecting to " + connectionString );

var client = new pg.Client(connectionString);
client.connect();

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.post('/ws', function(request, response) {
  response.send('Total webservice!');
 
 console.log(request.body.checkin);
  console.log(request.body.checkin.id);

  var mod_time = request.body.checkin.createdAt;
  var user_id = request.body.checkin.user.id;
  var location_lat = request.body.checkin.venue.location.lat;
  var location_lng = request.body.checkin.venue.location.lng;


  client.query('UPDATE people SET mod_time = to_timestamp($2), location_lat = $3, location_lng = $4 WHERE (user_id = $1);', 
	[user_id, mod_time, location_lat, location_lng]);

  client.query('INSERT INTO people (user_id, mod_time, location_lat, location_lng) SELECT $1,to_timestamp($2),$3,$4 WHERE NOT EXISTS (SELECT 1 FROM people WHERE user_id = $1);',
  	[user_id, mod_time, location_lat, location_lng]);


});

app.listen(port, function() {
  console.log("Listening on " + port);
});
