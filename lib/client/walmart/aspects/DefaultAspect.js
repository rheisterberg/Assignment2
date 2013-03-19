
define('walmart.aspects.DefaultAspect',function(snap) {

    var Component = snap.require('snap.Component');
    var Checkbox = snap.require('snap.checkbox.Checkbox');

    var AspectPanel = snap.require('walmart.aspects.AspectPanel');

    var VerticalScroller = snap.require('snap.scrollbar.vertical.VerticalScroller');

    //> public DefaultAspect(Object? config)
    var DefaultAspect = function(config) {

        var self = this;DefaultAspect.superclass.constructor.call(self,config);
        $('span.pnl-h',self.head).attr({id:self.name}).bind('click',self.onMore.bind(self));
        $('a.more',self.head).bind('click',self.onMore.bind(self));

        self.subscribe('select',self.onSelect.bind(self));
        if (self.children.length) self.buildValues(self.children);

        if (self.display.match(/TILED/)) $('a.tile',self.body).bind('click',self.onTile.bind(self));
        if (self.scrollable) new VerticalScroller({scrollable:self,target:self.body});

    };

    snap.inherit(DefaultAspect,'snap.Container');
    snap.extend(DefaultAspect.prototype,{

        //> protected void render(Object target)
        render : function(target,attrs) {
            var self = this;DefaultAspect.superclass.render.call(self,target);
            self.head = $('.pnl-h',self.elem);self.body = $('.pnl-b',self.elem);
        },

        buildValues : function(values) {
        },

        getTarget : function() {
            return this.body;
        },

        onTile : function(event) {
            var self = this,uri = $uri($(event.target).attr('href'));
            snap.publish('query',uri.getUrl(),self);
            return false;
        },

        onSelect : function(message,href) {
            snap.publish('query',href,self);
        },

        onMore : function(event) {
            snap.publish('AspectFlyout',this,this);
            return false;
        },

        showError : function(selector) {
            var error = $('div.asp-e.'.concat(selector),this.elem);
            if (error.length) error.removeClass("g-hdn");
            return false;
        },

        clearErrors : function() {
            $('div.asp-e',this.elem).addClass("g-hdn");
            return true;
        },

        buildRequest : function(url) {
            var self = this,name = this.name;
            var uri = $uri(url);uri.appendParam("_ssan",name);
            var param = self.buildParam(uri.params[name]);
            return uri;
        },

        buildParam : function(param) {
            return (param)?((typeof(param) == "string")?param:param.join("|")):null;
        },

        buildFlyout : function(config) {
            var DefaultAspectFlyout = snap.require('walmart.aspects.DefaultAspectFlyout');
            return new DefaultAspectFlyout(config);
        }

    });

    snap.extend(DefaultAspect,{

        template : function(config,context) {

            var name = config.name;
            var tiled = config.display.match(/TILED/);
            config.scrollable = (config.display.match(/SCROLLABLE/) != null);
            var nodes = config.children = config.children || config.values;delete config.values;
            for (var idx = 0,node;(node = nodes[idx]);idx++) {
                node.name = name;node.text = node.title;node.href = node.url;
                node.tid = tiled?'walmart.aspects.TiledAspectValue':'snap.checkbox.Checkbox';
            }

            context.render(DefaultAspect.getName());

            delete config.children;
            context.queue(config);

        }

    });

    return DefaultAspect;

});
