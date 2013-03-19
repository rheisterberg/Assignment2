
define('snap.throbber.Throbber',function(snap) {

    var Mask = snap.require('snap.window.Mask');

    //> public Throbber(Object? config)
    var Throbber = function(config) {
        var self = this;self.mask = new Mask();
        Throbber.superclass.constructor.call(self,config);
    };

    snap.inherit(Throbber,'snap.Component');
    snap.extend(Throbber.prototype,{

        classes:{elem:'thr'},

        show : function(object) {
            var self = this,parent = self.elem.parent();
            self.elem.css({display:'block',width:parent.width(),height:parent.height()});
            self.mask.show(object);
        },

        hide : function(object) {
            this.mask.hide();
            this.elem.css({display:'none'});
        }

    });

    return Throbber;

});
