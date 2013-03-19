
define('snap.checkbox.Checkbox',function(snap) {

    //> public Checkbox(Object? config)
    var Checkbox = function(config) {
        var self = this;Checkbox.superclass.constructor.call(self,config);
        self.anchor = $('a',self.elem).bind('click',self.onClick.bind(self));
        self.input = $('input',self.anchor);
    };

    snap.inherit(Checkbox,'snap.Component');
    snap.extend(Checkbox.prototype,{

        onChange : function(checked) {
            var self = this;self.input[0].checked = self.selected = checked;
            self.publish('select',self.anchor.attr('href'),true);
        },

        onClick : function(event) {
            var self = this,input = self.input[0],disabled = input.disabled;
            var checked = (event.target == input)?input.checked:!input.checked;
            if (!disabled) window.setTimeout(self.onChange.bind(self,checked),0);
            return false;
        }

    });

    return Checkbox;

});

