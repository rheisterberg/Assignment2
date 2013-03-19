
define('snap.carousel.HorizontalCarouselLayout',function(snap) {

    //> public HorizontalCarouselLayout(Object? config)
    var HorizontalCarouselLayout = function(config) {
        HorizontalCarouselLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(HorizontalCarouselLayout,'snap.Layout');
    snap.extend(HorizontalCarouselLayout.prototype,{

        //> protected void render()
        render : function() {

            var self = this,target = self.target;
            target.append(self.template());

            self.body = $('div.hcrsl-b',target);
            self.list = $('.hcrsl-ul',target);

            self.left = $('.hcrsl-l',target);
            self.right = $('.hcrsl-r',target);

            self.left.bind('click',self.onScrollLeft.bind(self));
            self.right.bind('click',self.onScrollRight.bind(self));

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {
            var self = this,elem = component.elem;
            self.list.append($('<li class="hcrsl-li"/>').append(elem));
            if (self.ready && !defer) self.layout();
        },

        //> public void removeComponent(Object component,boolean defer)
        removeComponent : function(component,defer) {
            var self = this,elem = component.elem;elem.parent().remove();
            if (self.ready && !defer) self.layout();
        },

        item : function(index) {
            var self = this,component = self.children[index];
            return component?component.elem.parent():null;
        },

        layout : function(force) {

            var self = this,target = self.target,body = self.body,width = body.width();
            if (width > self.target.width()) body.width(width = (target.width() - self.left.width() - self.right.width()));
            self.left.height(body.height());self.right.height(body.height());

            var offset = body.prop('scrollLeft'),last = self.item(self.children.length - 1);
            var maximum = last?last.position().left + last.width() - width:0;

            var display = (self.container.fixed || (maximum > 0))?'block':'none';
            self.left.css({visibility:(offset > 0)?'visible':'hidden',display:display});
            self.right.css({visibility:(offset < maximum)?'visible':'hidden',display:display});

            HorizontalCarouselLayout.superclass.layout.call(self,force);

        },

        onScrollLeft : function() {

            var self = this,body = self.body,left = body.prop('scrollLeft');
            for (var idx = 0,item;((item = self.item(idx)) && ((item.position().left + item.width()) < left));idx++);

            var last = self.item(self.children.length - 1);
            var maximum = last?last.position().left + last.width() - body.width():0;
            var position = Math.max(Math.min(item.position().left + item.width() - body.width(),maximum),0);

            body.animate({scrollLeft:position},{complete:self.layout.bind(self),duration:500});

        },

        onScrollRight : function() {

            var self = this,body = self.body,right = body.prop('scrollLeft') + body.width();
            for (var idx = 0,item;((item = self.item(idx)) && ((item.position().left + item.width()) <= right));idx++);

            var last = self.item(self.children.length - 1);
            var maximum = last?last.position().left + last.width() - body.width():0;
            var position = Math.max(Math.min(item.position().left,maximum),0);

            body.animate({scrollLeft:position},{complete:self.layout.bind(self),duration:500});

        }

    });

    snap.extend(HorizontalCarouselLayout,{

        template : function(config,context) {
            context.render(HorizontalCarouselLayout.getName());
        }

    });

    return HorizontalCarouselLayout;

});
