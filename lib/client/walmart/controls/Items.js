
define('walmart.controls.Items',function(snap) {

    //> public Items(Object? config)
    var Items = function(config) {

        var self = this;Items.superclass.constructor.call(self,config);
        self.elem.bind('mouseenter',self.onMouseEnter.bind(self));
        self.elem.bind('mouseleave',self.onMouseLeave.bind(self));

        self.elem.delegate('a.ipp-lnk','click',self.onClick.bind(self));
        snap.subscribe('state',self.onState.bind(self),self);

    };

    snap.inherit(Items,'snap.Component');
    snap.extend(Items.prototype,{

        onMouseEnter : function(event) {
            $('.ipp-lyr',this.elem).css({display:'block'});
        },

        onMouseLeave : function(event) {
            $('.ipp-lyr',this.elem).css({display:'none'});
        },

        onClick : function(event) {
            var self = this,target = $(event.target);
            snap.publish('query',target.attr('href'),self);
            $('.ipp-lyr',self.elem).css({display:'none'});
            return false;
        },

        onState : function(message,state) {
            var self = this;snap.extend(self,state.data.results.pager);
            var content = $(snap.fragment(Items,state.data.results.pager)).html();
            self.elem.html(content);
        }

    });

    snap.extend(Items,{

        template : function(config,context) {

            var items = config.items;
            for (var idx = 0,item;(item = items[idx]);idx++) {
                if (item.selected) config.selected = item.size;
            }

            context.render(Items.getName());
            context.queue(config);

        }

    });

    return Items;

});
