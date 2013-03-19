
// Load modules

var Path = require('path');
var Mime = require('mime');

var Snap = require('snap');
var Page = Snap.Views.Page;

var Controller = module.exports = function(route,config) {
    Page.call(this,route,config);
    this.root = Path.normalize(__dirname);
};

Snap.Util.inherits(Controller,Page);
Snap.Util.extend(Controller.prototype,{

    handle : function(context) {

        var self = this;
        self.context = context;

        self.load(self);
        self.execute();

    }

});