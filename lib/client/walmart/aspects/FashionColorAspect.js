
define('walmart.aspects.FashionColorAspect',function(snap) {

    //> public FashionColorAspect(Object? config)
    var FashionColorAspect = function(config) {
        var self = this;FashionColorAspect.superclass.constructor.call(self,config);
        self.elem.delegate('a.clr-a','click',self.onColor.bind(self));
    };

    snap.inherit(FashionColorAspect,'walmart.aspects.DefaultAspect');
    snap.extend(FashionColorAspect.prototype,{

        getTarget : function() {
            return this.clrsw || (this.clrsw = $('ul.clrsw',this.elem));
        },

        onColor : function(event) {
            var self = this,uri = $uri($(event.target).attr('href'));
            snap.publish('query',uri.getUrl(),self);
            return false;
        }

    });

    snap.extend(FashionColorAspect,{

        template : function(config,context) {

            var nodes = config.children = config.children || config.values;delete config.values;
            for (var idx = 0,node;(node = nodes[idx]);idx++) {
                node.tid = 'walmart.aspects.FashionColorAspectValue';
            }

            context.render(FashionColorAspect.getName());

            delete config.children;
            context.queue(config);

        }

    });

    return FashionColorAspect;

});
