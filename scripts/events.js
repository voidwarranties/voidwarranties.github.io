async function fetchAndParseICS(url) {
  try {
    // Fetch the ICS file from the URL
    const response = await fetch(url);
    const icsText = await response.text();

    // Parse the ICS content into events
    const events = parseICS(icsText);

    // Filter for recurring and upcoming events
    const recurringEvents = filterRecurringEvents(events);
    let upcomingEvents = filterUpcomingEvents(events);

    // Expand recurring events for the next 4 weeks
    const expandedEvents = expandRecurringEvents(recurringEvents).sort(
      (a, b) => a.start - b.start
    );

    // Display the events
    displayEvents(expandedEvents, "recurring");
    displayEvents(upcomingEvents, "upcoming");
  } catch (error) {
    console.error("Error fetching or parsing the ICS file:", error);
    document.getElementById("recurring-events").textContent =
      "Failed to load events, please contact us if this keeps happening.";
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
    const startMatch = eventData.match(
      /DTSTART(;TZID=)?(?:[^:]+)?:(\d{8}T\d{6}Z?)\r?\n/
    );
    const endMatch = eventData.match(
      /DTEND(;TZID=)?(?:[^:]+)?:(\d{8}T\d{6}Z?)\r?\n/
    );
    const rruleMatch = eventData.match(/RRULE:(.*?)\r?\n/);
    const descriptionMatch = eventData.match(
      /DESCRIPTION:(.*?)(?=\n[A-Z-]+:|$)/s
    );
    const locationMatch = eventData.match(/LOCATION:(.*?)(?=\n[A-Z-]+:|$)/s);

    if (summaryMatch) event.summary = summaryMatch[1];
    if (startMatch) event.start = parseDateTime(startMatch[2]);
    if (endMatch) event.end = parseDateTime(endMatch[2]);
    if (rruleMatch) event.rrule = rruleMatch[1];
    if (descriptionMatch)
      event.description = descriptionMatch[1]
        .replace(/\r\n\s/g, "") // whyyyy is this data so shit
        .replace(/\\n/g, "<br>") // Replace "\n" with a line break
        .replace(/\\,/g, ","); // Replace "\," with a comma
    if (locationMatch)
      event.location = locationMatch[1]
        .replace(/\r\n\s/g, "") // whyyyy is this data so shit
        .replace(/\\,/g, ","); // Replace "\," with a comma

    events.push(event);
  }

  return events;
}

function expandRecurringEvents(recurringEvents) {
  const upcomingOccurrences = [];
  const now = new Date();
  const fourWeeksFromNow = new Date(
    now.getTime() + 4 * 7 * 24 * 60 * 60 * 1000
  );

  const dayMap = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  recurringEvents.forEach((event) => {
    const parts = {};
    if (event.rrule) {
      event.rrule.split(";").forEach((part) => {
        const [key, value] = part.split("=");
        if (key && value) parts[key] = value;
      });
    }

    const duration = event.end.getTime() - event.start.getTime();
    const startHours = event.start.getHours();
    const startMinutes = event.start.getMinutes();
    const startSeconds = event.start.getSeconds();

    if (parts.FREQ === "WEEKLY" && parts.BYDAY) {
      const targetDays = parts.BYDAY.split(",").map((d) => dayMap[d]);

      for (let i = 0; i < 28; i++) {
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + i);

        if (targetDays.includes(nextDate.getDay())) {
          const occurrenceStart = new Date(nextDate);
          occurrenceStart.setHours(startHours, startMinutes, startSeconds, 0);

          if (occurrenceStart >= now && occurrenceStart < fourWeeksFromNow) {
            const occurrenceEnd = new Date(
              occurrenceStart.getTime() + duration
            );
            const newEvent = { ...event };
            delete newEvent.rrule;
            newEvent.start = occurrenceStart;
            newEvent.end = occurrenceEnd;
            upcomingOccurrences.push(newEvent);
          }
        }
      }
    } else if (parts.FREQ === "MONTHLY" && parts.BYDAY) {
      const dayStr = parts.BYDAY;
      const numMatch = dayStr.match(/(-?\d+)/);
      const dayMatch = dayStr.match(/[A-Z]{2}/);

      if (numMatch && dayMatch) {
        const weekOfMonth = parseInt(numMatch[0], 10);
        const targetDay = dayMap[dayMatch[0]];

        // Check current and next two months to cover the 4-week window
        for (let m = 0; m < 3; m++) {
          const checkDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
          const year = checkDate.getFullYear();
          const month = checkDate.getMonth();
          let occurrenceDate = null;

          if (weekOfMonth > 0) {
            // Nth day of the month
            let count = 0;
            for (let day = 1; day <= 31; day++) {
              const d = new Date(year, month, day);
              if (d.getMonth() !== month) break; // Past the end of the month
              if (d.getDay() === targetDay) {
                count++;
                if (count === weekOfMonth) {
                  occurrenceDate = d;
                  break;
                }
              }
            }
          } else if (weekOfMonth === -1) {
            // Last day of the month
            const lastDayOfMonth = new Date(year, month + 1, 0);
            for (let day = lastDayOfMonth.getDate(); day >= 1; day--) {
              const d = new Date(year, month, day);
              if (d.getDay() === targetDay) {
                occurrenceDate = d;
                break;
              }
            }
          }

          if (occurrenceDate) {
            const occurrenceStart = new Date(occurrenceDate);
            occurrenceStart.setHours(startHours, startMinutes, startSeconds, 0);

            if (occurrenceStart >= now && occurrenceStart < fourWeeksFromNow) {
              const occurrenceEnd = new Date(
                occurrenceStart.getTime() + duration
              );
              const newEvent = { ...event };
              delete newEvent.rrule;
              newEvent.start = occurrenceStart;
              newEvent.end = occurrenceEnd;
              upcomingOccurrences.push(newEvent);
            }
          }
        }
      }
    }
  });

  return upcomingOccurrences;
}

