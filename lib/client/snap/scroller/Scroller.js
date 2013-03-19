
define('snap.scroller.Scroller',function(snap) {

    //> public Scroller(Object? config)
    var Scroller = function(config) {

        var self = this;self.window = $(window);
        Scroller.superclass.constructor.call(self,config);

        self.window.bind('load',self.onLoad.bind(self));
        self.window.bind('resize',self.onResize.bind(self));
        self.window.bind('scroll',self.onScroll.bind(self));

    };

    snap.inherit(Scroller,'snap.Component');
    snap.extend(Scroller.prototype,{

        classes:{elem:'scroller'},

        onLoad : function(event) {
            var self = this;self.elem.prependTo(document.body);
            self.elem.css({top:Math.round((self.window.height() - self.elem.height())/2)});
            self.elem.bind('click',self.onClick.bind(self));
        },

        onResize : function(event) {
            this.elem.css({top:Math.round((this.window.height() - this.elem.height())/2)});
        },

        onScroll : function(event) {
            var self = this,scrollTop = self.window.scrollTop();
            self.elem.css({visibility:(scrollTop > 0)?'visible':'hidden'});
        },

        onClick : function(event) {
            $('html, body').animate({scrollTop:0},{duration:1000});
            snap.publish('rover',{an:'Dash.BackToTop.click'},self);
        }

    });

    new Scroller();

    return Scroller;

});
