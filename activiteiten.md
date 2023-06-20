# Activiteiten

<!--{% include meetup_widget.html %}-->
<!--
https://calendar.google.com/calendar/ical/voidjosto%40gmail.com/public/basic.ics
https://calendar.google.com/calendar/ical/voidjosto@gmail.com/public/basic.ics

<iframe scrolling="no" src="https://calendar.google.com/calendar/embed?src=voidjosto%40gmail.com&amp;ctz=Europe%2FBrussels&amp;showNav=1&amp;showTabs=1&amp;showCalendars=0&amp;showTz=1&amp;showPrint=0&amp;showDate=0&amp;showTitle=0&amp;mode=AGENDA&amp;color=%23C0CA33" style="border: 0; margin: 10px auto;display: block;width: 100%;" width="600" height="400" frameborder="0"></iframe>
-->


<div id="event-container">
	<p> Activiteiten worden geladen, even geduld...</p>
	<noscript>Javascript is required to see our calendar</noscript>
</div>
<style>
    .event {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .event-date-bg {
      width: 120px;
      min-width: 120px;
      height: 120px;
	  background-color: black;
	  background-position: center;
	  background-size: cover
	  box-shadow: 0px 4px 4px 0px #00000040, inset 0 0 0 1000px rgba(0, 0, 0, .9);
    }
    .event-date {
      width: 120px;
      min-width: 120px;
      height: 120px;
      text-align: center;
      font-size: 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
	  backdrop-filter: blur(2px);
    }
    .event-date .day {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 0;
      color: #ffffff;
	  line-height: 1em;
    }
    .event-date .moment, .event-date .month-year {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
      font-weight: bold;
      color: #ffffff;
	  margin: 0;
    }
    .event-date .time {
      font-size: 12px;
      font-weight: bold;
      color: #ffffff;
    }
    .event-details {
      flex: 1;
      margin-left: 20px;
      height: 120px;
      max-height: 120px;
      overflow: scroll;
	  display: flex;
	  align-items: start;
	  flex-direction: column;
	  justify-content: start;
    }
    .event-title {
      margin-top: 0;
      display: flex;
      align-items: end;
      flex-wrap: wrap;
    }
    .event-title h3, .event-title h2 {
      margin: 0 10px 0 0;
      word-wrap: break-word;
    }
    .event-location {
      font-size: 16px;
      color: #777777;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 200px;
    }
    .event-description {
      margin-top: 5px;
      font-size: 14px;
    }
  </style>
<script>
/*jshint esversion: 6 */
const icsToJSON = (icsContent) => {
  const lines = icsContent.split(/\r?\n/);
  const events = [];
  //const removeTZID = (key) => key.replace(/;TZID=.*$/, '');
  let event = null;
  let currentKey = '';
  let currentValue = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('BEGIN:VEVENT')) {
      event = {};
    } else if (line.startsWith('END:VEVENT')) {
      events.push(event);
      event = null;
    } else if (event) {
      if (line.startsWith(' ') && currentKey !== '') {
        // Multi-line value
        currentValue += line.substring(1);
      } else {
        // New line
        if (currentKey !== '') {
          event[currentKey] = convertToDateTime(currentValue.trim(), currentKey.split(";")[1]);
        }
        const parts = line.split(':');
        currentKey = parts[0].trim().split(";")[0];
        currentValue = parts.length > 1 ? parts.slice(1).join(':') : '';
      }
    }
  }
  return events;
};
const convertToDateTime = (value, timeZone) => {
  const dateTimeRegex = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})(Z?)(.*))?$/;
  const match = value.match(dateTimeRegex);
  if (match) {
    const [, year, month, day, , hours, minutes, seconds, isUTC, tzid] = match;
      const dateTimeString = `${year}-${month}-${day}T${hours || '00'}:${minutes || '00'}:${seconds || '00'}${isUTC || ''}`;
      const dateTime = new Date(dateTimeString);
      // Check if the conversion to Date object was successful
      if (!isNaN(dateTime)) {
        if (timeZone && timeZone.startsWith("TZID=") ) {
          // Contains timeZone, return the formatted dateTime
		  timeZone = timeZone.split("=")[1];
          return dateTime.toLocaleString('en-US', { timeZone });
        } else {
          // Different timeZone, convert to the desired timeZone
          return dateTime.toLocaleString('en-US', { timeZone: 'Europe/Brussels' } );
		}
    }
  }
  return removeEscapedCharacters(value);
};
const removeEscapedCharacters = (value) => {
  return value
    //.replace(/\\(.)/g, '$1') // Remove the backslash before escaped characters
    .replace(/\\n/g, '<br>') // Replace "\n" with a line break
    .replace(/\\;/g, ';') // Replace "\;" with a semicolon
    .replace(/\\,/g, ','); // Replace "\," with a comma
};
const parseRRule = (rrule) => {
  const ruleParts = rrule.split(';');
  const ruleObject = {};
  ruleParts.forEach((part) => {
    const [key, value] = part.split('=');
    ruleObject[key] = value;
  });
  return ruleObject;
};
const getDayOfWeek = (byDay) => {
  const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const byDayList = byDay.split(',').map(day => day.trim());
  const dayOfWeekNames = [];
  byDayList.forEach((day) => {
	let dayOfWeekString = day.match(/-/) ? day.replace(/-1.*/,'de laatste ').replace(/-2.*/,'de voorlaatste ') : day.match(/\d+/) ? "de " + day.match(/\d+/)[0] + "e" : "" ;
	day = day.slice(-2); //in case byday contains a number or negative number (for example 1st friday or last friday)
    const byDayIndex = weekdays.indexOf(day);
    if (byDayIndex !== -1) {
      const date = new Date();
      date.setDate(date.getDate() + ((7 + byDayIndex - date.getDay()) % 7));
      const dayOfWeekName = date.toLocaleString('nl-NL', { weekday: 'long' });
	  dayOfWeekString += dayOfWeekName;
    }
    dayOfWeekNames.push(dayOfWeekString);
  });
  return dayOfWeekNames;
};
const processEvents = (events) => {
  const currentDate = new Date();
  const recurringEvents = [];
  const otherEvents = [];
  let rrule = '';
  events.forEach((event) => {
    if (event.RRULE) {
	  //if RRULE:UNTIL datetime is futuredate then push
	  rrule = parseRRule(event.RRULE);
	  if ( !rrule.UNTIL ) {
		  recurringEvents.push(event); //push recurringevent if it doesnt have enddate
	  } else if ( convertToDateTime( rrule.UNTIL , undefined) >= currentDate) {
		  recurringEvents.push(event);
	  }
	  //else if (startdate + repeatsXTimes * frequency) >= currentDate
    } else {
      const eventEndDate = new Date(event.DTEND);
      if (eventEndDate >= currentDate) {
        otherEvents.push(event);
      }
    }
  });
  // Sort the recurringEvents by frequency
  recurringEvents.sort((a, b) => {
	const freqOrder = { DAILY: 1, WEEKLY: 2, MONTHLY: 3, YEARLY: 4 };
	const freqA = parseRRule(a.RRULE).FREQ;
	const freqB = parseRRule(b.RRULE).FREQ;
	return freqOrder[freqA] - freqOrder[freqB];
  });
  // Sort the otherEvents array by start date
  otherEvents.sort((a, b) => new Date(a.DTSTART) - new Date(b.DTSTART));
  console.log(recurringEvents);
  console.log(otherEvents);
  const displayEvents = (eventArray, heading) => {
    if (eventArray.length > 0) {
      let html = '<h3>' + heading + '</h3>';
      html += '<ul>';
      eventArray.forEach((event) => {
		const startDateTime = new Date(event.DTSTART);
		const endDateTime = new Date(event.DTEND);
		const timeDifference = 12 * 60 * 60 * 1000; // 12 hours -> endDate is shown before endTime when event is at least {0} hours
		const startTime = startDateTime.toLocaleTimeString('nl-NL', { hour: "numeric", minute: "2-digit" });
		const endTime = endDateTime.toLocaleTimeString('nl-NL', { hour: "numeric", minute: "2-digit" });
        const summary = event.SUMMARY ? event.SUMMARY.replace('VoidWarranties - ', '') : '';
		const location = event.LOCATION ? '<i class="fa-solid fa-location-dot"></i> <i><a href="https://www.openstreetmap.org/search?query=' + event.LOCATION + '" target="_blank">' + event.LOCATION + '</a></i>' : '';
        const description = event.DESCRIPTION ? '<i class="fa-solid fa-circle-info"></i> <i>' + event.DESCRIPTION + '</i>' : '';
        let eventDescription = '';
		let moment = '';
		let day = startDateTime.toLocaleString('nl-NL', { day: 'numeric'}); //date or weekday
		let monthYear = '&nbsp;'; //month and year or empty
		let time = ''; //starttime - endtime or starttime (if longer than 12h)
        if (event.RRULE) {
          rrule = parseRRule(event.RRULE);
		  switch ( rrule.FREQ ) {
			case 'DAILY':
			  // Handle daily recurrence
			  // RRULE:FREQ=DAILY;INTERVAL=2
			  moment = ( !rrule.INTERVAL )? 'Dagelijks' : 'Elke ' + rrule.INTERVAL + ' dagen';
			  eventDescription += moment;
			  day = '<i class="fa fa-clock"></i>';
			  break;
			case 'WEEKLY':
			  // Handle weekly recurrence
			  // RRULE:FREQ=WEEKLY;INTERVAL=3;BYDAY=WE,FR
			  moment = ( !rrule.INTERVAL )? 'Wekelijks' : 'Elke ' + rrule.INTERVAL + ' weken';
			  eventDescription += moment;
			  day = startDateTime.toLocaleString('nl-NL', { weekday: 'short'});
			  if ( rrule.BYDAY ){
				  console.log( "weekly byday: " + rrule.BYDAY );
				  eventDescription += ' op ' + ( rrule.BYDAY.split(',').length > 2 ? getDayOfWeek(rrule.BYDAY).join(', ').replace(/,(?=[^,]*$)/, ' en') : getDayOfWeek(rrule.BYDAY).join(' en ') );
			  }
			  break;
			case 'MONTHLY':
			  // Handle monthly recurrence
			  // RRULE:FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=1,5,10
			  // RRULE:FREQ=MONTHLY;BYDAY=1FR,5FR,-1FR,-2FR
			  moment = ( !rrule.INTERVAL )? 'Maandelijks' : 'Elke ' + rrule.INTERVAL + ' maanden';
			  eventDescription += moment;
			  if ( rrule.BYMONTHDAY ){
				  day = rrule.BYMONTHDAY + 'e';
				  eventDescription += ' op de ' + day ; //add code for multiple monthdays
			  }
			  if ( rrule.BYDAY ){
				  day = ( rrule.BYDAY.split(',').length > 2 ? getDayOfWeek(rrule.BYDAY).join(', ').replace(/,(?=[^,]*$)/, ' en') : getDayOfWeek(rrule.BYDAY).join(' en ') );
				  eventDescription += ' op ' + day;
			  }
			  break;
			case 'YEARLY':
			  // Handle yearly recurrence
			  // RRULE:FREQ=YEARLY;INTERVAL=2;BYMONTH=6;BYMONTHDAY=21;UNTIL=20251118T110000Z
			  moment = ( !rrule.INTERVAL )? 'Jaarlijks' : 'Elke ' + rrule.INTERVAL + ' jaar';
			  eventDescription += moment;
			  day = rrule.BYMONTHDAY;
			  monthYear = new Date(2023, parseInt(rrule.BYMONTH), day).toLocaleString('nl-NL', { month: 'long' });
			  eventDescription += ' op ' + day + ' ' + monthYear;
			  break;
			default:
			  // RRULE is not daily, weekly, monthly or yearly, so it must be secondly, minutely or hourly for some reason
			  console.log( rrule );
			  break;
		  }
		} else {
			eventDescription = startDateTime.toLocaleString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
			moment = startDateTime.toLocaleString('nl-NL', { weekday: 'long'});
			monthYear = startDateTime.toLocaleString('nl-NL', { month: 'short', year: '2-digit'});
		}
		time = ( endDateTime - startDateTime >= timeDifference ? 'om ' + startTime + ' uur' : startTime + ' - ' + endTime );
		eventDescription += ' van ' + startTime;
		eventDescription += ' tot ' + ( endDateTime - startDateTime >= timeDifference ? endDateTime.toLocaleString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric'}) : "" );
		eventDescription += ' ' + endTime + ' uur';
		console.log(eventDescription);
		//html += `<li>${summary} - ${eventDescription} ${location}<br>${description}</li>`;
		//html += '<!--';
		html += '<li class="event">'
			 +  '<div class="event-date" style="background: url(\'https://source.unsplash.com/120x120/?hacker,' + summary.replace(/[\[\]&(),]/g, '').split(' ')[0] + '&img=1\'); box-shadow: 0px 4px 4px 0px #00000040, inset 0 0 0 1000px rgba(0, 0, 0, 0.3);">'
			 +  '<div class="event-date">'
			 +  '<span class="moment">' + moment + '</span>'
			 +  '<span class="day">' + day + '</span>'
			 +  '<span class="month-year">' + monthYear + '</span>'
			 +  '<span class="time">' + time + '</span>'
			 +  '</div>'
			 +  '</div>'
			 +  '<div class="event-details">'
			 +  '<div class="event-title"><h3>' + summary + '</h3> ' + eventDescription + '</div>'
			 +  '<div class="event-location"> ' + location + '</div>'
			 +  '<p class="event-description"> ' + description + '</p>'
			 +  '</div>'
			 +  '</li>';
		//html += '-->';
      }); //end of foreach event
      html += '</ul>';
      return html;
    }
    return '';
  };
  const resultContainer = document.getElementById('event-container');
  if (resultContainer) {
    let html = '';
    html += displayEvents(recurringEvents, 'Herhalende activiteiten');
    html += displayEvents(otherEvents, 'Andere activiteiten');
    if (html !== '') {
      resultContainer.innerHTML = html;
    }
  }
};
const fetchCalendarICS = (url) => {
  $.ajax({
    url: url,
    dataType: 'text',
    success: (icsContent) => {
      const events = icsToJSON(icsContent);
	  console.log(events);
      processEvents(events);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to fetch calendar ICS file:', errorThrown);
	  document.getElementById('event-container').innerHTML = '<iframe scrolling="no" src="https://calendar.google.com/calendar/embed?src=voidjosto%40gmail.com&ctz=Europe%2FBrussels&showNav=1&showTabs=1&showCalendars=0&showTz=1&showPrint=0&showDate=0&showTitle=0&mode=AGENDA&color=%23C0CA33" style="border: 0; margin: 10px auto;display: block;width: 100%;" width="600" height="400" frameborder="0"></iframe>';
    }
  });
};
const calendarICSUrl = 'https://spaceapi.voidwarranties.be/ical';
fetchCalendarICS(calendarICSUrl);
</script>

{% include quote.html %}
