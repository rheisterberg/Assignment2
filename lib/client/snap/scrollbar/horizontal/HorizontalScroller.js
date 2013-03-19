
define('snap.scrollbar.horizontal.HorizontalScroller',function(snap) {

    var HorizontalScrollbar = snap.require('snap.scrollbar.horizontal.HorizontalScrollbar');

    //> public HorizontalScroller(Object? config)
    var HorizontalScroller = function(config) {

        var self = this;snap.extend(self,config);self.target.addClass('scroll-x');
        self.scrollbar = new HorizontalScrollbar({after:self.target});
        self.scrollable.subscribe('layout',self.layout.bind(self),self);
        if (!self.auto) return;

        self.scrollbar.elem.css({visibility:'hidden'});
        self.scrollbar.elem.bind('mouseleave',self.onLeave.bind(self));

        self.scrollbar.subscribe('dragstop',self.onDragStop.bind(self),self);

        self.target.bind('mouseenter',self.onEnter.bind(self));
        self.target.bind('mouseleave',self.onLeave.bind(self));

    };

    snap.extend(HorizontalScroller.prototype,{

        show : function() {
            this.scrollbar.show();
        },

        hide : function() {
            this.scrollbar.hide();
        },

        scroll : function(position) {
            this.scrollbar.scroll(position);
        },

        position : function() {
            return this.scrollbar.position();
        },

        layout : function(message) {
            this.scrollbar.layout();
        },

        onEnter : function(event) {
            this.scrollbar.show();
        },

        onLeave : function(event) {
            var self = this,scrollbar = self.scrollbar.elem[0],related = event.relatedTarget;
            if (!((related == scrollbar) || $.contains(scrollbar,related))) self.scrollbar.hide();
        },

        onDragStop : function(message,object) {
            var self = this,event = object.event,target = self.target,scrollbar = self.scrollbar;
            var offset = target.offset(),width = target.outerWidth(),height = target.outerHeight();
            if ((event.clientX < offset.left) || (event.clientX > (offset.left + width))) scrollbar.hide();
            else if ((event.clientY < offset.top) || (event.clientY > (offset.top + height))) scrollbar.hide();
        }

    });

    return HorizontalScroller;

});
