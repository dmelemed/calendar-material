// models ======================

// routes ======================
module.exports = function(app) {
  // server routes ===========================================================

  // api ---------------------------------------------------------------------

  // route to handle all angular requests
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });
};
