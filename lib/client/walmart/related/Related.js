
define('walmart.related.Related',function(snap) {

    //> public Related(Object? config)
    var Related = function(config) {
        var self = this;Related.superclass.constructor.call(self,config);
        self.elem.delegate('a','click',self.onClick.bind(self));
        snap.subscribe('state',self.onState.bind(self),self);
    };

    snap.inherit(Related,'snap.Container');
    snap.extend(Related.prototype,{

        onClick : function(event) {
            var self = this,target = $(event.target);
            snap.publish('query',target.attr('href'),self);
            return false;
        },

        onState : function(message,state) {
            var self = this;snap.extend(self,state.data.results.related);
            self.elem.html($(snap.fragment(Related,state.data.results.related)).html());
        }

    });

    snap.extend(Related,{

        template : function(config,context) {

            var searches = config.searches;
            var match = new RegExp('(' + '(^|\\s+)' + config.keyword + ')','i');
            for (var idx = 0,len = searches.length,search;(search = searches[idx]);idx++) {
                search.related = search.text.replace(match,'<i>$1</i>');
                if (idx < (len - 1)) search.related = search.related.concat(', ');
            }

            context.render(Related.getName());

            delete config.searches;
            context.queue(config);

        }

    });

    return Related;

});
