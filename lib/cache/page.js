
//Load modules

var Fs = require('fs');
var Path = require('path');

var Util = require('../util');

var File = require('./file');

var Page = module.exports = function(config) {
    File.call(this,config);
};

Util.inherits(Page,File);
Util.extend(Page.prototype,{

    put : function(key,object,error) {
        var entry = this.cache[key] = {key:key,object:JSON.parse(object),error:error};
        entry.controller = require(Path.join(this.config.root,Path.dirname(key),entry.object.controller));
        return entry;
    }

});
