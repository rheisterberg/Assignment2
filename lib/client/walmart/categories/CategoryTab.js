
define('walmart.categories.CategoryTab',function(snap) {

    var CategoryFlyout = snap.require('walmart.categories.CategoryFlyout');

    //> public CategoryTab(Object? config)
    var CategoryTab = function(config) {
        var self = this;config.finger = !config.empty;
        CategoryTab.superclass.constructor.call(self,config);
        self.subscribe('show',self.onShow);self.subscribe('hide',self.onHide);
    };

    snap.inherit(CategoryTab,'snap.Container');
    snap.extend(CategoryTab.prototype,{

        onFlyout : function(config) {
            var self = this,flyout = self.appendChild(new CategoryFlyout(config));
            flyout.buildCategories(config.visible.concat(config.hidden?config.hidden:[]));
            flyout.scroller.scrollbar.subscribe('dragstop',self.onDragStop.bind(self));
            return flyout;
        },

        onEnter : function(event) {
            var self = this;self.loaded = self.visible;
            if (self.finger && self.loaded) self.publish('select',self,true);
            else if (self.finger) self.publish('load',{name:self.name,onload:self.onLoad.bind(self)},true);
        },

        onLoad : function(model) {
            var self = this;self.loaded = true;
            snap.extend(self.config,model);
            self.publish('select',self,true);
        },

        onShow : function(message) {
            var self = this,config = self.config,show = config.visible;
            self.flyout = self.flyout || (self.flyout = show?self.onFlyout(config):null);
            snap.publish('rover',{an:'Dash.CategoryFlyout.show',ex1:config.id},self);
            if (self.flyout) self.flyout.show();
        },

        onHide : function(message) {
        },

        onDragStop : function(message,object) {
            var self = this,event = object.event,target = self.flyout.elem;
            var offset = target.offset(),width = target.outerWidth(),height = target.outerHeight();
            if ((event.clientX < offset.left) || (event.clientX > (offset.left + width))) self.publish('deselect',self,true);
            else if ((event.clientY < offset.top) || (event.clientY > (offset.top + height))) self.publish('deselect',self,true);
        },

        onClick : function(event) {
            var self = this,target = $(event.target),uri = $uri(target.attr('href'));
            if (self.flyout) self.publish('deselect',self,true);
            snap.publish('query',uri.getUrl(),self);
            return false;
        },

        onLeave : function() {
            return !this.flyout.scroller.scrollbar.dragging();
        }

    });

    snap.extend(CategoryTab,{

        template : function(config,context) {
            context.render(CategoryTab.getName());
            context.queue(snap.extend(config,{tid:config.eid}));
        }

    });

    return CategoryTab;

});
