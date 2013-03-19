
define('snap.radio.Radio',function(snap) {

    //> public Radio(Object? config)
    var Radio = function(config) {
        var self = this;Radio.superclass.constructor.call(self,config);
        self.input = $('input',self.anchor = $('a',self.elem).bind('click',self.onClick.bind(self)));
        self.anchor.bind('focus',self.onFocus.bind(self));
    };

    snap.inherit(Radio,'snap.Component');
    snap.extend(Radio.prototype,{

        onFocus : function(event) {
            this.selected = this.input[0].checked;
        },

        onClick : function(event) {
            var self = this,input = self.input[0],disabled = input.disabled;
            if (!disabled && !self.selected) window.setTimeout(self.onChange.bind(self,true),0);
            return false;
        },

        onChange : function(checked) {
            var self = this;self.input[0].checked = checked;
            self.publish('select',self.anchor.attr('href'),true);
        }

    });

    return Radio;

});


