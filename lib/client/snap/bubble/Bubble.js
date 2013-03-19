
define('snap.bubble.Bubble',function(snap) {

    //> public Bubble(Object? config)
    var Bubble = function(config) {
        var self = this;Bubble.superclass.constructor.call(self,config);
        self.arrow = $('div.win-a',self.elem);
    };

    snap.inherit(Bubble,'snap.window.Window');
    snap.extend(Bubble.prototype,{

        fixed:false,draggable:false,resizable:false,modal:false,

        getAnchor : function(anchor,offset) {

            var self = this,elem = self.elem;
            var width = elem.outerWidth(),height = elem.outerHeight();

            var client = {width:$(window).width(),height:$(window).height()};
            var scroll = {top:$(window).scrollTop(),left:$(window).scrollLeft()};

            var target = snap.extend(anchor.offset(),{width:anchor.outerWidth(),height:anchor.outerHeight()});

            offset.top = Math.min(offset.top,target.top - 20);
            offset.top = Math.max(offset.top,target.top - height + 40);

            self.arrow.removeClass('l r');

            if (target.left < (scroll.left + client.width/2)) {
                offset.left = target.left + target.width + 20;
                self.arrow.css({display:'block'}).addClass('l');
            }
            else {
                offset.left = target.left - width - 20;
                self.arrow.css({display:'block'}).addClass('r');
            }

            self.arrow.css({top:Math.min(Math.max(target.top - offset.top - 5,10),Math.max(height - self.arrow.outerHeight(),0))});;

            return offset;

        },

        getOffset : function(object) {
            var self = this,anchor = object.anchor;
            var offset = Bubble.superclass.getOffset.call(self,object);
            return anchor?self.getAnchor(snap.elem(anchor),offset):offset;
        }

    });

    snap.extend(Bubble,{

        template : function(config,context) {
            context.render(Bubble.getName());
            context.queue();
        }

    });

    return Bubble;

});
