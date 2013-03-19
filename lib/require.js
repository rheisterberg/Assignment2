
//Load modules

var Fs = require('fs');
var Path = require('path');

var Util = require('./util');

var Require = function() {
    this.cache = {};
};

Util.extend(Require.prototype, {

    package : function(path) {

        var entry = this.cache[path];
        if (entry) return entry.object;

        var object = require(path);
        this.cache[path] = {key:path,object:object};

        return object;

    }

});

module.exports = new Require();



