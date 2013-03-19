
define('walmart.aspects.GroupAspect',function(snap) {

    var Checkbox = snap.require('snap.checkbox.Checkbox');
    var DefaultAspect = snap.require('walmart.aspects.DefaultAspect');

    //> public GroupAspect(Object? config)
    var GroupAspect = function(config) {
        GroupAspect.superclass.constructor.call(this,config);
    };

    snap.inherit(GroupAspect,'walmart.aspects.DefaultAspect');
    snap.extend(GroupAspect.prototype,{

        buildFlyout : function(config) {
            var GroupAspectFlyout = snap.require('walmart.aspects.GroupAspectFlyout');
            return new GroupAspectFlyout(config);
        }

    });

    snap.extend(GroupAspect,{

        template : function(config,context) {

            var nodes = config.children;
            for (var idx = 0,node;(node = nodes[idx]);idx++) {
                node.text = node.title;node.href = node.action;
                node.tid = 'snap.checkbox.Checkbox';
            }

            context.render(DefaultAspect.getName());

            delete config.children;
            context.queue(config);

        }

    });

    return GroupAspect;

});
