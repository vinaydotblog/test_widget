(function($) {

    "use strict";

    /*
     * Calendar Widget Class Constructor
     * @param options Object
     */
    function CALENDAR(opts) {
        this.init(opts);
    }

    // Make it a global widget
    window.CALENDAR = CALENDAR;

    /*
     * Static Private Properties
     */
    var months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    CALENDAR.prototype = {

        // Class Properties
        wrap: $(),

        today: new Date(),

        /*
         * Initializer
         */
        init: function(opts) {
            this.options = opts;

            // Initial active month
            this.active_month = this.today.getMonth();
            this.active_year = this.today.getFullYear();

            this.setOptions();

        },

        setOptions: function() {
            var self = this;

            this.cur_month = this.today.getMonth();
            this.cur_year = this.today.getFullYear();

            // Container Element
            this.wrap = $(this.options.elem);
            this.label = this.wrap.find(".cal-month-year");
            this.wrap.find(".prev").bind("click.calendar", function() {
                self.switchMonth(false);
            });
            this.wrap.find(".next").bind("click.calendar", function() {
                self.switchMonth(true);
            });
            // this.label.bind("click", function() {
            //     self.switchMonth(null, this.cur_month, this.cur_year);
            // });
            self.switchMonth();
        },


        switchMonth: function(direction) {


            this.setNextMonthYear();

            var cur_month = this.active_month;
            var cur_year = this.active_year;

            // Emmit events whenver there is change in calendar date,
            // so we can later do things by subscribing to these events
            this.wrap.trigger('change', [this.active_month, this.active_year]);

            console.profile("createCal");
            var calendar = this.createCal();
            console.profileEnd("createCal");

            $("#cal-frame", this.wrap)
                .find(".curr")
                .removeClass("curr")
                .addClass("temp")
                .end()
                .prepend(calendar.calendar())
                .find(".temp")
                .fadeOut("slow", function() {
                    $(this).remove();
                });
            this.label.text(calendar.label);
        },

        setNextMonthYear : function(){
            if( this.active_month === 11 ) {
                this.active_month = 0; // set january
                this.active_year += 1; // increment year
            } else {
                this.active_month += 1;
            }
        },


        /*
         * A templating method to bind data to views
         */
        tmpl: function(template, data) {
            var i = 0,
                len = data.length,
                fragment = '';
            // For each item in the object, make the necessary replacement
            function replace(obj) {
                var t, key, reg;
                for (key in obj) {
                    reg = new RegExp('{{' + key + '}}', 'ig');
                    t = (t || template).replace(reg, obj[key]);
                }
                return t;
            }
            for (; i < len; i++) {
                fragment += replace(data[i]);
            }
            return fragment;
        },

        /*
         */
        formatEvents: function(events) {
            return events.map(function(event) {
                var date = new Date(event.date);

                return {
                    month: months[date.getMonth()],
                    day: date.getDate(),
                    title: event.title
                };
            });
        },
        
        
        createCal : function() {
            var month = this.active_month, year = this.active_year;
            var day = 1,
                i, j, haveDays = true,
                startDay = new Date(year, month, day).getDay(),
                daysInMonth = [31, (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                calendar = [];

            if( !this.cache ) {
                this.cache = {};
            }

            if (this.cache[year]) {
                if (this.cache[year][month]) {
                    return this.cache[year][month];
                }
            }
            else {
                this.cache[year] = {};
            }
            i = 0;
            while (haveDays) {
                calendar[i] = [];
                for (j = 0; j < 7; j++) {
                    if (i === 0) {
                        if (j === startDay) {
                            calendar[i][j] = day++;
                            startDay++;
                        }
                    }
                    else if (day <= daysInMonth[month]) {
                        calendar[i][j] = day++;
                    }
                    else {
                        calendar[i][j] = "";
                        haveDays = false;
                    }
                    if (day > daysInMonth[month]) {
                        haveDays = false;
                    }
                }
                i++;
            }
    
    
    
    
            for (i = 0; i < calendar.length; i++) {
                calendar[i] = "<tr><a href='#'><td>" + calendar[i].join("</a></td><td><a href='#'>") + "</td></a></tr>";
            }
    
            calendar = $("<tbody id='cal-content'>" + calendar.join("") + "</tbody").addClass("curr");
    
            $("td a:empty", calendar).parent().addClass("nil");
            if (month === new Date().getMonth()) {
                // $('td', calendar).filter(function () { return $(this).text() === new Date().getDate().toString(); }).addClass("today");
            }
    
            this.cache[year][month] = {
                calendar: function() {
                    calendar.clone().insertAfter('thead');
    
                },
                label: months[month] + " " + year
            };
    
            return this.cache[year][month];
    
        }
    }

})(jQuery);