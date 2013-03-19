
define('snap.slider.SliderBase',function(snap) {

    //> public SliderBase(Object? config)
    var SliderBase = function(config) {
        SliderBase.superclass.constructor.call(this,config);
    };

    snap.inherit(SliderBase,'snap.Component');
    snap.extend(SliderBase.prototype,{
    });

    snap.extend(SliderBase,{

        template : function(config,context) {
            context.render(SliderBase.getName());
            context.queue(config);
        }

    });

    return SliderBase;

});