function rruleToHumanReadable(rruleString) {
  if (!rruleString) return "";

  const parts = {};
  rruleString.split(";").forEach((part) => {
    const [key, value] = part.split("=");
    if (key && value) parts[key] = value;
  });

  const dayMap = {
    SU: "Sunday",
    MO: "Monday",
    TU: "Tuesday",
    WE: "Wednesday",
    TH: "Thursday",
    FR: "Friday",
    SA: "Saturday",
  };

  const ordinalMap = {
    1: "first",
    2: "second",
    3: "third",
    4: "fourth",
    "-1": "last",
  };

  let result = "";

  switch (parts.FREQ) {
    case "WEEKLY":
      result =
        "Every " +
        (parts.BYDAY
          ? parts.BYDAY.split(",")
              .map((d) => dayMap[d])
              .join(", ")
          : "week");
      break;
    case "MONTHLY":
      result = "Every month";
      if (parts.BYDAY) {
        const dayStr = parts.BYDAY;
        const num = dayStr.match(/(-?\d+)/);
        const day = dayStr.match(/[A-Z]{2}/);
        if (num && ordinalMap[num[0]]) {
          result += ` on the ${ordinalMap[num[0]]} ${dayMap[day[0]]}`;
        } else {
          result += ` on ${dayMap[day[0]]}`;
        }
      }
      break;
    case "YEARLY":
      result = "Every year";
      break;
    default:
      result = rruleString; // Fallback
  }

  return result;
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
  return events
    .filter((event) => event.rrule != null)
    .sort((a, b) => a.start - b.start);
}

function filterUpcomingEvents(events) {
  const now = new Date();
  return events
    .filter((event) => event.end >= now && event.rrule == null)
    .sort((a, b) => a.start - b.start);
}

function displayEvents(events, type) {
  const eventsContainer = document.getElementById(type + "-events");

  if (events.length == 0) {
    eventsContainer.remove();
    return;
  }
  // Add elements
  const eventsHeader = document.createElement("h1");
  eventsHeader.textContent =
    type.charAt(0).toUpperCase() + type.slice(1) + " events";
  const eventsList = document.createElement("div");
  eventsList.classList.add("eventlist");

  eventsContainer.replaceChildren(eventsHeader, eventsList);

  // DateTime options
  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
  };

  // Display each event
  events.forEach((event) => {
    const eventDiv = document.createElement("div");
    eventDiv.classList.add("event");

    let date;
    if (event.rrule != null) {
      date = rruleToHumanReadable(event.rrule);
    } else {
      date = event.start.toLocaleDateString(undefined, dateOptions);
    }

    let location = "";
    if (event.location != undefined) location = event.location;

    eventDiv.innerHTML = `
            <div class="event-header">
                <div class="event-date">${date.replace(/,/g, "<br>")}</div>
                <span class="event-title">${event.summary}<br>
                    <small>${event.start.toLocaleTimeString(
                      undefined,
                      timeOptions
                    )} → ${event.end.toLocaleTimeString(
      undefined,
      timeOptions
    )}</small>
                </span>
            </div>
            <p>${event.description}</p>
            <small>${location}</small>`;
    eventsList.appendChild(eventDiv);
  });
}

// Fetch and parse the ICS file
const icsUrl = "https://spaceapi.voidwarranties.be/ical";
fetchAndParseICS(icsUrl);
