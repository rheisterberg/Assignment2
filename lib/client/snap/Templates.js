
define('snap.Templates',function(snap) {

    var TYPE = 0,EID = 1,CONFIG = 2,CHILDREN = 3;

    var Content = snap.require('snap.Content');
    var Context = snap.require('snap.Context');

    var Registry = snap.require('snap.Registry');

    var Templates = snap.extend(function() {},{

        exists : function(name) {
            return dust.cache[name];
        },

        //> public void register(String name,Function template)
        register : function(name,template) {
            dust.register(name,template);
        },

        widget : function(chk,ctx,bodies,params) {

            var config = ctx.current();
            if (config.elem && config.elem.length) return;
            else if (!config.elem) delete config.oid;

            var tid = (params?params.tid:null) || ctx.get('tid'),type;
            if (type = snap.find(tid)) return ctx.process(type);
            else return chk.partial(tid,ctx);

        },

        widgets : function(chk,ctx,bodies,params) {
            return chk.section(ctx.current(),ctx,{block:ctx.global.widget},params);
        },

        handler : function(ctx,err,out) {
            var global = ctx.global;global.error = err;global.output = out;
            if (global.error) throw new Error(global.error);
        },

        context : function(type,config,helpers) {
            var self = this,tid = snap.isFunction(type)?type.getName():type,context = dust.makeBase({}).push(config);
            snap.extend(context.global,{eid:snap.eid,widget:self.widget.bind(self),widgets:self.widgets.bind(self),content:self.content.bind(self),tid:tid});
            if (helpers) snap.extend(context.global,helpers);
            return context;
        },

        process : function(chk,ctx) {

            var self = this,current = ctx.current();
            ctx.global.chunk = chk;ctx.global.queue = [];
            if (!snap.isArray(current)) return self.widget(chk,ctx);
            else for (var idx = 0;(idx < current.length);idx++) self.widget(chk,ctx.push(current[idx]));

            return chk;

        },

        render : function(type,config,helpers) {

            var self = this,ctx = self.context(type,config,helpers);
            dust.render('snap.Processor',ctx,self.handler.bind(self,ctx));

            var global = ctx.global,queue = global.queue;
            var fragment = $('<div style="display:none"/>').html(global.output).prependTo(document.body);

            var widgets = Templates.load(queue);fragment.children().detach();fragment.remove();
            return (widgets.length > 1)?widgets:widgets[0];

        },

        fragment : function(type,config,helpers,force) {

            var json = snap.isString(config);
            if (json) config = JSON.parse(config);

            var self = this,ctx = self.context(type,config,helpers);
            dust.render('snap.Processor',ctx,self.handler.bind(self,ctx));

            var global = ctx.global,queue = global.queue,output = global.output;
            return (json || force)?{html:output,json:JSON.stringify(queue)}:output;

        },

        content : function(chk,ctx,bodies,params) {
            var path= params.path,context = params.context;
            context = context?ctx.get(context):ctx.current();
            return chk.write(Content.get(path,context));
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

    var processor = Templates.process.bind(Templates)
    Templates.register('snap.Processor',processor);

    return Templates;

});

var Templates = snap.require('snap.Templates');

snap.render = Templates.render.bind(Templates);
snap.fragment = Templates.fragment.bind(Templates);

snap.load = Templates.load.bind(Templates);

