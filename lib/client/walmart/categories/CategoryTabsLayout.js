
define('walmart.categories.CategoryTabsLayout',function(snap) {

    var VerticalScroller = snap.require('snap.scrollbar.vertical.VerticalScroller');

    //> public CategoryTabsLayout(Object? config)
    var CategoryTabsLayout = function(config) {
        CategoryTabsLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(CategoryTabsLayout,'snap.Layout');
    snap.extend(CategoryTabsLayout.prototype,{

        render : function() {

            var self = this;self.timestamp = new Date().getTime();
            CategoryTabsLayout.superclass.render.call(self);

            self.head = $('.cat-t-h',self.target);self.frame = self.head.frame();
            self.head.delegate('.cat-t-t','mouseenter',self.onEnterTab.bind(self));

            self.body = $('.cat-t-b',self.target);

            self.container.subscribe('select',self.selectTab.bind(self));
            self.container.subscribe('deselect',self.deselectTab.bind(self));

            self.scroller = new VerticalScroller({scrollable:self.container,target:self.head});
            self.scrollbar = self.scroller.scrollbar;

            self.msie = ($.browser.msie && ($.browser.version <= 7));
            if (self.msie) self.body.prependTo(document.body);

            self.head.bind('mouseenter',self.onEnterHead.bind(self));
            self.head.bind('mouseleave',self.onLeaveHead.bind(self));

            self.body.bind('mouseenter',self.onEnterBody.bind(self));
            self.body.bind('mouseleave',self.onLeaveBody.bind(self));

            $("body").bind("hidePopOvers",self.onHide.bind(self));

        },

        getHead : function(component) {

            var self = this,tid = component.elem.attr('id');
            var head = $('.cat-t-t[tid="'.concat(tid,'"]'),self.head);
            component.head = (head.length)?head:self.addHead(component);
            component.head.attr({oid:component.oid}).addClass('f',component.finger || false);

            var anchor = $('.cat-t-a',component.head);
            anchor.bind('mouseenter',component.onEnter.bind(component));
            anchor.bind('click',component.onClick.bind(component));

        },

        addHead : function(component) {
            var head = $('<div class="cat-t-t"><a class="cat-t-a"/></div>');
            $('a',head).append(component.name).attr({'href':component.href});
            return head;
        },

        getBody : function(component) {
            var self = this,body = $('.cat-t-c[oid="'.concat(component.oid,'"]'),self.body);
            return (body.length <= 0)?component.elem:null;
        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {

            var self = this;self.getHead(component);
            self.body.append(component.elem);

            if (self.ready && !defer) self.layout();

        },

        //> public void removeComponent(Object component,boolean defer)
        removeComponent : function(component,defer) {
            var self = this;component.head.remove();
            CategoryTabsLayout.superclass.removeComponent.call(self,component,defer);
            if (self.active == component) delete self.active;
        },

        layout : function(force) {

            var self = this;CategoryTabsLayout.superclass.layout.call(self,force);
            if (!self.dirty || !self.children.fwd) return;

            for (var node = self.children.fwd;(node);node = node.siblings.fwd) {
                var head = node.head[0],width = head.offsetWidth,scroll = head.scrollWidth;
                node.head.attr({title:(width < scroll)?node.head.text():null});
            }

        },

        onEnterHead: function(event) {
            this.disabled = false;
            this.onHideTimer();
        },

        onLeaveHead: function(event) {
            this.disabled = true;
            this.setHideTimer(400);
            this.cancelShowTimer();
        },

        onEnterTab: function(event) {
            this.setHideTimer(400);
        },

        onEnterBody: function(event) {
            this.cancelHideTimer();
            this.cancelShowTimer();
        },

        onLeaveBody : function(event) {
            var self = this,onleave = self.active?self.active.onLeave():true;
            if (onleave) this.setHideTimer(0);
        },

        onHide : function(event,data) {
            var self = this,from = data?data.from:null;
            if (from && snap.isString(from) && !from.match(/CategoryTabs/)) self.onHideTimer();
        },

        setHideTimer : function(ticks) {
            var self = this;self.cancelHideTimer();
            self.hidetimer = window.setTimeout(self.onHideTimer.bind(self),ticks);
        },

        cancelHideTimer : function() {
            window.clearTimeout(this.hidetimer);
        },

        onHideTimer : function() {

            var self = this,active = self.active;
            if (active) self.toggleTab(active,false);

            self.body.css({display:'none'});
            self.scrollbar.show();

            delete self.active;

        },

        setShowTimer : function(message,tab) {
            var self = this;self.cancelShowTimer();
            self.showtimer = window.setTimeout(self.onSelectTab.bind(self,message,tab),250);
        },

        cancelShowTimer : function() {
            window.clearTimeout(this.showtimer);
        },

        item : function(index) {
            var self = this,component = self.children[index];
            return component?component.head.parent():null;
        },

        selectTab : function(message,tab) {
            this.setShowTimer(message,tab);
        },

        onScrollTab : function(delta) {
            var self = this,scrollTop = self.head.prop('scrollTop');
            self.head.prop({scrollTop:scrollTop + delta});
            self.scrollbar.layout();
        },

        onSelectTab : function(message,tab) {

            var self = this,timestamp = new Date().getTime();
            if ((timestamp - self.timestamp) < 250) return self.setShowTimer(message,tab);
            else self.timestamp = timestamp;

            var position = tab.head.position().top;
            if (position < 0) self.onScrollTab(position);
            else if (position > (self.height - 24)) self.onScrollTab(position - (self.height - 24));

            var width = self.head.outerWidth(),offset = self.msie?self.target.offset():{top:-15,left:0};
            self.body.css({top:offset.top,left:offset.left + width - 3,display:'block'});

            if (self.disabled) return;
            else if (self.active) self.toggleTab(self.active,false);
            self.toggleTab(self.active = tab,true);

            $("body").trigger("hidePopOvers",{from:'CategoryTabs'});

            self.scrollbar.hide();

            self.cancelShowTimer();
            self.cancelHideTimer();

        },

        deselectTab : function(message,tab) {

            var self = this;self.toggleTab(tab,false);
            if (tab != self.active) return;

            self.body.css({display:'none'});
            delete self.active;

        },

        toggleTab : function(tab,active) {

            tab.head.toggleClass(($.browser.msie && ($.browser.version < 9))?'b':'s',active);
            tab.elem.css({display:active?'block':'none'});

            tab.publish(active?'show':'hide');

        }

    });

    return CategoryTabsLayout;

});
