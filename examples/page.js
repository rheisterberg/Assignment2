
// Load modules

var Snap = require('snap');
var Path = require('path');

// Define physical path

var main = function() {

    var server = new Snap.Server('localhost',8080,{});
    server.register(new Snap.Routes.Page({root:Path.join(__dirname,'../pages')}));
    server.start();

};

main();
