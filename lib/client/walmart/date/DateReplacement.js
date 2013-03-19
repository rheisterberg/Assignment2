
define('search.date.DateReplacement',function(snap) {

    var DateReplacement = function(config) {
        DateReplacement.superclass.constructor.call(this,config);
    };

    snap.inherit(DateReplacement,'snap.Observable');
    snap.extend(DateReplacement.prototype,{
        dateAttr: "",
        dateElemSelector: "",
        offsetMin: new Date().getTimezoneOffset(),
        interval: null,

        // Language settings
        secondsTerm: ["s left","s left"],
        minutesTerm: ["m left","m left"],
        hoursTerm: ["h left","h left"],
        daysTerm: ["d left","d left"],
        lessTerm: "",
        endedTerm: "Ended",
        endsTomorrowTerm: "Tomorrow",
        todayTerm: "Today",
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        // CSS Classes to add
        alertClass: "alert", // under an hour left
        boldClass: "bold", // under a day left

        startLoop: function(timeout, dateElemSelector, dateAttr, offsetMin){
            var self = this;
            if(timeout<0) {
                self.replaceDate(dateElemSelector, dateAttr, offsetMin);
            } else {
                self.interval = window.setInterval(function(){
                    self.replaceDate(dateElemSelector, dateAttr, offsetMin);
                }, timeout);
            }
        },

        stopLoop: function(){
            window.clearInterval(this.interval);
        },

        replaceDate: function(dateElemSelector, dateAttr, offsetMin){
            var self = this;
            dateElemSelector = dateElemSelector || self.dateElemSelector;
            dateAttr = dateAttr || self.dateAttr;
            offsetMin = offsetMin || self.offsetMin;

            if(!dateElemSelector || !dateAttr){ return; }

            dateElemSelector = (typeof(dateElemSelector) == "string") ? $(dateElemSelector) : dateElemSelector;
            dateElemSelector.each(function(){
                var e = $(this), dateMs = e.attr(dateAttr), spanContent, addClass = "";
                e.removeClass(self.alertClass).removeClass(self.boldClass);
                if(dateMs){
                    var timeMs = parseInt(dateMs), endDate = new Date(timeMs), diffMs = self.diffMs(timeMs);
                    if(diffMs || diffMs == 0){
                        var diffData = self.structureDiffData(diffMs);

                        if(diffMs < 1000){
                            var timeString = self.endedTerm;
                        } else {
                            var timeString = self.createAbsoluteTime(endDate, diffData);

                            if(!diffData.days){
                                if(diffData.hours){
                                    addClass = self.boldClass;
                                } else {
                                    addClass = self.alertClass;
                                }
                            }
                        }

                        var toolTip = self.createRelativeTime(endDate, diffData);
                        var spanTime = "<span class='absTime'>" + toolTip + "</span>";
                        spanContent = timeString + spanTime;
                    }
                    e.html(spanContent).addClass(addClass);
                }
            });
        },

        diffMs: function(timeMs){
            var date = new Date(timeMs);
            if(isNaN(date.getTime())){return false;}
            var now = new Date();
            var diffMs = date.getTime() - now.getTime();
            return diffMs;
        },

        createAbsoluteTime: function(date, diffData){
            var self = this, timeString = "";
            /*
            When have < 1 minute, countdown seconds
            §  Ex: 53 seconds
            o   When have < 1 hour, show # of minutes
            §  Ex: 24 minutes
            o   When have < 1 day, show # of hours
            §  Ex: 14 hours
            o   When have > or = to 1 day, show # of days
            §  Ex: 22 days
            */
            if(diffData.days > 0){
                if(diffData.hours > 0){
                    timeString = self.timeLeft(diffData.days, self.daysTerm);
                }else{
                    timeString = self.timeLeft(diffData.days, self.daysTerm);
                }
            } else if(diffData.hours > 0){
                timeString = self.timeLeft(diffData.hours, self.hoursTerm, true);
            } else if(diffData.minutes > 0){
                timeString = self.timeLeft(diffData.minutes, self.minutesTerm);
            } else if(diffData.seconds > 0) {
                timeString = self.timeLeft(diffData.seconds, self.secondsTerm);
            } else {
                timeString = self.endedTerm;
            }
            return timeString;
        },

        createRelativeTime: function(date, diffData){
            var self = this, timeString, hours = date.getHours(), amPm = self.AM;
            if(hours >12){
                hours = hours - 12;
                amPm = self.PM;
            } else if (hours == 12){
                amPm = self.PM;
            } else if(hours == 0){
                // 12 midnight
                hours = 12;
            }

            if(diffData.days == 0 && new Date().getDate() != date.getDate()){
                diffData.days = 1;
            }

            if(diffData.days){
                if(diffData.days > 6){
                    // 5/21 2PM
                    timeString = (date.getMonth() + 1) + "/" + date.getDate();
                } else if(diffData.days > 1){
                    // Monday, 5PM
                    timeString = self.getDay(date);
                } else {
                    // Tomorrow, 7PM
                    timeString = self.endsTomorrowTerm;
                }
                timeString += ", " + hours + amPm;
            } else {
                var minutes = date.getMinutes();
                minutes = (minutes > 9) ? minutes : "0" + minutes;
                // today at 3pm
                timeString = self.todayTerm + " " + hours +":" + minutes + amPm;
            }

            return timeString;
        },

        timeLeft: function(time, units, round){
            var i = (time == 1) ? 0 : 1;

            var plus = (round) ? "+ " : " ";
            var timeString = time + units[i] || "";

            return timeString;
        },

        timeLeftDaysHours: function(days, hours, units, round){
            var i = (time == 1) ? 0 : 1;

            var plus = (round) ? "+ " : " ";
            var timeString = time + units[i] || "";

            return timeString;
        },
        lessThan: function(time, units, smallerTime){
            var self = this, time = (smallerTime && smallerTime > 0) ? time+1: time,
                i = (time == 1) ? 0 : 1;
            var timeString = (!smallerTime || smallerTime == 0) ? "&nbsp;" : self.lessTerm;
            timeString += "&nbsp;" + time + " " + units[i] || "";
            return timeString;
        },

        getDay: function(date){
            var self = this, day = date.getDay();
            return self.days[day];
        },

        structureDiffData: function(timeDiffMs){
            var secs = timeDiffMs/1000;
            var days = parseInt(secs / (24 * 60 * 60));
            var hourDivisor = secs % (24 * 60 * 60);
            var hours = Math.floor(hourDivisor / (60 * 60));
            var minDivisor = secs % (60 * 60);
            var minutes = Math.floor(minDivisor / 60);
            var secDivisor = minDivisor % 60;
            var seconds = Math.floor(secDivisor);

            var data = {
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            };
            return data;
        }
    });

    return DateReplacement;
});
