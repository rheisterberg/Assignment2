
define('com.walmart.product.slider',function() {

    var SliderHandle = snap.require('com.walmart.product.slider.handle');

    var Slider = function(config) {
    
    	var self = this,disabled = config.disabled || false;
        Slider.superclass.constructor.call(self,config);

        self.range = $('.range',self.elem);
        self.bar = $('.bar',self.range).toggleClass('ds',disabled);
        self.range.bind('click',self.onClick.bind(self));

        self.left = new SliderHandle({onDrag:self.onMinDrag.bind(self),onStop:self.onMinStop.bind(self),target:self.range,disabled:disabled});
        self.left.bubble = $('<div class="bubble"><div class="text"></div><div class="tip"></div></div>').appendTo(self.left.elem);

        self.right = new SliderHandle({onDrag:self.onMaxDrag.bind(self),onStop:self.onMaxStop.bind(self),target:self.range,disabled:disabled});
        self.right.bubble = $('<div class="bubble"><div class="text"></div><div class="tip"></div></div>').appendTo(self.right.elem);

        self.label  = $('.label',self.elem);

        self.min = config.min;self.max = config.max;
        self.low = config.low;self.high = config.high;

        if (self.range.width()) self.layout();

    };

    snap.inherit(Slider,'snap.Component');
    snap.extend(Slider.prototype,{

        layout : function(force) {

            var self = this;

            self.low = Math.max(self.low,self.min);
            self.high = Math.min(self.high,self.max);

            var left = self.position(self.low);self.left.move(left);
            var right = self.position(self.high);self.right.move(right);

            $('.text',self.left.bubble).text(self.format(self.low));
            self.left.bubble.css({left:-Math.round(self.left.bubble.width()/2)});

            $('.text',self.right.bubble).text(self.format(self.high));
            self.right.bubble.css({left:-Math.round(self.right.bubble.width()/2)});

            self.bar.css({'margin-left':Math.round(left),'margin-right':Math.round(self.range.width() - right)});

        },

        scale : function(position) {
            var self = this,range = self.range.width(),fraction = position/range;
            return Math.round(self.min + fraction*(self.max - self.min));
        },

        position : function(value) {
            var self = this,range = self.range.width();
            return range*((value - self.min)/(self.max - self.min));
        },

        format : function(value) {
            return value.toString() + '"';
        },

        onClick : function(event) {

            var self = this,offset = self.range.offset();
            var position = event.pageX - offset.left;

            var left = self.left.position,right = self.right.position;
            if (position < left) self.onMinStop(self.left.move(position));
            else if (position > right) self.onMaxStop(self.right.move(position));
            else if ((position - left) < (right - position)) self.onMinStop(self.left.move(position));
            else self.onMaxStop(self.right.move(position));

        },

        onMinDrag : function(offset) {

            var self = this,range = self.range.width();
            var position = Math.min(Math.max(0,offset),self.right.position);
            self.left.elem.css({'z-index':1});self.right.elem.css({'z-index':0});

            $('.text',self.left.bubble).text(self.format(self.low = self.scale(position)));
            self.left.bubble.css({left:-Math.round(self.left.bubble.width()/2)});

            self.bar.css({'margin-left':Math.round(position)});

            return position;

        },

        onMaxDrag : function(offset) {

            var self = this,range = self.range.width();
            var position = Math.min(Math.max(self.left.position,offset),range);
            self.left.elem.css({'z-index':0});self.right.elem.css({'z-index':1});

            $('.text',self.right.bubble).text(self.format(self.high = self.scale(position)));
            self.right.bubble.css({left:-Math.round(self.right.bubble.width()/2)});

            self.bar.css({'margin-right':Math.round(range - position)});

            return position;

        },

        onMinStop : function(offset) {
            var self = this,position = self.onMinDrag(offset);
            self.publish('slider',{slider:'low',value:self.scale(position)});
            return position;

        },

        onMaxStop : function(offset) {
            var self = this,position = self.onMaxDrag(offset);
            self.publish('slider',{slider:'high',value:self.scale(position)});
            return position;
        },

        reset : function() {
            var self = this,config = self.config;
            self.min = config.min;self.max = config.max;
            self.low = config.low;self.high = config.high;
            self.layout();
        }

    });

    snap.extend(Slider,{

        template : function(config,context) {

            var self = this,format = self.prototype.format.bind(config);

            config.min = parseFloat(config.min || 0);config.max = parseFloat(config.max || 0);
            config.low = parseFloat(config.low || config.min);config.high = parseFloat(config.high || config.max);

            config.label = config.label;
            config.left = format(config.min);config.right = format(config.max);

            context.render(Slider.getName());
            context.queue(config);

        }

    });

    return Slider;

});

