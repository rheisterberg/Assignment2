
define('walmart.aspects.PriceSliderAspect',function(snap) {

    var Content = snap.require('snap.Content');

    var CurrencyFormatter = snap.require('ebay.utils.CurrencyFormatter');

    //> public PriceSliderAspect(Object? config)
    var PriceSliderAspect = function(config) {
        PriceSliderAspect.superclass.constructor.call(this,config);
    };

    snap.inherit(PriceSliderAspect,'walmart.aspects.GroupAspect');
    snap.extend(PriceSliderAspect.prototype,{

        ticks:2000,

        buildValues : function(values) {

            var self = this,slider = self.slider = self.children[0];
            self.slider.subscribe('slider',self.onPrice.bind(self));

            self.elem.bind('mousemove',self.onPriceMove.bind(self));
            self.elem.bind('mouseleave',self.onPriceLeave.bind(self));

            var disabled = (parseFloat(slider.min) >= parseFloat(slider.max));
            if (disabled) self.elem.css({display:'none'});

        },

        onPrice : function(message,object) {

            var self = this,slider = self.slider,handle = object.slider,value = object.value;
            var price = handle.match(/low/)?(slider.lowerBound = value):(slider.upperBound = value);

            self.setPriceTimer(self.ticks);
            return false;

        },

        setPriceTimer : function(ticks) {
            var self = this;window.clearTimeout(self.timer);
            self.timer = window.setTimeout(self.onPriceSubmit.bind(self),ticks);
        },

        onPriceMove :function(event) {
            var self = this,timer = self.timer;
            if (timer) self.setPriceTimer(1500);
        },

        onPriceLeave :function(event) {
            var self = this,timer = self.timer;
            if (timer) self.onPriceSubmit();
            return false;
        },

        onPriceSubmit : function() {

            var self = this,slider = self.slider,uri = $uri(slider.baseUrl);
            delete uri.params[slider.lowerBoundParam];delete uri.params[slider.upperBoundParam];

            if (slider.lowerBound) uri.appendParam(slider.lowerBoundParam,slider.formatter.format(slider.lowerBound,true));
            if (slider.upperBound) uri.appendParam(slider.upperBoundParam,slider.formatter.format(slider.upperBound,true));

            window.clearTimeout(self.timer);self.timer = null;
            snap.publish('query',uri.getUrl(),self);

        },

        buildFlyout : function(config) {
            var PriceSliderAspectFlyout = snap.require('walmart.aspects.PriceSliderAspectFlyout');
            return new PriceSliderAspectFlyout(config);
        }

    });

    snap.extend(PriceSliderAspect,{

        template : function(config,context) {

            var slider = config.children[0];slider.tid = 'snap.slider.currency.SliderCurrency';
            var formatter = new CurrencyFormatter({grouping:slider.grouping,symbol:slider.symbol,pattern:slider.pattern});

            slider.minimumLimit = formatter.parse(slider.minimumLimit);
            slider.maximumLimit = formatter.parse(slider.maximumLimit);

            slider.lowerBound = slider.lowerBound?Math.max(formatter.parse(slider.lowerBound),slider.minimumLimit):slider.minimumLimit;
            slider.upperBound = slider.upperBound?Math.min(formatter.parse(slider.upperBound),slider.maximumLimit):slider.maximumLimit;

            snap.extend(slider,{min:slider.minimumLimit,max:slider.maximumLimit,low:slider.lowerBound,high:slider.upperBound});

            var shipping = config.children[1],selected = shipping.selected;
            var shippingText = Content.get('srp_snap/Aspects.FreeShippingOnly');shipping.tid = 'snap.checkbox.Checkbox';
            snap.extend(shipping,{name:shipping.name,value:shipping.name,href:shipping.action,text:shippingText,selected:selected});

            context.render(PriceSliderAspect.getName());

            delete config.children;
            context.queue(config);

        }

    });

    return PriceSliderAspect;

});

