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
const icsToJSON = (icsContent) => {
  const lines = icsContent.split(/\r?\n/);
  const events = [];
  const removeTZID = (key) => key.replace(/;TZID=.*$/, '');
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
          event[currentKey] = convertToDateTime(currentValue.trim());
        }
        const parts = line.split(':');
        currentKey = removeTZID(parts[0].trim());
        currentValue = parts.length > 1 ? parts.slice(1).join(':') : '';
      }
    }
  }

  return events;
};

const convertToDateTime = (value) => {
  const dateTimeRegex = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/;
  const match = value.match(dateTimeRegex);

  if (match) {
    const [, year, month, day, hours, minutes, seconds] = match;
    //const dateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
	const dateTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}+02:00`);

    // Check if the conversion to Date object was successful
    if (!isNaN(dateTime)) {
      return dateTime;
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
  const byDayIndex = weekdays.indexOf(byDay);
  if (byDayIndex !== -1) {
    const date = new Date();
    date.setDate(date.getDate() + ((7 + byDayIndex - date.getDay()) % 7));
    return date.toLocaleString('nl-NL', { weekday: 'long' });
  }
  return '';
};

const processEvents = (events) => {
  const currentDate = new Date();
  const recurringEvents = [];
  const otherEvents = [];

  events.forEach((event) => {
    if (event['RRULE']) {
      recurringEvents.push(event);
    } else {
      const eventStartDate = new Date(event['DTSTART']);
      if (eventStartDate >= currentDate) {
        otherEvents.push(event);
      }
    }
  });
  console.log(recurringEvents);
  console.log(otherEvents);
  const displayEvents = (eventArray, heading) => {
    if (eventArray.length > 0) {
      let html = `<h3>${heading}</h3>`;
      html += '<ul>';
      eventArray.forEach((event) => {
        const summary = event['SUMMARY'];
        let eventDescription = '';

        if (event['RRULE']) {
          const rrule = parseRRule(event['RRULE']);
   console.log(event['DTSTART']);
	  const startTime = (event['DTSTART']).toLocaleTimeString('nl-NL', { hour: "2-digit", minute: "2-digit" });
   console.log(startTime);
          if (rrule['FREQ'] === 'MONTHLY' && rrule['BYMONTHDAY']) {
            eventDescription = `Elke ${rrule['BYMONTHDAY']} van de maand om ${startTime}`;
          } else if (rrule['FREQ'] === 'WEEKLY' && rrule['BYDAY']) {
            const dayOfWeek = getDayOfWeek(rrule['BYDAY']);
            eventDescription = `Elke ${dayOfWeek} om ${startTime}`;
          } else if (rrule['FREQ'] === 'YEARLY' && rrule['BYMONTH'] && rrule['BYMONTHDAY']) {
            const month = new Date().toLocaleString('en-US', { month: 'long' });
            eventDescription = `Jaarlijks op ${rrule['BYMONTHDAY']}-${month} om ${startTime}`;
          }
        } else {
          eventDescription = new Date(event['DTSTART']).toLocaleString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        }

		const location = event['LOCATION'] ? `<br>📍 ${event['LOCATION']}` : '';
        const description = event['DESCRIPTION'] ? `<br><i>${event['DESCRIPTION']}</i>` : '';

		html += `<li>${summary} - ${eventDescription}${location}${description}</li>`;
      });
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

const calendarICSUrl = 'https://spaceapi.voidwarranties.be/ical;' // Replace with the actual URL of your calendar ICS file
fetchCalendarICS(calendarICSUrl);

  </script>

{% include quote.html %}
