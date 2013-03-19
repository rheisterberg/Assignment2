
define('snap.slider.currency.SliderCurrency',function(snap) {

    var currency = /(\d*)(\.(\d*))?/;

    var CurrencyFormatter = snap.require('ebay.utils.CurrencyFormatter');

    //> public SliderCurrency(Object? config)
    var SliderCurrency = function(config) {
        var formatter = config.formatter || new CurrencyFormatter({grouping:config.grouping,symbol:config.symbol,pattern:config.pattern});
        SliderCurrency.superclass.constructor.call(this,snap.extend(config,{formatter:formatter}));
    };

    snap.inherit(SliderCurrency,'snap.slider.logarithmic.SliderLogarithmic');
    snap.extend(SliderCurrency.prototype,{

        decimals:2,

        round : function(position) {

            var self = this,minimum = Math.log(Math.max(self.min,0.01));
            var scale = (Math.log(self.max) - minimum)/self.range.width();

            var power = Math.pow(10,Math.max(Math.round(Math.LOG10E*(scale*position + minimum) - 2),-self.decimals));
            return Math.round(Math.pow(10,Math.LOG10E*(scale*position + minimum))/power)*power;

        },

        scale : function(position) {

            var self = this,range = self.range.width();
            var amount = position?(position == range?self.max:self.round(position)):self.min;

            var match = amount.toString().match(currency),dollars = match[1],decimals = match[3]?match[3].concat('00'):'00';
            if ((amount < 10) || ((self.max - self.min) < 10)) dollars = dollars.concat('.',decimals.substring(0,2));

            return parseFloat(dollars);

        },

        format : function(value) {
            var self = this,match = value.toString().match(currency);
            var dollars = match[1],decimals = match[3]?match[3].concat('00'):'00';
            if ((value < 10) || ((self.max - self.min) < 10)) dollars = dollars.concat('.',decimals.substring(0,2));
            return self.formatter?self.formatter.format(dollars):dollars;
        }

    });

    return SliderCurrency;

});


