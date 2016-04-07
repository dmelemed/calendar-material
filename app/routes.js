// models ======================

var calendarRouter = require('./routes/calendarRouter');

// routes ======================
module.exports = function(app) {
  // server routes ===========================================================

  // api ---------------------------------------------------------------------
  app.get('/api/events', calendarRouter.getEvents);

  app.post('/api/add', calendarRouter.addEvent);

  // route to handle all angular requests
  app.get('/', function(req, res) {
    res.sendfile('./public/index2.html');
  });

  app.get('*', function(req, res) {
    res.sendfile('./public/index2.html');
  });
};
