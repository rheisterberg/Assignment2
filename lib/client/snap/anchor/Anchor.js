
define('snap.anchor.Anchor',function(snap) {

    //> public Anchor(Object? config)
    var Anchor = function(config) {
        var self = this;Anchor.superclass.constructor.call(self,config);
        self.elem.bind('click',self.onClick.bind(self));
    };

    snap.inherit(Anchor,'snap.Component');
    snap.extend(Anchor.prototype,{

        onClick : function(event) {
            return this.publish('click');
        }

    });

    return Anchor;

});
