var CALENDAR = function () {
    var wrap, label,
        options,
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function init(opts) {

        options = opts;

        wrap  = $(options.elem);
        label = wrap.find(".cal-month-year");
        wrap.find(".prev").bind("click.calendar", function () { switchMonth(false); });
        wrap.find(".next").bind("click.calendar", function () { switchMonth(true);  });
        label.bind("click", function () { switchMonth(null, new Date().getMonth(), new Date().getFullYear()); });
        label.click();
       console.log(wrap);
        console.log(label);

        if( options.event_canvas ) {
            loadEvents()
        }
    }

    function loadEvents(){
        var canvas_template = $(options.event_canvas).html();



        $.ajax({
            url : options.remote_events,
            dataType : 'json',
            success : function(events){
                console.log(events);
            }
        });
    }

    function switchMonth(next, month, year) {
        var curr = label.text().trim().split(" "), calendar, tempYear = parseInt(curr[1], 10);

        month = month || ((next) ? ((curr[0] === "December") ? 0 : months.indexOf(curr[0]) + 1) : ( (curr[0] === "January") ? 11 : months.indexOf(curr[0]) - 1) );
        year  = year  || ((next && month === 0) ? tempYear + 1 : (!next && month === 11) ? tempYear -1 : tempYear);

        console.log(month);
        console.log(year);

        console.profile("createCal");
        calendar = createCal(year, month);
        console.profileEnd("createCal");

        $("#cal-frame", wrap)
            .find(".curr")
            .removeClass("curr")
            .addClass("temp")
            .end()
            .prepend(calendar.calendar())
            .find(".temp")
            .fadeOut("slow", function () { $(this).remove(); });
        label.text(calendar.label);
    }

    function createCal(year, month) {
        var day = 1, i, j, haveDays = true,
            startDay = new Date(year, month, day).getDay(),
            daysInMonth = [31, (((year%4===0)&&(year%100!==0))||(year%400===0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
            calendar = [];
        if (createCal.cache[year]) {
            if (createCal.cache[year][month]) {
                return createCal.cache[year][month];
            }
        } else {
            createCal.cache[year] = {};
        }
        i = 0;
        while(haveDays) {
            calendar[i] = [];
            for (j = 0; j < 7; j++) {
                if (i === 0) {
                    if (j === startDay) {
                        calendar[i][j] = day++;
                        startDay++;
                    }
                } else if ( day <= daysInMonth[month]) {
                    calendar[i][j] = day++;
                } else {
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

        createCal.cache[year][month] = { calendar : function () {
            calendar.clone().insertAfter('thead');

        }, label : months[month] + " " + year };

        return createCal.cache[year][month];

    }
    createCal.cache = {};
    return {
        init : init,
        switchMonth : switchMonth,
        createCal   : createCal
    };
};