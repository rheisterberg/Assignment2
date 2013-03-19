
define('walmart.controls.ViewAs',function(snap) {

    //> public ViewAs(Object? config)
    var ViewAs = function(config) {

        var self = this;ViewAs.superclass.constructor.call(self,config);
        self.elem.bind('mouseenter',self.onMouseEnter.bind(self));
        self.elem.bind('mouseleave',self.onMouseLeave.bind(self));

        self.elem.delegate('a.viewas-lnk','click',self.onClick.bind(self));
        snap.subscribe('state',self.onState.bind(self),self);

    };

    snap.inherit(ViewAs,'snap.Component');
    snap.extend(ViewAs.prototype,{

        onMouseEnter : function(event) {
            $('.viewas-lyr',this.elem).css({display:'block'});
        },

        onMouseLeave : function(event) {
            $('.viewas-lyr',this.elem).css({display:'none'});
        },

        onClick : function(event) {
            var self = this;$('.viewas-lyr',self.elem).css({display:'none'});
            var target = $(event.target),type = target.closest('a').attr('type');
            if (type.match(/list|gallery/)) return self.onView(type);
        },

        onView : function(type) {
            var self = this;self.type = type;
            $('.viewas-cur b[class != "viewas-arr"]',self.elem).attr({'class':'viewas-' + type});
            snap.publish('view',type,self);
            return false;
        },

        onState : function(message,state) {
            var self = this;snap.extend(self,state.data.results.viewas);
            var content = $(snap.fragment(ViewAs,state.data.results.viewas)).html();
            self.elem.html(content);
        }

    });

    snap.extend(ViewAs,{

        template : function(config,context) {

            for (var idx = 0,views = config.views,view;(view = views[idx]);idx++) {
                if (view.selected) config.type = view.type;
            }

            context.render(ViewAs.getName());
            context.queue(config);

        }

    });

    return ViewAs;

});
