
define('walmart.controls.Pager',function(snap) {

    //> public Pager(Object? config)
    var Pager = function(config) {
        var self = this;Pager.superclass.constructor.call(self,config);
        self.elem.delegate('a','click',self.onPage.bind(self));
        snap.subscribe('state',self.onState.bind(self),self);
    };

    snap.inherit(Pager,'snap.Component');
    snap.extend(Pager.prototype,{

        onPage : function(event) {

            var self = this,target = $(event.target);
            var selected = target.hasClass('selected'),disabled = target.hasClass('disabled');
            if (!selected && !disabled) snap.publish('query',target.prop('href'),self);

            return false;

        },

        onState : function(message,state) {
            var self = this;snap.extend(self,state.data.results.pager);
            var content = $(snap.fragment(Pager,state.data.results.pager)).html();
            self.elem.html(content);
        }

    });


    snap.extend(Pager,{

        template : function(config,context) {

            var page = config.page,pages = config.pages;config.links = [];
            var fdx = Math.max(page - 2,1),ldx = Math.min(fdx + Math.min(pages,5) - 1,pages);
            for (var pdx = fdx;(pdx <= ldx);pdx++) {
                config.links.push({href:config.href.concat('&_pgn=',pdx),page:pdx,selected:(pdx == page)});
            }

            config.prev = {href:config.href.concat('&_pgn=',page - 1),disabled:(page == 1)};
            config.next = {href:config.href.concat('&_pgn=',page + 1),disabled:(page == config.pages)};

            context.render(Pager.getName());
            context.queue(config);

        }

    });

    return Pager;

});
