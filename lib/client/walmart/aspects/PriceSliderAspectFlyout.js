
define('walmart.aspects.PriceSliderAspectFlyout',function(snap) {

	var Content = snap.require('snap.Content');
	var Checkbox = snap.require('snap.checkbox.Checkbox');

	var SliderCurrency = snap.require('snap.slider.currency.SliderCurrency');
	var CurrencyFormatter = snap.require('ebay.utils.CurrencyFormatter');

	//> public PriceSliderAspectFlyout(Object? config)
	var PriceSliderAspectFlyout = function(config) {
		PriceSliderAspectFlyout.superclass.constructor.call(this,config);
	};

	snap.inherit(PriceSliderAspectFlyout,'walmart.aspects.GroupAspectFlyout');
	snap.extend(PriceSliderAspectFlyout.prototype,{

		classes:{elem:'prc'},

		buildValues : function(values) {

			var self = this,range = self.values[0],shipping = self.values[1];
			var formatter = self.formatter = new CurrencyFormatter({grouping:range.grouping,symbol:range.symbol,pattern:range.pattern});

			range.minimumLimit = formatter.parse(range.minimumLimit);
			range.maximumLimit = formatter.parse(range.maximumLimit);

			range.lowerBound = range.lowerBound?Math.max(formatter.parse(range.lowerBound),range.minimumLimit):range.minimumLimit;
			range.upperBound = range.upperBound?Math.min(formatter.parse(range.upperBound),range.maximumLimit):range.maximumLimit;

			var disabled = (parseFloat(range.minimumLimit) >= parseFloat(range.maximumLimit));
			self.slider = self.appendChild(new SliderCurrency({disabled:disabled,formatter:self.formatter,min:range.minimumLimit,max:range.maximumLimit,low:range.lowerBound,high:range.upperBound}));
			self.slider.subscribe('slider',self.onPrice.bind(self));

			var freeShipping = self.freeShipping = values[1],selected = freeShipping.selected,shippingText = Content.get('srp_snap/Aspects.FreeShippingOnly');
			self.freeCheckbox = self.appendChild(new Checkbox({name:freeShipping.name,value:freeShipping.name,text:shippingText,selected:selected}));

		},

		onPrice : function(message,object) {
			var self = this,range = self.values[0],handle = object.slider,value = object.value;
			var price = handle.match(/low/)?(range.lowerBound = value):(range.upperBound = value);
			return false;
		},

		isValid : function() {
			return true;
		},

		encodeState : function(href) {

			var self = this,range = self.values[0];

			delete href.params[range.lowerBoundParam];
			delete href.params[range.upperBoundParam];

			if (range.lowerBound) href.appendParam(range.lowerBoundParam,self.formatter.format(range.lowerBound,true));
			if (range.upperBound) href.appendParam(range.upperBoundParam,self.formatter.format(range.upperBound,true));

			href.params[self.freeCheckbox.name] = self.freeCheckbox.selected?'1':'0';

			return href;

		}

	});

	return PriceSliderAspectFlyout;

});

