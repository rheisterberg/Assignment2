
define('walmart.views.item.ItemDetails',function(snap) {

    //> public ItemDetails(Object? config)
    var ItemDetails = function(config) {
        var self = this;ItemDetails.superclass.constructor.call(self,config);
        $('img.iv-c',self.elem).bind('click',self.onHide.bind(self));
    };

    snap.inherit(ItemDetails,'snap.Component');
    snap.extend(ItemDetails.prototype,{

        onHide : function(event) {
            this.publish('Frame.view','ResultSetTabs',true);
            return false;
        }

    });

    snap.extend(ItemDetails,{

        template : function(config,context) {
            context.render(ItemDetails.getName());
            context.queue(config);
        }

    });

    return ItemDetails;

});
