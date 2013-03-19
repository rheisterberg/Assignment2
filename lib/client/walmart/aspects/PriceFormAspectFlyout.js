
define('walmart.aspects.PriceFormAspectFlyout',function(snap) {

    //> public PriceFormAspectFlyout(Object? config)
    var PriceFormAspectFlyout = function(config) {
        PriceFormAspectFlyout.superclass.constructor.call(this,config);
    };

    snap.inherit(PriceFormAspectFlyout,'walmart.aspects.GroupAspectFlyout');
    snap.extend(PriceFormAspectFlyout.prototype,{
        blank:/^$/,validator:/^(\d*)(\.(\d*))?$|^$/
    });

    snap.extend(PriceFormAspectFlyout,{

        template : function(config,context) {

            config.udloid = snap.eid();
            config.udhiid = snap.eid();

            context.render(PriceFormAspectFlyout.getName());
            context.queue(config);

        }

    });

    return PriceFormAspectFlyout;

});
