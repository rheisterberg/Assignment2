
define('snap.slider.SliderHandle',function(snap) {

    //> public SliderHandle(Object? config)
    var SliderHandle = function(config) {

        var self = this;self.elem = $('<div class="hdl"/>');
        SliderHandle.superclass.constructor.call(self,config);
        self.elem.toggleClass('ds',config.disabled || false);

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.elem.bind('mousedown',self.onDragStart.bind(self));

    };

    snap.inherit(SliderHandle,'snap.Component');
    snap.extend(SliderHandle.prototype,{

        detached:true,

        move : function(position) {
            var self = this,parent = self.elem.parent(),target = self.elem,half = Math.floor(self.elem.width()/2);
            target.css({left:Math.round((self.position = Math.min(Math.max(0,position),parent.width()))) - half});
            return position;
        },

        onCancel : function(event) {
            return false;
        },

        onDragStart : function(event) {

            var self = this,disabled = self.disabled;
            if (disabled) return false;

            var offset = self.elem.position();
            self.eventLeft = event.clientX - offset.left;;
            self.elem.toggleClass('drag');

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            $doc.disableSelect($(document.body));

        },

        onDragMove : function(event) {
            var self = this,half = Math.floor(self.elem.width()/2);
            self.move(self.onDrag(event.clientX - self.eventLeft + half));
            return false;
        },

        onDragStop : function(event) {

            var self = this,onStop = self.onStop;
            if (onStop) self.move(onStop(self.position));
            self.elem.toggleClass('drag');

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            $doc.enableSelect($(document.body));

        }

    });

    return SliderHandle;

});


