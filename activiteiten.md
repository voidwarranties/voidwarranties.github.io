# Activiteiten

<!--{% include meetup_widget.html %}-->
<!--
https://calendar.google.com/calendar/ical/voidjosto%40gmail.com/public/basic.ics
https://calendar.google.com/calendar/ical/voidjosto@gmail.com/public/basic.ics

<iframe scrolling="no" src="https://calendar.google.com/calendar/embed?src=voidjosto%40gmail.com&amp;ctz=Europe%2FBrussels&amp;showNav=1&amp;showTabs=1&amp;showCalendars=0&amp;showTz=1&amp;showPrint=0&amp;showDate=0&amp;showTitle=0&amp;mode=AGENDA&amp;color=%23C0CA33" style="border: 0; margin: 10px auto;display: block;width: 100%;" width="600" height="400" frameborder="0"></iframe>
-->


<div id="event-container">
	<noscript>Javascript is required to see our calendar</noscript>
</div>
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
  events.forEach((event) => {
    if (event['RRULE']) {
	  //if RRULE:UNTIL datetime is futuredate then push
	  const recurringUntil = parseRRule(event['RRULE']);
	  if ( !recurringUntil['UNTIL'] ) {
		  recurringEvents.push(event); //push recurringevent if it doesnt have enddate
	  } else if ( convertToDateTime( recurringUntil['UNTIL'] , undefined) >= currentDate) {
		  recurringEvents.push(event);
	  }
	  //else if (startdate + repeatsXTimes * frequency) >= currentDate
    } else {
      const eventEndDate = new Date(event['DTEND']);
      if (eventEndDate >= currentDate) {
        otherEvents.push(event);
      }
    }
  });
  // Sort the recurringEvents by frequency
  recurringEvents.sort((a, b) => {
	const freqOrder = { DAILY: 1, WEEKLY: 2, MONTHLY: 3, YEARLY: 4 };
	const freqA = parseRRule(a['RRULE']).FREQ;
	const freqB = parseRRule(b['RRULE']).FREQ;
	return freqOrder[freqA] - freqOrder[freqB];
  });
  // Sort the otherEvents array by start date
  otherEvents.sort((a, b) => new Date(a['DTSTART']) - new Date(b['DTSTART']));
  console.log(recurringEvents);
  console.log(otherEvents);
  const displayEvents = (eventArray, heading) => {
    if (eventArray.length > 0) {
      let html = `<h3>${heading}</h3>`;
      html += '<ul>';
      eventArray.forEach((event) => {
        const summary = event['SUMMARY'];
		const location = event['LOCATION'] ? `<i class="fa-solid fa-location-dot"></i> <i>${event['LOCATION']}</i>` : '';
        const description = event['DESCRIPTION'] ? `<i class="fa-solid fa-circle-info"></i><i>${event['DESCRIPTION']}</i>` : '';
        let eventDescription = '';
		const startDateTime = new Date(event['DTSTART']);
		const endDateTime = new Date(event['DTEND']);
		const timeDifference = 12 * 60 * 60 * 1000; // 12 hours -> endDate is shown before endTime when event is at least {0} hours
		const startTime = startDateTime.toLocaleTimeString('nl-NL', { hour: "numeric", minute: "2-digit" });
		const endTime = endDateTime.toLocaleTimeString('nl-NL', { hour: "numeric", minute: "2-digit" });
		const weekday = startDateTime.toLocaleString('nl-NL', { weekday: 'long'});
		const weekdayShort = startDateTime.toLocaleString('nl-NL', { weekday: 'short'});
		const day = startDateTime.toLocaleString('nl-NL', { day: 'numeric'});
		const month = startDateTime.toLocaleString('nl-NL', { month: 'numeric'});
		const year = startDateTime.toLocaleString('nl-NL', { year: '2-digit'});
        if (event['RRULE']) {
          const rrule = parseRRule(event['RRULE']);
		  switch ( rrule['FREQ'] ) {
			case 'DAILY':
			  // Handle daily recurrence
			  // RRULE:FREQ=DAILY;INTERVAL=2
			  eventDescription += ( !rrule['INTERVAL'] )? 'Dagelijks' : 'Elke ' + rrule['INTERVAL'] + ' dagen';
			  break;
			case 'WEEKLY':
			  // Handle weekly recurrence
			  // RRULE:FREQ=WEEKLY;INTERVAL=3;BYDAY=WE,FR
			  eventDescription += ( !rrule['INTERVAL'] )? 'Wekelijks' : 'Elke ' + rrule['INTERVAL'] + ' weken';
			  if ( rrule['BYDAY'] ){
				  eventDescription += ' op ' + ( rrule['BYDAY'].split(',').length > 2 ) ? getDayOfWeek(rrule['BYDAY']).join(', ').replace(/,(?=[^,]*$)/, ' en') : getDayOfWeek(rrule['BYDAY']).join(' en ');
			  }
			  break;
			case 'MONTHLY':
			  // Handle monthly recurrence
			  // RRULE:FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=1,5,10
			  // RRULE:FREQ=MONTHLY;BYDAY=1FR,5FR,-1FR,-2FR
			  eventDescription += ( !rrule['INTERVAL'] )? 'Maandelijks' : 'Elke ' + rrule['INTERVAL'] + ' maanden';
			  if ( rrule['BYMONTHDAY'] ){
				  eventDescription += ' op de ' + rrule['BYMONTHDAY'] + 'e'; //add code for multiple monthdays
			  }
			  if ( rrule['BYDAY'] ){
				  eventDescription += ' op ' + ( rrule['BYDAY'].split(',').length > 2 ) ? getDayOfWeek(rrule['BYDAY']).join(', ').replace(/,(?=[^,]*$)/, ' en') : getDayOfWeek(rrule['BYDAY']).join(' en ');
			  }
			  break;
			case 'YEARLY':
			  // Handle yearly recurrence
			  // RRULE:FREQ=YEARLY;INTERVAL=2;BYMONTH=6;BYMONTHDAY=21;UNTIL=20251118T110000Z
			  eventDescription += ( !rrule['INTERVAL'] )? 'Jaarlijks' : 'Elke ' + rrule['INTERVAL'] + ' jaar';
			  eventDescription += ' op ' + rrule['BYMONTHDAY'] + ' ' + new Date(2023, parseInt(rrule['BYMONTH']), 1).toLocaleString('nl-NL', { month: 'long' });
			  break;
			default:
			  // RRULE is not daily, weekly, monthly or yearly, so it must be secondly, minutely or hourly for some reason
			  console.log( rrule );
			  break;
		  }
		} else {
			  eventDescription = startDateTime.toLocaleString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
			  eventDescription += " van " + startTime;
			  eventDescription += " tot " + ( endDateTime - startDateTime >= timeDifference ? endDateTime.toLocaleString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric'}) : "" );
			  eventDescription +=  endTime + " uur";
		}
		eventDescription += ` van ${startTime} tot ${endTime} uur`;
		console.log(eventDescription);
		html += `<li>${summary} - ${eventDescription} ${location}<br>${description}</li>`
		/*html += '<li class="event">'
			 +  '<div class="event-date">'
			 +  `<li class="event">`
			 +  `<span class="weekday">${weekday}</span>`
			 +  `<span class="day">${day}</span>`
			 +  `<span class="month-year">${month} '${year}</span>`
			 +  `<span class="time">${startTime} - ${endTime}</span>`
			 +  '</div>'
			 +  '<div class="event-details">'
			 +  '<div class="event-title">'
			 +  `<h3>${summary}</h3>`
			 +  '</div>'
			 +  `<div class="event-location">${location}</div>`
			 +  `<p class="event-description">${description}</p>`
			 +  '</div>'
			 +  '</li>';*/
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
const calendarICSUrl = 'https://spaceapi.voidwarranties.be/ical'; // Replace with the actual URL of your calendar ICS file
fetchCalendarICS(calendarICSUrl);
  </script>

{% include quote.html %}
