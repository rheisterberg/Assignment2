
// Load modules

var Path = require('path');

var Snap = require('snap');

// Define physical path

var root = Path.resolve(__dirname);

var main = function() {

    var cache = new Snap.Cache.File({root:root});
    
    cache.get('cache.js',function(error,object) {

        console.log('test1' + object);

        cache.get('cache.js',function(error,object) {
            console.log('test2' + object);

        });

    });

};

main();
