
define('snap.Component',function(snap) {

    var Templates = snap.require('snap.Templates');
    var Draggable = snap.require('snap.Draggable');

    //> public Component(Object? config)
    var Component = function(config) {

        var self = this;self.siblings = {fwd:null,bwd:null};
        Component.superclass.constructor.call(self,config);

        self.render(self.target);

    };

    snap.inherit(Component,'snap.Observable');
    snap.extend(Component.prototype,{

        classes:{},styles:{},draggable:false,

        //> protected void render(Object target)
        render : function(target) {

            var self = this;self.template();
            if (self.draggable) Component.mixin(self,Draggable);

            if (self.classes.elem) self.elem.addClass(self.classes.elem);
            if (self.styles.elem) self.elem.css(self.styles.elem);

            var parent = snap.elem(target);
            if (parent && parent.length) self.elem.appendTo(parent);

            snap.register(self,self.elem);
            self.elem.attr('oid',self.oid);

        },

        template : function() {
            var self = this;self.elem = self.elem || $(self.eid);
            if (self.elem.length <= 0) snap.render(self.constructor,self);
        },

        destroy : function() {
            var self = this;self.elem.remove();
            Component.superclass.destroy.call(self);
        },

        detach : function(detached) {
            this.detached = detached;
        },

        resize : function(size,force) {
            this.elem.layout(size);
            this.layout(force);
        },

        //> public void layout(boolean force)
        layout : function(force) {
            this.publish('layout');
        }

    });

    snap.extend(Component,{

        mixin : function(target,type,config) {
            var mixin = type.prototype;
            for (var name in mixin) if (!target[name]) target[name] = mixin[name];
            mixin.constructor.call(target,config);
        },

        template : function(config,context) {
            var template = this.getName(),exists = Templates.exists(template);
            context.render(exists?template:Component.getName());
            context.queue();
        }

    });

    return Component;

});
