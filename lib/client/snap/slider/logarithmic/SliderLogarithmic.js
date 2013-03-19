
define('snap.slider.logarithmic.SliderLogarithmic',function(snap) {

    //> public SliderLogarithmic(Object? config)
    var SliderLogarithmic = function(config) {
        SliderLogarithmic.superclass.constructor.call(this,config);
    };

    snap.inherit(SliderLogarithmic,'snap.slider.range.SliderRange');
    snap.extend(SliderLogarithmic.prototype,{

        decimals:0,

        scale : function(position) {

            var self = this,minimum = Math.log(Math.max(self.min,0.01));
            var scale = (Math.log(self.max) - minimum)/self.range.width();

            var power = Math.pow(10,Math.max(Math.round(Math.LOG10E*(scale*position + minimum) - 2),-self.decimals));
            var value = Math.round(Math.pow(10,Math.LOG10E*(scale*position + minimum))/power)*power;

            return position?Math.max(Math.min(value,self.max),self.min):self.min;

        },

        position : function(value) {

            var self = this,minimum = Math.log(Math.max(self.min,0.01));
            var scale = (Math.log(self.max) - minimum)/self.range.width();

            var position = (Math.max(Math.log(value) - minimum,-2))/scale;
            return (value > Math.max(self.min,0.01))?position:0;
        },

        format : function(value) {
            return value;
        }

    });

    return SliderLogarithmic;

});


