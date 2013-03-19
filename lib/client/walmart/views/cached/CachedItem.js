
define('walmart.views.cached.CachedItem',function(snap) {

    var Registry = snap.require('snap.Registry');
    var Messaging = snap.require('snap.Messaging');

    //> public CachedItem(Object? config)
    var CachedItem = function(config) {
        var self = this;CachedItem.superclass.constructor.call(self,config);
        $('.ci-b',self.elem).bind('click',self.onDetails.bind(self));
        $('.ci-c',self.elem).bind('click',self.onClose.bind(self));
    };

    snap.inherit(CachedItem,'snap.Component');
    snap.extend(CachedItem.prototype,{

        onDetails : function(event) {
            var self = this,config = snap.extend({},self.config);delete config.elem;
            snap.publish('ItemView.view',config,self);
            return false;
        },

        onClose : function(event) {
            this.parent.removeChild(this);
            snap.log('debug','CachedItem.onClick',this.itemId);
            return false;
        }

    });

    snap.extend(CachedItem,{

        template : function(config,context) {
            context.render(CachedItem.getName());
            context.queue(config);
        }

    });

    return CachedItem;

});
