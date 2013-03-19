
define('snap.scrollbar.vertical.VerticalScrollbar',function(snap) {

    //> public VerticalScrollbar(Object? config)
    var VerticalScrollbar = function(config) {

        var self = this;VerticalScrollbar.superclass.constructor.call(self,config);self.elem.insertAfter(self.target = self.after);
        self.handle = $('.scroll-y-hdl',self.elem).bind('mousedown',self.onDragStart.bind(self));

        self.elem.bind('mousedown',self.onMouseDown.bind(self));
        self.target.bind('mousewheel DOMMouseScroll',self.onScroll.bind(self));

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        self.layout();

    };

    snap.inherit(VerticalScrollbar,'snap.Component');
    snap.extend(VerticalScrollbar.prototype,{

        show : function() {
            var self = this,target = self.target,height = target.innerHeight() + 1;
            self.elem.css({visibility:(height < target.prop('scrollHeight'))?'visible':'hidden'});
        },

        hide : function() {
            var self = this,target = self.target,height = target.innerHeight() + 1;
            if (!self.dragging() && (height < target.prop('scrollHeight'))) self.elem.css({visibility:'hidden'});
        },

        layout : function() {

            var self = this,target = self.target;
            self.elem.css({top:target[0].offsetTop,left:target[0].offsetLeft + target[0].offsetWidth - 8});
            self.elem.css({height:target.innerHeight()});

            var height = self.elem.height(),handle = Math.round(height*(height/target.prop('scrollHeight')));
            var offset = target.prop('scrollTop'),position = offset*(height - handle)/(target.prop('scrollHeight') - height);

            self.handle.css({top:position,height:Math.max(Math.min(handle,height),16)});

            self.show();

        },

        scroll : function(position) {

            var self = this,target = self.target,height = self.elem.height(),object;
            var scroll = target.prop('scrollHeight') - height,handle = self.handle.height();
            var offset = Math.max(Math.min(Math.round(scroll*position/(height - handle)),scroll),0);

            self.publish('scroll',object = {scrollTop:offset},true);
            self.target.prop('scrollTop',object.scrollTop);

            self.handle.css({top:Math.min(Math.max(position,0),height - handle)});

        },

        position : function() {
            return this.target.prop('scrollTop');
        },

        dragging : function() {
            return this.handle.hasClass('drag');
        },

        onMouseDown : function(event) {
            var self = this,offset = self.elem.offset();
            var handle = self.handle.height();self.scroll(event.pageY - offset.top - handle/2);
            self.onDragStart(event);
        },

        onCancel : function(event) {
            return false;
        },

        onScroll : function(event) {

            var self = this,original = event.originalEvent;
            var wheelDelta = original.detail?original.detail*-1:original.wheelDelta/40;

            var height = self.elem.height(),position = self.handle.position();
            self.scroll(position.top - Math.round((wheelDelta/100)*height));

            event.preventDefault();

        },

        onDragStart : function(event) {

            var self = this,offset = self.handle.position();
            self.eventTop = event.clientY - offset.top;self.handle.toggleClass('drag');

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            $doc.disableSelect($(document.body));

            return false;

        },

        onDragMove : function(event) {
            var self = this;self.scroll(event.clientY - self.eventTop);
            self.publish('dragmove',{scrollTop:self.target.prop('scrollTop')});
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

    snap.extend(VerticalScrollbar,{

        template : function(config,context) {
            context.render(VerticalScrollbar.getName());
            context.queue(config);
        }

    });

    return VerticalScrollbar;

});


