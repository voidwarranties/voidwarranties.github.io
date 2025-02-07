async function fetchAndParseICS(url) {
    try {
        // Fetch the ICS file from the URL
        const response = await fetch(url);
        const icsText = await response.text();

        // Parse the ICS content into events
        const events = parseICS(icsText);

        // Filter for recurring and upcoming events
        const recurringEvents = filterRecurringEvents(events);
        const upcomingEvents = filterUpcomingEvents(events);

        // Display the events
        displayEvents(recurringEvents, "recurring");
        displayEvents(upcomingEvents, "upcoming");
    } catch (error) {
        console.error("Error fetching or parsing the ICS file:", error);
    }
}

function parseICS(icsText) {
    // Regular expression to match event entries
    const eventPattern = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    const events = [];
    let match;

    // Extract events  from the ICS file
    while ((match = eventPattern.exec(icsText)) !== null) {
        const eventData = match[1];
        const event = {};

        // Extract properties from each event
        const summaryMatch = eventData.match(/SUMMARY:(.*?)\r?\n/);
        const startMatch = eventData.match(/DTSTART(;TZID=)?(?:[^:]+)?:(\d{8}T\d{6}Z?)\r?\n/);
        const endMatch = eventData.match(/DTEND(;TZID=)?(?:[^:]+)?:(\d{8}T\d{6}Z?)\r?\n/);
        const rruleMatch = eventData.match(/RRULE:(.*?)\r?\n/);
        const descriptionMatch = eventData.match(/DESCRIPTION:(.*?)(?=\n[A-Z-]+:|$)/s);

        if (summaryMatch) event.summary = summaryMatch[1];
        if (startMatch) event.start = parseDateTime(startMatch[2]);
        if (endMatch) event.end = parseDateTime(endMatch[2]);
        if (rruleMatch) event.rrule = rruleMatch[1];
        if (rruleMatch) event.frequency = rruleMatch[1].match(/FREQ=(.*?);/)[1];
        if (rruleMatch) event.recday = rruleMatch[1].match(/BYDAY=([A-Z,]+)/)[1];
        if (descriptionMatch) event.description = descriptionMatch[1]
            .replace(/\r\n\s/g, '') // whyyyy is this data so shit
            .replace(/\\n/g, '<br>') // Replace "\n" with a line break
            .replace(/\\,/g, ','); // Replace "\," with a comma

        events.push(event);
    }

    return events;
}

function parseDateTime(datetimeStr) {
    const year = datetimeStr.substr(0, 4);
    const month = datetimeStr.substr(4, 2) - 1; // Months are 0-based
    const day = datetimeStr.substr(6, 2);
    const hours = datetimeStr.substr(9, 2);
    const minutes = datetimeStr.substr(11, 2);
    const seconds = datetimeStr.substr(13, 2);

    const date = new Date(year, month, day, hours, minutes, seconds);

    const isUTC = datetimeStr.substr(15, 1) == "Z";
    if (isUTC) date.setUTCHours(hours); // Uniformizes mixed timezone information from ICS

    return date;
}

function filterRecurringEvents(events) {
    return events.filter(event => event.rrule != null);
}

function filterUpcomingEvents(events) {
    const now = new Date();
    return events.filter(event => event.start >= now && event.rrule == null);
}


function displayEvents(events, type) {
    const eventsContainer = document.getElementById(type + "-events");

    if (events.length == 0) {
        eventsContainer.remove();
        return;
    }
    // Add elements
    const eventsHeader = document.createElement("h1");
    eventsHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1) + " events";
    const eventsList = document.createElement("div");
    eventsList.classList.add("eventlist");

    eventsContainer.replaceChildren(eventsHeader, eventsList);

    // DateTime options
    const dateOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
    };

    // Display each event
    events.forEach(event => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event");

        let date;
        if (event.rrule != null) {
            date = event.frequency + "," + event.recday;
        } else {
            date = event.start.toLocaleDateString(undefined, dateOptions);
        }

        eventDiv.innerHTML = `
            <div class="event-header">
                <div class="event-date">${date.replace(/,/g, "<br>")}</div>
                <span class="event-title">${event.summary}<br>
                    <small>${event.start.toLocaleTimeString(undefined, timeOptions)} → ${event.end.toLocaleTimeString(undefined, timeOptions)}</small>
                </span>
            </div>
            <p>${event.description}</p>`;
        eventsList.appendChild(eventDiv);
    });
}

// Fetch and parse the ICS file
  const icsUrl = "https://spaceapi.voidwarranties.be/ical";
fetchAndParseICS(icsUrl);