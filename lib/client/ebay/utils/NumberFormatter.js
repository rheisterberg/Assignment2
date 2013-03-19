
define('ebay.utils.NumberFormatter',function(snap) {

    var NumberFormatter = function(sep) {
        this.sep = sep || ',';this.sub = '$1' + this.sep + '$2$3';
        this.dec = this.sep.match(/,/)?'.':',';this.grp = new RegExp('\\' + this.sep,'g');
        this.exp = new RegExp('(\\d)(\\d{3})' + '(\\.|,|$)');
    };

    snap.extend(NumberFormatter.prototype,{

        parse : function(value) {
            var value = value.toString();
            return parseFloat(value.replace(this.grp,'').replace(this.dec,'.'));
        },

        format : function(num) {
            var self = this,exp = self.exp,sub = self.sub;
            var value = num.toString().replace('.',self.dec);
            while (exp.test(value)) value = value.replace(exp,sub);
            return value;
        }

    });

    return NumberFormatter;

});
