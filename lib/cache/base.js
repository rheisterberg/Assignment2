
//Load modules

var Util = require('../util');

var Base = module.exports = function(config) {
    this.config = config;
    this.cache = {};
};

Util.extend(Base.prototype,{
    
    get : function(key) {
        var entry = this.cache[key];
        return entry?entry.object:null;
    },
    
    put : function(key,object) {
        return this.cache[key] = {key:key,object:object};
    }
  
});
