
define('walmart.controls.SortBy',function(snap) {

    //> public SortBy(Object? config)
    var SortBy = function(config) {

        var self = this;SortBy.superclass.constructor.call(self,config);
        self.elem.bind('mouseenter',self.onMouseEnter.bind(self));
        self.elem.bind('mouseleave',self.onMouseLeave.bind(self));

        self.elem.delegate('a.sortby-lnk','click',self.onClick.bind(self));
        snap.subscribe('state',self.onState.bind(self),self);

    };

    snap.inherit(SortBy,'snap.Component');
    snap.extend(SortBy.prototype,{

        onMouseEnter : function(event) {
            $('.sortby-lyr',this.elem).css({display:'block'});
        },

        onMouseLeave : function(event) {
            $('.sortby-lyr',this.elem).css({display:'none'});
        },

        onClick : function(event) {
            var self = this,target = $(event.target);
            snap.publish('query',target.attr('href'),self);
            $('.sortby-lyr',self.elem).css({display:'none'});
            return false;
        },

        onState : function(message,state) {
            var self = this;snap.extend(self,state.data.results.sortby);
            var content = $(snap.fragment(SortBy,state.data.results.sortby)).html();
            self.elem.html(content);
        }

    });

    snap.extend(SortBy,{

        template : function(config,context) {

            var href = config.href,options = config.options;
            for (var idx = 0,option;(option = options[idx]);idx++) {
                option.href = href.concat('&',option.href);
                if (option.selected) config.selected = option.text;
            }

            context.render(SortBy.getName());
            context.queue(config);

        }

    });

    return SortBy;

});
