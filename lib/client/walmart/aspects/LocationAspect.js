
define('walmart.aspects.LocationAspect',function(snap) {

    var Radio = snap.require('snap.radio.Radio');
    var DefaultAspect = snap.require('walmart.aspects.DefaultAspect');

    //> public LocationAspect(Object? config)
    var LocationAspect = function(config) {
        LocationAspect.superclass.constructor.call(this,config);
    };

    snap.inherit(LocationAspect,'walmart.aspects.DefaultAspect');
    snap.extend(LocationAspect.prototype,{

        classes:{elem:'loc'},

        buildFlyout : function(config) {
            var LocationAspectFlyout = snap.require('walmart.aspects.LocationAspectFlyout');
            return new LocationAspectFlyout(config);
        }

    });

    snap.extend(LocationAspect,{

        template : function(config,context) {

            var name = config.name,tiled = config.display.match(/TILED/);
            var nodes = config.children = config.children || config.values;delete config.values;
            for (var idx = 0,node;(node = nodes[idx]);idx++) {
                node.name = name;node.text = node.title;node.href = node.url;
                node.tid = 'snap.radio.Radio';
            }

            context.render(DefaultAspect.getName());
            
            delete config.children;
            context.queue(config);

        }

    });

    return LocationAspect;

});

