
define('snap.scrollbar.horizontal.HorizontalScrollbar',function(snap) {

    //> public HorizontalScrollbar(Object? config)
    var HorizontalScrollbar = function(config) {

        var self = this;HorizontalScrollbar.superclass.constructor.call(self,config);self.elem.insertAfter(self.target = self.after);
        self.handle = $('.scroll-x-hdl',self.elem).bind('mousedown',self.onDragStart.bind(self));

        self.elem.bind('mousedown',self.onMouseDown.bind(self));
        self.target.bind('mousewheel DOMMouseScroll',self.onScroll.bind(self));

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        self.layout();

    };

    snap.inherit(HorizontalScrollbar,'snap.Component');
    snap.extend(HorizontalScrollbar.prototype,{

        show : function() {
            var self = this,target = self.target,width = target.innerWidth() + 1;
            self.elem.css({visibility:(width < target.prop('scrollWidth'))?'visible':'hidden'});
        },

        hide : function() {
            var self = this,target = self.target,width = target.innerWidth() + 1;
            if (!self.dragging() && (width < target.prop('scrollWidth'))) self.elem.css({visibility:'hidden'});
        },

        layout : function() {

            var self = this,target = self.target;
            self.elem.css({top:target[0].offsetTop + target[0].offsetHeight - 8,left:target[0].offsetLeft});
            self.elem.css({width:target.innerWidth()});

            var width = self.elem.width(),handle = Math.round(width*(width/target.prop('scrollWidth')));
            var offset = target.prop('scrollLeft'),position = offset*(width - handle)/(target.prop('scrollWidth') - width);

            self.handle.css({left:position,width:Math.max(Math.min(handle,width),16)});

            self.show();

        },

        scroll : function(position) {

            var self = this,target = self.target,width = self.elem.width(),object;
            var scroll = target.prop('scrollWidth') - width,handle = self.handle.width();
            var offset = Math.max(Math.min(Math.round(scroll*position/(width - handle)),scroll),0);

            self.publish('scroll',object = {scrollLeft:offset},true);
            self.target.prop('scrollLeft',object.scrollLeft);

            self.handle.css({left:Math.min(Math.max(position,0),width - handle)});

        },

        position : function() {
            return this.target.prop('scrollLeft');
        },

        dragging : function() {
            return this.handle.hasClass('drag');
        },

        onMouseDown : function(event) {
            var self = this,offset = self.elem.offset();
            var handle = self.handle.width();self.scroll(event.pageX - offset.left - handle/2);
            self.onDragStart(event);
        },

        onCancel : function(event) {
            return false;
        },

        onScroll : function(event) {

            var self = this,original = event.originalEvent;
            var wheelDelta = original.detail?original.detail*-1:original.wheelDelta/40;

            var width = self.elem.width(),position = self.handle.position();
            self.scroll(position.left - Math.round((wheelDelta/100)*width));

            event.preventDefault();

        },

        onDragStart : function(event) {

            var self = this,offset = self.handle.position();
            self.eventLeft = event.clientX - offset.left;self.handle.toggleClass('drag');

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            $doc.disableSelect($(document.body));

            return false;

        },

        onDragMove : function(event) {
            var self = this;self.scroll(event.clientX - self.eventLeft);
            self.publish('dragmove',{scrollLeft:self.target.prop('scrollLeft')});
            return false;
        },

        onDragStop : function(event) {

            var self = this;

            self.handle.toggleClass('drag');
            self.publish('dragstop',{event:event});

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            $doc.enableSelect($(document.body));

            return false;

        }

    });

    snap.extend(HorizontalScrollbar,{

        template : function(config,context) {
            context.render(HorizontalScrollbar.getName());
            context.queue(config);
        }

    });

    return HorizontalScrollbar;

});


