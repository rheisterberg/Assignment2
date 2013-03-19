
define('snap.carousel.VerticalCarouselLayout',function(snap) {

    //> public VerticalCarouselLayout(Object? config)
    var VerticalCarouselLayout = function(config) {
        VerticalCarouselLayout.superclass.constructor.call(this,config);
    };

    snap.inherit(VerticalCarouselLayout,'snap.Layout');
    snap.extend(VerticalCarouselLayout.prototype,{

        //> protected void render()
        render : function() {

            var self = this,target = self.target;
            target.append(self.template()).addClass('vcrsl');

            self.body = $('.vcrsl-b',target);
            self.list = $('.vcrsl-ul',target);

            self.head = $('.vcrsl-h',target);
            self.foot = $('.vcrsl-f',target);

            self.head.bind('click',self.onScrollUp.bind(self));
            self.foot.bind('click',self.onScrollDown.bind(self));

        },

        //> public void addComponent(Object component,boolean defer)
        addComponent : function(component,defer) {
            var self = this,elem = component.elem;
            self.list.append($('<li class="vcrsl-li"/>').append(elem));
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

            var self = this,target = self.target,body = self.body,height = body.height();
            if (height > self.target.height()) body.height(height = (target.height() - self.head.height() - self.foot.height()));

            var offset = body.prop('scrollTop'),last = self.item(self.children.length - 1);
            var maximum = last?last.position().top + last.height() - height:0;

            var display = (self.container.fixed || (maximum > 0))?'block':'none';
            self.head.css({visibility:(offset > 0)?'visible':'hidden',display:display});
            self.foot.css({visibility:(offset < maximum)?'visible':'hidden',display:display});

            VerticalCarouselLayout.superclass.layout.call(self,force);

        },

        onScrollUp : function() {

            var self = this,body = self.body,top = body.prop('scrollTop');
            for (var idx = 0,item;((item = self.item(idx)) && ((item.position().top + item.height()) < top));idx++);

            var last = self.item(self.children.length - 1);
            var maximum = last?last.position().top + last.height() - body.height():0;
            var position = Math.max(Math.min(item.position().top + item.height() - body.height(),maximum),0);

            body.animate({scrollTop:position},{complete:self.layout.bind(self),duration:500});

        },

        onScrollDown : function() {

            var self = this,body = self.body,bottom = body.prop('scrollTop') + body.height();
            for (var idx = 0,item;((item = self.item(idx)) && ((item.position().top + item.height()) <= bottom));idx++);

            var last = self.item(self.children.length - 1);
            var maximum = last?last.position().top + last.height() - body.height():0;
            var position = Math.max(Math.min(item.position().top,maximum),0);

            body.animate({scrollTop:position},{complete:self.layout.bind(self),duration:500});

        }

    });

    snap.extend(VerticalCarouselLayout,{

        template : function(config,context) {
            context.render(VerticalCarouselLayout.getName());
        }

    });

    return VerticalCarouselLayout;

});
