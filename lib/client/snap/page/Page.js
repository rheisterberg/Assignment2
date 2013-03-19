
define('snap.page.Page',function(snap) {

    //> public Page(Object? config)
    var Page = function(config) {
        Page.superclass.constructor.call(this,config);
    };

    snap.inherit(Page,'snap.Container');
    snap.extend(Page.prototype,{

        //> protected void render(Object target)
        render : function(target) {

            var self = this;self.elem = snap.elem(target || document.body);
            if (self.elem[0] == document.body) self.setScroll(self.scroll);

            Page.superclass.render.call(self);

            $(window).bind('resize',self.onWindowResize.bind(self));

        },

        //> protected void onWindowResize(Event event)
        onWindowResize : function(event) {

            if (this.resizing) return;
            else this.resizing = true;

            window.setTimeout(this.resize.bind(this),50);

        },

        //> protected void resize()
        resize : function() {

            var self = this,elem = self.elem;
            if (!self.scroll) elem.height($(window).height());

            self.layout();
            self.resizing = false;

        },

        setScroll : function(scroll) {
            var self = this;self.elem.attr('scroll',scroll?'yes':'no');
            if (!scroll) self.elem.height($(window).height());
        }

    });

    snap.extend(Page,{

        template : function(config,context) {
            context.render(Page.getName());
            context.queue(config);
        }

    });

    return Page;

});
