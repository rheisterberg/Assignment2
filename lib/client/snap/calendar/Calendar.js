
define('snap.calendar.Calendar',function(snap) {

    var Window = snap.require('snap.window.Window');

    var months = 'January,February,March,April,May,June,July,August,September,October,November,December'.split(',');
    var monthdays = '31,28,31,30,31,30,31,31,30,31,30,31'.split(',');

    var dateRegEx = /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/;
    var dateFormat = 'mm/dd/yyyy';

    //> public Calendar(Object? config)
    var Calendar = function(config) {

        var self = this,today = new Date();
        self.today = new Date(today.getFullYear(),today.getMonth(),today.getDate());

        Calendar.superclass.constructor.call(self,config);
        self.elem.bind('mousedown',self.onMouseDown.bind(self));

        self.scroller = $('<div class="scrlr"/>').appendTo(self.elem);
        self.prev = $('<div class="prev"><div class="arrows"/></div>').appendTo(self.elem).bind('click',self.onPrevScroll.bind(self));
        self.next = $('<div class="next"><div class="arrows"/></div>').appendTo(self.elem).bind('click',self.onNextScroll.bind(self));

        self.months = $('<div class="months"/>').appendTo(self.scroller);
        self.months.append(self.buildMonth(self.starting || self.ending || self.today));
        self.months.delegate('td.day','click',self.onDate.bind(self));

    };

    snap.inherit(Calendar,'snap.Component');
    snap.extend(Calendar.prototype,{

        classes:{elem:'calendar'},detached:true,
        
        buildWeek : function(body) {
            var week = $('<tr class="week"/>').appendTo(body);
            for (var day = 0;(day < 7);day++) week.append('<td/>');
            return week;
        },

        buildMonth : function(date) {

            var self = this,year = self.year = date.getFullYear();
            var month = self.month = date.getMonth(),days = monthdays[month];
            if ((month == 1) && ((((year % 4) == 0 && ((year % 100) != 0)) || ((year % 400) == 0)))) days++;

            self.current = new Date(year,month,1);

            var table = $(snap.fragment('snap.calendar.Month',{}));
            self.title = $('div.title',table);self.title.html(months[month].concat(' ',year));

            var body = $('tbody',table),rows = body[0].rows,today = self.today.getTime(),day = self.current.getDay();
            var starting = self.starting?self.starting.getTime():null,ending = self.ending?self.ending.getTime():null;

            for (var idx = 0;(idx < days);idx++) {

                var rdx = Math.floor((idx + day)/7),row = (rdx < rows.length)?rows[rdx]:self.buildWeek(body)[0];
                var cdx = (idx + day) % 7,cell = $(row.cells[cdx]).addClass('day').append((idx + 1).toString());

                var date = new Date(year,month,idx + 1),time = date.getTime();
                if ((starting && (time < starting)) || (ending && (time > ending))) cell.addClass('ds');
                else if (time == today) cell.css({'font-weight':'bold'});

            }

            self.setPrev();
            self.setNext();

            return table;

        },

        onMouseDown : function(event) {
            var self = this,target = event.target;
            return !$.contains(self.elem,target);
        },

        onDate : function(event) {

            var self = this,target = $(event.target);
            if (target.hasClass('ds')) return false;

            var cdx = event.target.cellIndex,rdx = event.target.parentNode.rowIndex - 2;
            var date = new Date(self.current.getTime());date.setDate(rdx*7 + cdx - date.getDay() + 1);
            self.publish('select',date,true);

            return false;

        },

        setPrev : function() {
            var self = this,date = new Date(self.year,self.month,0);
            var starting = self.starting?self.starting.getTime():null;
            self.prev.toggleClass('ds',((starting != null) && (date.getTime() < starting)));
        },

        onPrevScroll : function(event) {

            var self = this,month;
            if (self.prev.hasClass('ds')) return;

            self.months.prepend(month = self.buildMonth(new Date(self.year,self.month - 1,1)));
            self.scroller.prop('scrollLeft',month.width()).animate({scrollLeft:0},{complete:self.onPrevDone.bind(self),duration:400});

            return false;

        },

        onPrevDone : function() {
            var self = this;
            self.months.children().last().remove();
            self.scroller.prop({scrollLeft:1});
        },

        setNext : function() {
            var self = this,date = new Date(self.year,self.month + 1,1);
            var ending = self.ending?self.ending.getTime():null;
            self.next.toggleClass('ds',((ending != null) && (date.getTime() > ending)));
        },

        onNextScroll : function(event) {

            var self = this,month;
            if (self.next.hasClass('ds')) return;

            self.months.append(month = self.buildMonth(new Date(self.year,self.month + 1,1)));
            self.scroller.animate({scrollLeft:month.position().left},{complete:self.onNextDone.bind(self),duration:400});

            return false;
        },

        onNextDone : function() {
            var self = this;
            self.months.children().first().remove();
            self.scroller.prop({scrollLeft:1});
        },

        format : function(date) {
            var year = date.getFullYear(),month = date.getMonth() + 1,day = date.getDate();
            return month.toString().concat('/',day,'/',year);
        },

        show : function(object) {

            var self = this;self.months.children().remove();
            self.months.append(self.buildMonth(object.current));

            $(document).bind('mousedown',self.onhide = self.onHide.bind(self));

            self.popup = self.popup || new Window({fixed:false,closable:false,resizable:false,children:[self]});
            self.popup.show(object);

        },

        onHide : function(event) {
            this.hide();
        },

        hide : function(object) {
            $(document).unbind('mousedown',this.onhide);
            this.popup.hide();
        }

    });

    return Calendar;

});
