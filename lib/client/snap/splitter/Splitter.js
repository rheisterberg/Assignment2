
define('snap.splitter.Splitter',function(snap) {

    //> public Splitter(Object? config)
    var Splitter = function(config) {

        var self = this;Splitter.superclass.constructor.call(self,config);
        self.elem.bind('mousedown',self.onDragStart.bind(self));

        self.elem.bind('click',self.onCancel.bind(self));
        self.elem.bind('dragstart',self.onCancel.bind(self));

        self.ondragstop = self.onDragStop.bind(self);
        self.ondragmove =  self.onDragMove.bind(self);

        $(document.body).prepend(self.elem);

    };

    snap.inherit(Splitter,'snap.Component');
    snap.extend(Splitter.prototype,{

        setBounds : function(min,max) {
            this.min = min;this.max = max;
        },

        setStyles : function(rules) {
            this.elem.css(rules);
        },

        onCancel : function(event) {
            return false;
        },

        onDragStart : function(event) {

            var self = this;

            self.elem.css({'background-color':'#ccc'});

            self.offsetTop = event.clientY - self.elem[0].offsetTop;
            self.offsetLeft = event.clientX - self.elem[0].offsetLeft;

            $(document).bind('mouseup',self.ondragstop);
            $(document).bind('mousemove',self.ondragmove);

            return false;

        },

        onDragMove : function(event) {

            var self = this;

            var elem = self.elem;
            var mode = self.mode;

            if (mode.match(/vert/)) {
                var top = event.clientY - self.offsetTop,height = elem[0].offsetHeight;
                elem.css('top',Math.min(Math.max(top,self.min),self.max - height));
            }
            else if (mode.match(/horz/)) {
                var left = event.clientX - self.offsetLeft,width = elem[0].offsetWidth;
                elem.css('left',Math.min(Math.max(left,self.min),self.max - width));
            }

            return false;

        },

        onDragStop : function(event) {

            var self = this;

            self.offsetTop = self.elem[0].offsetTop - $(window).scrollTop();
            self.offsetLeft = self.elem[0].offsetLeft - $(window).scrollLeft();

            self.offsetWidth = self.elem[0].offsetWidth;
            self.offsetHeight = self.elem[0].offsetHeight;

            self.elem.css({'background-color':''});

            $(document).unbind('mouseup',self.ondragstop);
            $(document).unbind('mousemove',self.ondragmove);

            self.publish('drag');

            return false;

        }

    });

    return Splitter;

});
