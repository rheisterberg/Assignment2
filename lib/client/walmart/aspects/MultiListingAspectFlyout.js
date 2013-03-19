
define('walmart.aspects.MultiListingAspectFlyout',function(snap) {

    var Content = snap.require('snap.Content');

    //> public MultiListingAspectFlyout(Object? config)
    var MultiListingAspectFlyout = function(config) {
        MultiListingAspectFlyout.superclass.constructor.call(this,config);
    };

    snap.inherit(MultiListingAspectFlyout,'snap.checkbox.Checkbox');
    snap.extend(MultiListingAspectFlyout.prototype,{

    });

    snap.extend(MultiListingAspectFlyout,{

        template : function(config,context) {

            var minimum = '<input type="text" name="_samilow" size="5" class="listing">';
            var maximum = '<input type="text" name="_samihi" size="5" class="listing">';
            snap.extend(config,{Minimum:minimum,Maximum:maximum});

            context.render(MultiListingAspectFlyout.getName());
            context.queue(config);

        }

    });

    return MultiListingAspectFlyout;

});

