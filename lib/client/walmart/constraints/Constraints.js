
define('walmart.constraints.Constraints',function(snap) {

    var Constraints = function(config) {
        var self = this;Constraints.superclass.constructor.call(self,config);
        self.elem.delegate('a','click',self.onClick.bind(self));
        snap.subscribe('state',self.onState.bind(self),self);
    };

    snap.inherit(Constraints,'snap.Component');
    snap.extend(Constraints.prototype,{

        onClick : function(event) {
            var self = this,target = $(event.target);
            snap.publish('query',target.attr('href'),self);
            return false;
        },

        onState : function(message,state) {
            var self = this;snap.extend(self,state.data.constraints);
            var content = $(snap.fragment(Constraints,state.data.constraints)).html();
            self.elem.html(content);
        }

    });

    snap.extend(Constraints,{

        template : function(config,context) {
            context.render(Constraints.getName());
            context.queue(config);
        }

    });

    return Constraints;

});
