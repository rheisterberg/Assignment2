
define('snap.tabs.Tabs',function(snap) {

    //> public Tabs(Object? config)
    var Tabs = function(config) {
        Tabs.superclass.constructor.call(this,config);
        var self = this;self.subscribe('select',self.onSelect);
    };

    snap.inherit(Tabs,'snap.Container');
    snap.extend(Tabs.prototype,{

        manager:'snap.tabs.TabsLayout',

        getTab : function(key) {
            return this.getChild(key);
        },

        scrollTo : function(key) {
            var tab = this.getChild(key);
            if (tab) this.manager.scrollTo(key);
        },

        onSelect : function(message,tab) {
            this.manager.selectTab(tab);
        }

    });

    snap.extend(Tabs,{

        template : function(config,context) {
            context.render(Tabs.getName());
            context.queue(config);
        }

    });

    return Tabs;

});
