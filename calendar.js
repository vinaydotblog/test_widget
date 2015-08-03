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

    var weeks = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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

            this.wrap = $(this.options.elem).find('.cal-wrapper')

            this.setOptions();

        },

        showEvents : function(){
            var self = this;
            this.options.loadEvents(function(events){

                var canvas = $(self.options.event_canvas), template = canvas.html();

                var formattedEvents = self.formatEvents(events)
                var events_html = self.tmpl( template, formattedEvents);
                canvas.parent().html(events_html);

                self.highlightEvents(formattedEvents);
            });
        },

        highlightEvents : function(events){
            var self = this;
            events.forEach(function(obj){
                var selector = "[data-id=" + obj.day + "]";

                $(selector, self.wrap).addClass('has-event');
            });
        },

        setOptions: function() {
            var self = this;

            this.cur_month = this.today.getMonth();
            this.cur_year = this.today.getFullYear();


            self.switchMonth();
        },

        buildHtml : function(){

            var container = $('<div>', { 'class' : 'cal-container' });

            var calendarHead = $('<div>', { 'class' : 'cal-header' });

            var title = $('<span>', { 'class' : 'cal-month-year' });

            var prev = $('<a>', { 'href' : '#', 'class' : 'prev', 'text' : 'Prev' });
            var next = $('<a>', { 'href' : '#', 'class' : 'next', 'text' : 'next' });

            calendarHead
                .append(prev)
                .append(title)
                .append(next);

            container
                .append(calendarHead)
                .append(this.calendarBody);

            return container;
        },


        switchMonth: function(direction) {
            var self = this;

            this.setNextMonthYear();

            var cur_month = this.active_month;
            var cur_year = this.active_year;

            // Emmit events whenver there is change in calendar date,
            // so we can later do things by subscribing to these events
            this.wrap.trigger('change', [this.active_month, this.active_year]);

            console.profile("createCal");
            var calendar = this.createCal();
            console.profileEnd("createCal");


            this.wrap.empty();

            var container = this.buildHtml();
            this.wrap.append( container );
            container.append(calendar.calendar());
            container.appendTo(this.wrap);


            this.label = this.wrap.find(".cal-month-year");
            
            this.wrap.find('.cal-month-year')
                        .html( months[this.active_month] + " " + this.active_year );

            this.wrap.find('.prev').bind("click.calendar", function() {
                self.switchMonth(false);
            });
            
            this.wrap.find('.next').bind("click.calendar", function() {
                self.switchMonth(true);
            });


            if( $.isFunction( this.options.loadEvents ) ) {
                this.showEvents();
            }

            // $("#cal-frame", this.wrap)
            //     .find(".curr")
            //     .removeClass("curr")
            //     .addClass("temp")
            //     .end()
            //     .prepend(calendar.calendar())
            //     .find(".temp")
            //     .fadeOut("slow", function() {
            //         $(this).remove();
            //     });
            // this.label.text(calendar.label);
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
                    title: event.title,
                    date : date
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
                calendar[i] = "<tr><td><a href='#'>" + calendar[i].join("</a></td><td><a href='#'>") + "</td></a></tr>";
            }

            var html = '<table><thead class="cal-days"><tr>'
                            + "<td></span>"
                            + weeks.join('</span></td><td></span>')
                            + "</span></td>"
                            + "</tr></thead></table>";

            var calendarBody = $('<div>', { 'class' : 'cal-body' }).html( html );
    
            calendar = $("<tbody id='cal-content'>" + calendar.join("") + "</tbody").addClass("curr");

            calendar.find('td:not(.nil)').each(function(){
             $(this).attr('data-id', this.innerText)
            });

            calendarBody.find('table').append(calendar);
    
            $("td a:empty", calendar).parent().addClass("nil");

            this.cache[year][month] = {
                calendar: function() {
                    return calendarBody.clone();
    
                },
                label: months[month] + " " + year
            };
    
            return this.cache[year][month];
    
        }
    }

})(jQuery);