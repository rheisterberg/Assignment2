
define('ebay.utils.CurrencyFormatter',function(snap) {

    var Formatter = snap.require('ebay.utils.NumberFormatter');

    var validator = /^(\d*)(\.(\d*))?$|^$/;

    var CurrencyFormatter = function(config) {
        var self = this;snap.extend(self,config);
        self.formatter = new Formatter(self.grouping);
    };

    snap.extend(CurrencyFormatter.prototype,{

        parse : function(value) {
            return this.formatter.parse(value);
        },

        format: function(price,simple) {

            var self = this,symbol = self.symbol;
            var pattern = self.pattern,formatter = self.formatter;
            if (simple) return formatter.format(price);

            switch(pattern) {
                case 'Nes':   return formatter.format(price).concat(' ',symbol);
                case 'Ns':    return formatter.format(price).concat(symbol);
                case 'Sen':   return symbol.concat(' ',formatter.format(price));
                case 'Sn':    return symbol.concat(formatter.format(price));
                case 'seN':   return symbol.concat(' ',formatter.format(price));
                case 'sN':    return symbol.concat(formatter.format(price));
                default:      return formatter.format(price).concat(' ',symbol);
            }

        },

        validate : function(price) {
            var self = this,value = $.trim(price);
            value = value.replace(self.grouping,'');
            value = value.replace(self.decimal,'.');
            return value.match(self.validator);
        }

    });

    return CurrencyFormatter;

});
