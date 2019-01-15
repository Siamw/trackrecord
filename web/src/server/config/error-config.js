(function (errorConfig) {

  'use strict';

  // *** error handling *** //

  errorConfig.init = function (app) {

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      const err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // development error handler (will print stacktrace)
    if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
        console.log(err);
        if(req.headers['accept'].indexOf('application/json') > -1)
        {
          res.status(err.status || 500).send({
            message: err.message,
            error: err
          });
        }
        else{
          res.render('error', {
            message: err.message,
            error: err
          });
        }
      });
    }else{
      // production error handler (no stacktraces leaked to user)
      app.use(function(err, req, res, next) {
        console.log(err);
        if(req.headers['accept'].indexOf('application/json') > -1)
        {
          res.status(err.status || 500).send({
            message: err.message,
            error: err
          });
        }
        else{
          res.render('error', {
            message: err.message,
            error: err
          });
        }
      });
    }

  };

})(module.exports);
