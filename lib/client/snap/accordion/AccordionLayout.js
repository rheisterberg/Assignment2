
define('snap.accordion.AccordionLayout',function(snap) {

    //> public AccordionLayout(Object? config)
    var AccordionLayout = function(config) {
        var self = this;AccordionLayout.superclass.constructor.call(self,config);
        self.container.subscribe(/expand|collapse/,self.toggle,self);
    };

    snap.inherit(AccordionLayout,'snap.Layout');
    snap.extend(AccordionLayout.prototype,{

        //> public void layout(boolean force)
        layout : function(force) {

            var self = this.validate(force);
            self.active = self.active || (self.active = self.children.fwd);
            if (!self.dirty || (self.active == null)) return;

            var height = self.height;
            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                var target = node.getTarget();height -= node.elem.outerHeight() - target.outerHeight();
                if ((node != self.previous) && (node != self.active)) target.css({height:0});
            }

            var target = self.active.getTarget();target.stop(true,true);
            if (target.height() == height) return self.active.layout();

            target.animate({height:height},{duration:self.active.duration,step:self.animate.bind(self),complete:self.complete.bind(self)});

        },

        animate : function(now,fx) {
            var self = this,previous = self.previous;self.active.layout();
            if (previous) previous.body.css({height:Math.floor(fx.end - now),overflow:'hidden'});
        },

        complete : function(complete) {
            var self = this,previous = self.previous;
            if (previous) previous.body.css({overflow:''});
        },

        toggle : function(message,source) {

            var self = this,type = message.type;
            if (type.match(/collapse/)) return false;

            self.previous = self.active;
            self.active = source;

            self.layout(true);

            return false;

        }

    });

    return AccordionLayout;

});
