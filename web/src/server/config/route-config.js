(function (routeConfig) {

  'use strict';

  routeConfig.init = function (app) {

    // *** routes *** //
    const routes = require('../routes/index');
    const authRoutes = require('../routes/auth');
    const artistRoutes = require('../routes/api/artist');
    const adminArtistRoutes = require('../routes/admin/artist');
    const venueRoutes = require('../routes/api/venue');
    const assetRoutes = require('../routes/api/asset');

    // *** register routes *** //


    app.use(function(req, res, next) {

      res.jsonSuccess = function(data, message) {
        var response = {data : null, trackRecordapi :  {"version" : "1.0"}};
  
        if(message)
          response['message'] = message;
        
        if(data)
          response['data'] = data;
        
        return res.json(response);
      };
    
      next();
    });

    app.use('/', routes);
    app.use('/auth', authRoutes);
    //app.use('/admin', adminArtistRoutes);
    app.use('/api', artistRoutes);
    app.use('/api', venueRoutes);  //route('../routes/api/venue') as '/api'. so, relative adress is based on '/api'
    app.use('/api', assetRoutes);
  };

})(module.exports);
