
//Load modules

var Util = require('../util');

var Route = module.exports = function(config) {
    this.config = config;
};

Util.extend(Route.prototype,{
    
    handler : function(request) {
        return null;
    }
  
});
