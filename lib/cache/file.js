
//Load modules

var Fs = require('fs');
var Path = require('path');

var Util = require('../util');

var Base = require('./base');

var File = module.exports = function(config) {
    Base.call(this,config);
};

Util.inherits(File,Base);
Util.extend(File.prototype,{

    get : function(path,callback) {
        
        var entry = this.cache[path];
        return entry?callback.call(entry,entry.error,entry.object):this.read(path,callback);
        
    },

    put : function(key,object,error) {
        return this.cache[key] = {key:key,object:object,error:error};
    },

    read : function(path,callback) {
        
        var self = this;
        
        var filespec = Path.join(this.config.root,path);
        Fs.readFile(filespec,'utf-8',function(error,object) {
            
            var entry = self.put(path,object,error);
            if (callback) callback.call(entry,entry.error,entry.object);

        });
        
    }
    

});
