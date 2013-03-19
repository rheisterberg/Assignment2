
define('walmart.aspects.DateAspectCalendar',function(snap) {

    var Calendar = snap.require('snap.calendar.Calendar');

    //> public DateAspectCalendar(Object? config)
    var DateAspectCalendar = function(config) {

        var self = this;self.calendar = new Calendar({detached:true});
        DateAspectCalendar.superclass.constructor.call(self,config);

        self.after = $('input.after',self.target).bind('click',self.onAfter.bind(self));
        self.before = $('input.before',self.target).bind('click',self.onBefore.bind(self));

        self.calendar.starting = self.after.val()?new Date(self.after.val()):null;
        self.calendar.ending = self.before.val()?new Date(self.before.val()):null;

        self.calendar.subscribe('select',self.onCalendar.bind(self));

    };

    snap.inherit(DateAspectCalendar,'snap.Observable');
    snap.extend(DateAspectCalendar.prototype,{

        onAfter : function(event) {
            var self = this,today = new Date();
            var after = self.after;self.selected = after;
            var offset = after.offset();offset.left += after.outerWidth() + 5;
            self.calendar.starting = new Date(today.getFullYear(),today.getMonth(),today.getDate());
            var current = after.val()?new Date(after.val()):self.calendar.starting;
            self.calendar.show({current:current,offset:offset});
            return false;
        },

        onBefore : function(event) {
            var self = this,today = new Date();
            var before = self.before;self.selected = before;
            var offset = before.offset();offset.left += before.outerWidth() + 5;
            self.calendar.starting = self.calendar.starting || new Date(today.getFullYear(),today.getMonth(),today.getDate());
            var current = before.val()?new Date(before.val()):self.calendar.starting;self.calendar.ending = null;
            self.calendar.show({current:current,offset:offset});
            return false;
        },

        onCalendar : function(message,date) {
            var self = this,calendar = self.calendar;
            if (self.selected == self.after) self.after.val(calendar.format(calendar.starting = date));
            else if (self.selected == self.before) self.before.val(calendar.format(calendar.ending = date));
            self.publish('select',date);
            self.calendar.hide();
        },

        destroy : function() {
            var self = this;snap.destroy(self.calendar);
            DateAspectCalendar.superclass.destroy.call(self);
        }

    });

    return DateAspectCalendar;

});

