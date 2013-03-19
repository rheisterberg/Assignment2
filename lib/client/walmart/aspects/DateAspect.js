
define('walmart.aspects.DateAspect',function(snap) {

    var DateAspectCalendar = snap.require('walmart.aspects.DateAspectCalendar');

    //> public DateAspect(Object? config)
    var DateAspect = function(config) {

        var self = this;DateAspect.superclass.constructor.call(self,config);
        self.after = $('input.after',self.elem);self.before = $('input.before',self.elem);
        self.submit = $('input.submit',self.elem).bind('click',self.onSubmit.bind(self));

        self.calendar = new DateAspectCalendar({target:self.elem});
        self.calendar.subscribe('select',self.onSelect.bind(self));

    };

    snap.inherit(DateAspect,'walmart.aspects.DefaultAspect');
    snap.extend(DateAspect.prototype,{

        onSelect : function(message,date) {
            var self = this;self.submit.prop({disabled:false});
            self.submit.removeClass('disabled');
        },

        onSubmit : function(event) {
            var self = this,uri = $uri(self.baseUrl);
            var after = self.after,before = self.before;
            if (after.val()) uri.appendParam(after.prop('name'),after.val());
            if (before.val()) uri.appendParam(before.prop('name'),before.val());
            window.location.href = uri.getUrl();
        },

        buildFlyout : function(config) {
            var DateAspectFlyout = snap.require('walmart.aspects.DateAspectFlyout');
            return new DateAspectFlyout(config);
        },

        destroy : function() {
            var self = this;snap.destroy(self.calendar);
            DateAspect.superclass.destroy.call(self);
        }

    });

    snap.extend(DateAspect,{

        template : function(config,context) {
            context.render(DateAspect.getName());
            context.queue(config);
        }

    });

    return DateAspect;

});
