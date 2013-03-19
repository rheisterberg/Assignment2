
define('snap.button.Button',function(snap) {

    //> public Button(Object? config)
    var Button = function(config) {
        var self = this;Button.superclass.constructor.call(self,config);
        if ($.browser.msie && ($.browser.version >= 9)) self.elem.addClass('ie');
        self.elem.bind('click',self.onClick.bind(self));
    };

    snap.inherit(Button,'snap.Component');
    snap.extend(Button.prototype,{

        classes:{elem:'blue lrg'},

        onClick : function(event) {
            if (this.href) window.location = this.href;
            else return this.publish('click');
        }

    });

    return Button;

});
