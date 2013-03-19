
define('snap.toolbar.Toolbar',function(snap) {

    //> public Toolbar(Object? config)
    var Toolbar = function(config) {
        Toolbar.superclass.constructor.call(this,config);
    };

    snap.inherit(Toolbar,'snap.Container');
    snap.extend(Toolbar.prototype,{
        classes:{elem:'tbar'},
        manager:'snap.toolbar.ToolbarLayout'
    });

    return Toolbar;

});
