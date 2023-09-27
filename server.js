'use strict';
require('dotenv').config();
const express     = require('express');
const fs = require("fs");
const bodyParser  = require('body-parser');
const cors        = require('cors');

const https = require("https");

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

process.env.NODE_ENV = 'test';

const helmet = require('helmet');
const { Client }        = require('pg');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet({
  xFrameOptions: { action: "sameorigin" },
  xDnsPrefetchControl: { allow: true },
  referrerPolicy: {
    policy: "same-origin",
  }
}));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

function pgProbe() {
  const client = new Client({
    user: 'postgres',
    password: 'postgres',
    database: 'forum'
});

client.connect((err) => {
  client.query('SELECT $1::text as message', ['# PgSQL connected succesfully at 5432, user postgres, db forum'], (err, res) => {
    console.log(err ? err.stack : res.rows[0].message) // Hello World!
    client.end()
  })
})

}

const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

//Start our server and tests!

https.createServer(options, app).listen(3000, function (req, res) {
  console.log('# Your app is listening on port 3000');
  pgProbe();
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

/*
const listener = app.listen(process.env.PORT || 80, function () {
  console.log('# Your app is listening on port ' + listener.address().port);
  pgProbe();
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

*/

module.exports = app; //for testing
