
define('walmart.aspects.DateAspectFlyout',function(snap) {

    var DateAspectCalendar = snap.require('walmart.aspects.DateAspectCalendar');

    //> public DateAspectFlyout(Object? config)
    var DateAspectFlyout = function(config) {
        var self = this;DateAspectFlyout.superclass.constructor.call(self,config);
        self.calendar = new DateAspectCalendar({target:self.elem});
    };

    snap.inherit(DateAspectFlyout,'walmart.aspects.DefaultAspectFlyout');
    snap.extend(DateAspectFlyout.prototype,{

        destroy : function() {
            var self = this;snap.destroy(self.calendar);
            DateAspectFlyout.superclass.destroy.call(self);
        }

    });

    snap.extend(DateAspectFlyout,{

        template : function(config,context) {
            context.render(DateAspectFlyout.getName());
            context.queue(config);
        }

    });

    return DateAspectFlyout;

});