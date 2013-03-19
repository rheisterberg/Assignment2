
//Load modules

var Url = require('url');
var Mime = require('mime');

var Util = require('../util');

var View = require('./view');

var Error = module.exports = function(route) {
    View.call(this,route);
};

Util.inherits(Error,View);
Util.extend(Error.prototype,{

    handle : function(context) {

        this.context = context;

    }

});
