
//Load modules

var Fs = require('fs');
var Path = require('path');

var Mime = require('mime');

var Dust = require('dustjs-helpers');
var Templates = require('consolidate');

var Dagger = require('../dagger');

var Util = require('../util');
var View = require('./view');

var pad = function(text,size) {
    return ('                ' + text).slice(-size);
};

var File = module.exports = function(route,config) {
    View.call(this,route,config);
};

Util.inherits(File,View);
Util.extend(File.prototype,{

    handle : function(context) {

        var self = this;
        self.context = context;

        var relative = Path.relative(this.route.config.path,context.request.url);
        context.filespec = Path.join(this.route.config.root,relative);

        Fs.stat(context.filespec,function(error,stat) {
            return stat.isDirectory()?self.directory(context):self.file(context,stat);
        });

    },

    file : function(context,stat) {

        var response = context.response;
        var filespec = context.filespec;

        response.setHeader('Content-Type',Mime.lookup(filespec) || 'application/octet-stream');
        response.setHeader('Content-Length',stat.size)

        response.setHeader('Last-Modified',stat.mtime);

        var stream = Fs.createReadStream(filespec);
        stream.on('end',response.end.bind(response));

        stream.pipe(response);

    },

    directory : function(context) {

        var self = this;

        var request = context.request;
        var response = context.response;

        var directory = context.filespec;

        if (!request.url.match(/\/$/)) {
            var redirect = Path.join(request.url,'/').replace(/\\/g,'/');
            return self.redirect(301,redirect);
        }

        Fs.readdir(directory,function(error,files) {

            var root = Path.join(self.route.config.root);

            var title = Path.join('/',Path.relative(root,directory),'/').replace(/\\/g,'/');
            var parent = Path.join(title,'../','/').replace(/\\/g,'/');

            var model = {title:title, parent:parent, files:[]};

            var dagger = new Dagger();

            var file = function(idx) {

                return function(callback) {

                    var filespec = Path.join(directory,files[idx]);

                    Fs.stat(filespec,function(error,stat) {

                        var name = files[idx],date = stat.mtime,href = stat.isDirectory()?name.concat('/'):name;
                        model.files[idx] = {date:date,dir:stat.isDirectory(),size:pad(stat.size,8),name:name,href:href};

                        callback();

                    });

                };

            };

            for (var idx = 0,len = files.length;(idx < len);++idx) {
                dagger.register(idx,file(idx));
            }

            dagger.execute(function() {

                Templates.dust('lib/views/directory.dust', model, function(error, html) {

                    if (error) throw error;

                    response.setHeader('Content-Type',Mime.lookup('.html'));
                    response.setHeader('Content-Length',Buffer.byteLength(html));

                    response.end(html);


                });

            });

        });

    }

});
