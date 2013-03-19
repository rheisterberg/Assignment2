
define('snap.menu.Menu',function(snap) {

    //> public Menu(Object? config)
    var Menu = function(config) {
        Menu.superclass.constructor.call(this,config);
    };

    snap.inherit(Menu,'snap.Container');
    snap.extend(Menu.prototype,{
        manager:'snap.menu.MenuLayout'
    });

    snap.extend(Menu,{

        template : function(config,context) {
            context.render(Menu.getName());
            context.queue();
        }

    });

    return Menu;

});
