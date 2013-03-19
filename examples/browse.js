
// Load modules

var Snap = require('snap');

var main = function() {

    var server = new Snap.Server('localhost',8080,{});
    server.start();

};

main();
