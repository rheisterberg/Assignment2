
define('snap.fingers.FingerTabs',function(snap) {

    //> public FingerTabs(Object? config)
    var FingerTabs = function(config) {
        FingerTabs.superclass.constructor.call(this,config);
    };

    snap.inherit(FingerTabs,'snap.Container');
    snap.extend(FingerTabs.prototype,{

        manager:'snap.fingers.FingerTabsLayout'

    });

    snap.extend(FingerTabs,{

        template : function(config,context) {
            context.render(FingerTabs.getName());
            context.queue();
        }

    });

    return FingerTabs;

});


