
define('snap.menu.Item',function(snap) {

    //> public Item(Object? config)
    var Item = function(config) {

        var self = this;Item.superclass.constructor.call(self,config);
        if (self.children.length) self.renderMenu(self.children[0]);

        self.elem.bind('mouseover',self.onMouseOver.bind(self));
        self.elem.bind('mouseout',self.onMouseOut.bind(self));

        self.onshow = self.onShow.bind(self);
        self.onhide = self.onHide.bind(self);

    };

    snap.inherit(Item,'snap.Container');
    snap.extend(Item.prototype,{

        //> protected void render(Object target)
        render : function(target) {

            var self = this;

            Item.superclass.render.call(self,target);

            self.anchor = $('a.i',self.elem);
            if (self.icon) self.anchor.append(self.renderImage(self.icon));
            if (self.text) self.anchor.append(self.renderContent(self.text));

        },

        renderImage : function(icon) {
            var image = snap.isNode(icon)?icon:$('<img/>',{src:icon});
            return image.addClass('i');
        },

        renderContent : function(text) {
            return $('<span/>').append(text);
        },

        renderMenu : function(menu) {
            var self = this;self.menu = menu;
            self.menu.subscribe('mouseover',self.cancelTimer,self);
            self.anchor.addClass("x");
        },

        setTimer : function() {
            this.timeer = window.setTimeout(this.onshow,500);
        },

        cancelTimer : function() {
            window.clearTimeout(this.timer);
        },

        onMouseOver : function(event) {

            var self = this,related = event.relatedTarget;
            if ($.contains(self.elem[0],related)) return;

            self.elem.addClass('h');
            self.publish('mouseover',self,true);
            if (self.menu) self.setTimer();

        },

        onMouseOut : function(event) {

            var self = this,related = event.relatedTarget;
            if ($.contains(self.elem[0],related)) return;

            self.elem.removeClass('h');
            if (self.menu) self.timer = window.setTimeout(self.onhide,500);

        },

        //> private void onShow(Event? event)
        onShow : function(event) {
            var self = this;self.menu.publish('show',{align:'right'});
            window.clearTimeout(self.timer);
        },

        //> private void onHide(Event? event)
        onHide : function(event) {
            var self = this;self.menu.publish('hide');
            window.clearTimeout(self.timer);
        },

        onClick : function(event) {
            return this.publish('click',{text:this.text,href:this.href});
        }

    });

    snap.extend(Item,{

        template : function(config,context) {
            context.render(Item.getName());
            context.queue();
        }

    });

    return Item;

});
