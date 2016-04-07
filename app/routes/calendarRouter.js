var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var path = require('path');
var moment = require('moment')

var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';

var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

/*
 Internet Timestamp Generator
 Copyright (c) 2009 Sebastiaan Deckers
 License: GNU General Public License version 3 or later
*/
var timestamp = function(date) {
  var pad = function(amount, width) {
    var padding = "";
    while (padding.length < width - 1 && amount < Math.pow(10, width - padding.length - 1))
      padding += "0";
    return padding + amount.toString();
  };
  date = date ? date : new Date();
  var offset = date.getTimezoneOffset();
  return pad(date.getFullYear(), 4) + "-" + pad(date.getMonth() + 1, 2) + "-" + pad(date.getDate(), 2) + "T" + pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2) + ":" + pad(date.getSeconds(), 2) + "." + pad(date.getMilliseconds(), 3) + (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60), 2) + ":" + pad(Math.abs(offset) % 60, 2);
};


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */


module.exports = {
  getEvents: function(req, res) {
    // Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Calendar API.
      var events = authorize(JSON.parse(content), function listEvents(auth) {
        var calendar = google.calendar('v3');
        calendar.events.list({
          auth: auth,
          calendarId: 'primary',
          timeMin: (new Date()).toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime'
        }, function(err, response) {
          if (err) {
            console.log('The API returned an error: ' + err);
            return;
          }
          var events = response.items;
          if (events.length == 0) {
            console.log('No upcoming events found.');
          } else {
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
              var event = events[i];
              var start = event.start.dateTime || event.start.date;
              console.log('%s - %s', start, event.summary);
            }
          }
          res.json(events); // return all todos in JSON format
        });
      });
    });
  },

  addEvent: function(req, res) {
    console.log(req.body.startDateTime);
    var startDateTime = new Date(parseInt(req.body.startDateTime));
    console.log(startDateTime);
    var endDateTime = new Date(parseInt(req.body.endDateTime));
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      var calendar = google.calendar('v3');
      var event = {
        'summary': 'Google I/O 2015',
        //'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
          'dateTime': timestamp(startDateTime),
          'timeZone': 'America/New_York',
        },
        'end': {
          'dateTime': timestamp(endDateTime),
          'timeZone': 'America/New_York',
        },
      };
      var events = authorize(JSON.parse(content), function newEvent(auth) {
        calendar.events.insert({
          auth: auth,
          calendarId: 'primary',
          resource: event,
        }, function(err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            res.send('There was an error contacting the Calendar service');
            return;
          }
          console.log('Event created: %s', event.htmlLink);
          res.send(event.htmlLink);
        });
      });
    });
  }


};
