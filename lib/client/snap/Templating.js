
define('snap.Templating',function(snap) {

    var TYPE = 0,EID = 1,CONFIG = 2,CHILDREN = 3;

    var Templating = snap.require('templating');
    var Context = snap.require('templating.Context');

    var StringBuilder = snap.require('strings').StringBuilder;

    var Content = snap.require('snap.Content');
    var Registry = snap.require('snap.Registry');

    //> public Context()
    var Context = function(writer) {
        Context.superclass.constructor.call(this,writer);
        snap.extend(this,{global:{queue:[]}});
    };

    snap.inherit(Context,'templating.Context');
    snap.extend(Context.prototype,{

        invokeHandler: function(handler,config) {
            this.process(handler);
        },

        content : function(path,config) {
            var self = this,global = self.global;
            var queue = global.queue,current = queue.current;
            var context = config?config:current[CONFIG];
            return Content.get(path,config);
        },

        process : function(template,config) {

            var type = snap.isFunction(template)?template:snap.find(template);
            if (type == null) return template?Templating.render(template,config,this):null;

            var self = this,global = self.global,queue = global.queue,current;
            queue.parent = queue.current;queue.push(current = queue.current = [type.getName(),0,config,0]);

            type.template(config,self);

            if (queue.parent || (!current[CONFIG])) queue.pop();
            queue.current = queue.parent;queue.parent = queue[queue.length - 2];

        },

        render : function(template,helpers) {

            var self = this,global = self.global;
            var queue = global.queue,current = queue.current;
            if (helpers) snap.extend(self.helpers,helpers);

            var config = current[CONFIG];current[EID] = config.eid = config.eid || snap.eid();
            if (!document.getElementById(config.eid)) Templating.render(template?template:current[TYPE],config,self);

        },

        queue : function(config) {
            var self = this,global = self.global,queue = global.queue,current = queue.current,parent = queue.parent;
            if ((current[CONFIG] = config || current[CONFIG]) && parent) (parent[CHILDREN] || (parent[CHILDREN] = [])).push(current);
            delete current[CONFIG].eid;
        }

    });

    var Templates = snap.extend(function() {},{

        context : function(helpers) {
            var context = new Context(new StringBuilder());
            snap.extend(context,{helpers:helpers?helpers:{}});
            return context;
        },

        process : function(type,config,context) {
            var widget = snap.isFunction(type)?type:snap.find(type = type || config.tid);
            context.process(widget?widget.getName():type,config);
        },

        render : function(type,config,helpers) {

            var self = this,context = self.context(helpers);
            if (!snap.isArray(config)) self.process(type,config,context);
            else for (var idx = 0;(idx < config.length);idx++) self.process(type,config[idx],context);

            var global = context.global,queue = global.queue,output = context.getOutput();
            var fragment = $('<div style="display:none"/>').html(output).prependTo(document.body);

            var widgets = Templates.load(queue);fragment.children().detach();fragment.remove();
            return (widgets.length > 1)?widgets:widgets[0];

        },

        fragment : function(type,config,helpers) {

            var json = snap.isString(config);
            if (json) config = JSON.parse(config);

            var self = this,context = self.context(helpers);
            if (!snap.isArray(config)) self.process(type,config,context);
            else for (var idx = 0;(idx < config.length);idx++) self.process(type,config[idx],context);

            var global = context.global,queue = global.queue,output = context.getOutput();
            return json?{html:output,json:JSON.stringify(queue)}:output;

        },

        load : function(widgets) {

            var self = this,widget,instance;
            for (var idx = 0;(widget = widgets[idx]);idx++) {

                var children = widget[CHILDREN];
                if (children) self.load(children);

                var type = snap.require(widget[TYPE]);
                var config = widget[CONFIG];config.eid = '#' + widget[EID];
                if (children) config.children = children;

                if (instance = Registry.object(config.oid)) instance.elem = $(config.eid);
                else instance = new type(config);

                widgets[idx] = instance;
                delete config.eid;

            }

            return widgets;

        }

    });

    return Templates;

});

var Templates = snap.require('snap.Templating');

snap.render = Templates.render.bind(Templates);
snap.fragment = Templates.fragment.bind(Templates);

snap.load = Templates.load.bind(Templates);
