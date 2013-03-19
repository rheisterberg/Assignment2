
define('walmart.controls.Listings',function(snap) {

    //> public Listings(Object? config)
    var Listings = function(config) {
        var self = this;Listings.superclass.constructor.call(self,config);
        self.elem.delegate('a.state','click',self.onClick.bind(self));
        snap.subscribe('state',self.onState.bind(self),self);
    };

    snap.inherit(Listings,'snap.Component');
    snap.extend(Listings.prototype,{

        onClick : function(event) {
            var self = this,target = $(event.target);
            snap.publish('query',target.attr('href'),self);
            return false;
        },

        onState : function(message,state) {
            var self = this;snap.extend(self,state.data.results.listings);
            var content = $(snap.fragment(Listings,state.data.results.listings)).html();
            self.elem.html(content);
        }

    });

    snap.extend(Listings,{

        template : function(config,context) {

            var states = config.states,state,pipe = ' | ';
            for (var idx = 0;(state = states[idx]);idx++) if (state.selected) states.unshift(states.splice(idx,1)[0]);
            for (var idx = 0;(state = states[idx]);idx++) if (idx < (states.length - 1)) state.pipe = pipe;

            context.render(Listings.getName());

            delete config.states;
            context.queue(config);

        }

    });

    return Listings;

});
