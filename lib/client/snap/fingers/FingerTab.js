
define('snap.fingers.FingerTab',function(snap) {

    //> public FingerTab(Object? config)
    var FingerTab = function(config) {
        var self = this;FingerTab.superclass.constructor.call(self,config);
        self.subscribe('show',self.onShow);self.subscribe('hide',self.onHide);
    };

    snap.inherit(FingerTab,'snap.Container');
    snap.extend(FingerTab.prototype,{

        onClick : function(event) {
        },

        onEnter : function(event) {
            this.publish('select',this,true);
        },

        onLeave : function() {
            return true;
        },

        onShow : function(message) {
        },

        onHide : function(message) {
        }

    });

    snap.extend(FingerTab,{

        template : function(config,context) {
            context.render(FingerTab.getName());
            context.queue();
        }

    });

    return FingerTab;

});
