
//Load modules

var Fs = require('fs');

var Url = require('url');
var Path = require('path');

var Route = require('./route');
var Cache = require('../../lib/cache');

var Util = require('../util');

var Page = module.exports = function(config) {

    var self = this;
    Route.call(self,config);

    self.pages = new Cache.Page({root:config.root});
    self.cache = this.pages.cache;

    var pages = Fs.readdirSync(config.root);
    for (var idx = 0,len = pages.length;(idx < len);++idx) {
        self.pages.get(Path.join('/',pages[idx],'package.json').replace(/\\/g,'/'));
    }

};

Util.inherits(Page,Route);
Util.extend(Page.prototype,{
  
    handler : function(request) {

        var url = Url.parse(request.url);

        var entry = this.cache[Path.join(request.url,'package.json').replace(/\\/g,'/')];
        return entry?new entry.controller(this,entry.object):null;

    }

});
