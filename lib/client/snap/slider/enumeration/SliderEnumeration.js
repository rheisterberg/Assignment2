
define('snap.slider.enumeration.SliderEnumeration',function(snap) {

    var SliderBase = snap.require('snap.slider.SliderBase');
    var SliderHandle = snap.require('snap.slider.SliderHandle');

    //> public SliderEnumeration(Object? config)
    var SliderEnumeration = function(config) {

            var self = this,disabled = config.disabled || false;
            SliderEnumeration.superclass.constructor.call(self,config);

            self.range = $('.range',self.elem).toggleClass('ds',disabled);
            self.range.bind('click',self.onClick.bind(self));

            self.ticks = $('.ticks',self.range);
            self.bar = $('.bar',self.range).toggleClass('ds',disabled);

            self.handle = new SliderHandle({onDrag:self.onDrag.bind(self),onStop:self.onStop.bind(self),target:self.range});

            self.label  = $('.label',self.elem);
            self.legend = $('.legend');

            if (self.range.width()) self.layout();

    };

    snap.inherit(SliderEnumeration,'snap.slider.SliderBase');
    snap.extend(SliderEnumeration.prototype,{

        layout : function(force) {

            var self = this,range = self.range.width();

            var ticks = self.ticks.children();self.tick = (self.range.outerWidth() - 1)/(ticks.length - 1);
            for (var idx = 0,tick;(tick = ticks[idx]);idx++) $(tick).css({left:Math.round(idx*self.tick)});

            var position = self.tick*self.index;self.handle.move(position);
            self.bar.css({'margin-right':range - position});

        },

        format : function(position) {
            var self = this,len = self.values.length;
            return self.values[Math.round(position/self.tick)];
        },

        onClick : function(event) {

            var self = this,range = self.range.width(),offset = self.range.offset();
            var index = Math.round((event.pageX - offset.left)/self.tick);
            var position = self.tick*index;self.handle.move(position);

            self.label.text(self.format(self.handle.position));
            self.bar.css({'margin-right':range - position});

            self.publish('slider',{index:index});

        },

        onDrag : function(offset) {

            var self = this,range = self.range.width();
            var position = Math.min(Math.max(0,offset),range);

            self.label.text(self.format(self.handle.position));
            self.bar.css({'margin-right':range - position});

            return position;

        },

        onStop : function(offset) {

            var self = this,range = self.range.width();
            var index = Math.round(offset/self.tick),position = self.tick*index;
            self.bar.css({'margin-right':range - position});

            self.publish('slider',{index:index});

            return position;

        },

        destroy : function() {
            var self = this;snap.destroy(self.handle);
            SliderEnumeration.superclass.destroy.call(self);
        }


    });

    snap.extend(SliderEnumeration,{

        template : function(config,context) {

            var values = config.values;config.ticks = true;

            config.label = values[config.index = config.index || 0];
            config.left = values[0];config.right = values[values.length-1];

            context.render(SliderBase.getName());
            context.queue(config);

        }

    });

    return SliderEnumeration;

});


