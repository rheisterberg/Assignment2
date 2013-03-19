
//Load modules

var Url = require('url');
var Path = require('path');

var Mime = require('mime');
var Zlib = require('zlib');

var Util = require('../util');

var View = module.exports = function(route,config) {
    this.route = route;
    this.config = config;
};

Util.extend(View.prototype,{

    redirect : function(status,location) {

        var context = this.context;

        var server = context.server;
        var headers = context.headers;

        headers['Location'] = location;

        var response = context.response;

        response.writeHead(status,headers);
        response.end();

    }

});
