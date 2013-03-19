
//Load modules

var Url = require('url');
var Path = require('path');

var Route = require('./route');
var Views = require('../../lib/views');

var Util = require('../util');

var File = module.exports = function(config) {
    Route.call(this,config);
};

Util.inherits(File,Route);
Util.extend(File.prototype,{
  
  handler : function(request) {
    var url = Url.parse(request.url);
    return url.pathname.match(this.config.path)?new Views.File(this):null;
  }
    
});
