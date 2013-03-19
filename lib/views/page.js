
//Load modules

var Fs = require('fs');

var Path = require('path');
var Mime = require('mime');

var Restler = require('restler');

var Dagger = require('../dagger');

var Util = require('../util');
var View = require('./view');

var Page = module.exports = function(route,config) {

    View.call(this,route,config);
    this.root = Path.normalize(__dirname);

    this.models = {};
    this.views = {};

    this.widgets = [];
    this.fragments = {};

    this.eidx = 0;
    this.oidx = 0;

    this.dagger = new Dagger();

    this.dagger.on('started',function(task) {
        console.log(task.name + ' started ' + task.started);
    });

    this.dagger.on('stopped',function(task) {
        console.log(task.name + ' stopped ' + task.elapsed + (task.error?(' error ' + task.error):''));
    });

    this.dagger.on('complete',function() {
        console.log('complete ' + this.elapsed);
    });

};

Util.inherits(Page,View);
Util.extend(Page.prototype,{

    eid : function() {
        return 'e1-' + this.eidx++;
    },

    oid : function() {
        return 'o' + this.oidx++;
    },

    service :  function(name,config,delay) {

        var self = this;

        var task = function(callback) {

            for (var error in this.errors) {
                return callback('aborted');
            }

            var request = Restler.request(config.url,{});
            request.on('complete',function(response) {
                setTimeout(function() {
                    self.models[name] = JSON.parse(response);
                    console.log('model:' + name + ' ' + JSON.stringify(self.models[name]));
                    callback();
                },delay);
            });

        };

        var dependencies = self.dagger.prefix(config.models,'model:');
        self.dagger.register('model:'.concat(name),task,dependencies);

    },

    render : function(name,parent,delay) {

        var self = this,views = parent.views;
        var fragments = parent.fragments;
        
        var parent = parent.config.views[name];
        
        var context = self.context;
        var response = context.response;

        var task = function(callback) {

            for (var error in this.errors) {
                return callback('aborted');
            }

            setTimeout(function() {

                var view = views[name];
                var config = view.config;

                for (var idx in config.requires) require(Path.join(self.root,parent.path,config.requires[idx]));
                require(Path.join(self.root,parent.path,config.main));

                var template = config.template;
                if (template) require(Path.join(self.root,parent.path,template.concat('.js')));

                var context = Util.extend(parent.context || {},{models:{}});
                for (var idx = 0,model;(model = parent.models[idx]);++idx) {
                    context.models[model] = self.models[model];
                }

                snap.eid = self.eid.bind(self);
                snap.oid = self.oid.bind(self);

                var object = snap.fragment(config.name,context,null,true);
                var fragment = fragments[name] = object.html,widgets = JSON.parse(object.json);
                self.widgets = self.widgets.concat(widgets);

                if (self.flushed) {

                    console.log('render ' + name + ' ' + fragment);

                    var script = document.createElement('script');
                    script.setAttribute('type','text/javascript');

                    var text = '',eid = widgets[0][1],target = name;
                    text = text.concat('var element = document.getElementById("' + eid + '");\n');

                    text = text.concat('var sibling = element.nextSibling;\n');
                    text = text.concat('sibling.parentNode.removeChild(sibling);\n');

                    text = text.concat('var target = document.getElementById("' + target + '");\n');
                    text = text.concat('target.parentNode.replaceChild(element,target);\n');

                    text = text.concat('snap.load(' + object.json + ');');

                    script.appendChild(document.createTextNode(text));
                    response.write(fragment + script.outerHTML);

                }

                callback();

            },delay);

        };

        return task;

    },

    flush :  function(tasks) {

        var self = this;

        var context = self.context;
        var response = context.response;

        var task = function(callback) {

            for (var error in this.errors) {
                return callback('aborted');
            }

            for (var name in self.fragments) {
                console.log('view:flush ' + name + ' ' + self.fragments[name]);
            }

            require(Path.join(self.root,self.config.template.concat('.js')));

            var script = document.createElement('script');
            script.setAttribute('type','text/javascript');

            var text = 'snap.load(' + JSON.stringify(self.widgets) + ');\n';
            script.appendChild(document.createTextNode(text));

            dust.render(self.config.name,self.fragments,function(err, out) {
                response.write(out + script.outerHTML);
                self.flushed = true;
            });

            callback();

        };

        self.dagger.register("view:flush",task,self.dagger.prefix(tasks,'view:'));

    },

    load : function(parent) {

        var self = this;

        var views = parent.views;
        var config = parent.config;

        for (var name in config.models) {
            self.service(name,config.models[name],config.models[name].delay || 0);
        }

        for (var name in config.views) {

            var view = config.views[name];

            var package = require(Path.join(self.root,view.path,'package.json'));
            views[name] = {config:package,views:{},fragments:{}};
            parent.fragments[name] = '<div id="' + name + '"></div>';

            var dependencies = self.dagger.prefix(view.models || [],'model:').concat(self.dagger.prefix(Object.keys(view.views || []),'view:'));
            self.dagger.register('view:'.concat(name),self.render(name,parent,view.delay || 0),dependencies);

            self.load(views[name]);

        }

    },

    execute : function() {

        var self = this;

        var config = self.config;
        self.flush(config.flush);

        var context = self.context;
        var response = context.response;

        response.setHeader('Content-Type','text/html;charset=utf-8');
        response.setHeader('Transfer-Encoding','chunked');

        self.dagger.execute(function() {
            console.log('done ' + this.elapsed);
            response.end();
        });

    }

});
