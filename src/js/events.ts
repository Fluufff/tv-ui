import { getNow } from "./util";

const DCMHost = 'dcm.fluufff.org';
const DCMSiteId = '4162edd2-9dcf-4c51-b15a-2365edf38926';
const requestIntervalSeconds = 10;

interface FluufffEvent {
  id: string,
  name: string,
  // slug: string,
  fields: {
    name: string,
    location: {
      contentId: string,
      name: string, // we fill this in ourselves
    },
    "start-time": string,
    "end-time": string,
    "host-name": string,
    description: string, // with html for maximum shittiness
  },
}

const scheduleRefresh = () => {
  setTimeout(() => {
    requestPage(0, () => {
      markActiveEvents();
      scheduleRefresh();
    });
  }, requestIntervalSeconds * 1000)
}

const isUpcoming = (event: FluufffEvent): boolean => {
  const today = getNow().setHours(0, 0, 0, 0);

  const startTime = new Date(event.fields["start-time"]);
  const endTime = new Date(event.fields["end-time"]);

  const isToday = 
    today === startTime.setHours(0, 0, 0, 0) ||
    today === endTime.setHours(0, 0, 0, 0);
  return isToday && getNow() < endTime;
}

const eventListEl = document.getElementById("events-list")!;
let lastEvents: FluufffEvent[] = [];
let lastEventsHash = "loadme";
const requestPage = (n: Number, cb: () => void) => {
  try {
    const url = `https://${DCMHost}/api/v1/sites/${DCMSiteId}/content?lang=en&pagesize=-1`;
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", function() {
      if(this.readyState === 4) {
        try {
          const json = JSON.parse(this.responseText);
          const everything: FluufffEvent[] = json["_embedded"]?.["content"];
          const events = everything
          .filter(event => event.fields["start-time"]) // is it actually an event
          .filter(isUpcoming) // is it today-ish and not in the past
          .map(event => { // add the venue name
            let venue = everything.find(item => item.id === event.fields.location.contentId);
            if (venue) {
              event.fields.location.name = venue.name;
            }
            return event
          })
          .sort((a, b) => { // sort array to earliest event first
            const ad = new Date(a.fields["start-time"]).getTime();
            const bd = new Date(b.fields["start-time"]).getTime();
            return ad - bd;
          })
          // console.log(events);

          const eventsHash = events.map(event => event.id).join("+");
          const nothingToDo = lastEventsHash === eventsHash;
          console.log({nothingToDo});
          if (!nothingToDo) {
            // remove old list
            while (eventListEl.firstChild) {
              eventListEl.removeChild(eventListEl.lastChild!);
            }
            if (events.length === 0) {
              const div = document.createElement("div");
              const p = document.createElement("p");
              p.textContent = "no events :C"
              div.appendChild(p);
              eventListEl.appendChild(div);
            }
            for (const event of events) {
              const div = document.createElement("div");

              const header = document.createElement("header");
              div.appendChild(header);

              const pName = document.createElement("p");
              pName.setAttribute("name", "");
              pName.textContent = event.name;
              header.appendChild(pName);

              const ringContainer = document.createElement("div");
              ringContainer.setAttribute("ring", "");
              const ringring = document.createElement("div");
              ringring.setAttribute("ringring", "");
              ringContainer.appendChild(ringring);
              const circle = document.createElement("div");
              circle.setAttribute("circle", "");
              ringContainer.appendChild(circle);
              header.appendChild(ringContainer);

              const footer = document.createElement("footer");
              div.appendChild(footer);

              const pTime = document.createElement("p");
              pTime.textContent = 
                new Date(event.fields["start-time"]).toLocaleTimeString() +
                " - " + 
                new Date(event.fields["end-time"]).toLocaleTimeString();
              footer.appendChild(pTime);

              const pLocation = document.createElement("p");
              pLocation.setAttribute("location", "");
              pLocation.textContent = event.fields.location.name;
              footer.appendChild(pLocation);

              eventListEl.appendChild(div);
            }
            lastEventsHash = eventsHash;
            lastEvents = events;
          }
          
          cb();
        } catch (error) {
          cb();
        }
      }
    });
    xhr.open("GET", url);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send();
  } catch (error) {
    cb();
  }
}

const markActiveEvents = () => {
  for (let i = 0; i < lastEvents.length; i++) {
    const event = lastEvents[i];
    const el = eventListEl.children[i];
    const startTime = new Date(event.fields["start-time"]);
    const endTime = new Date(event.fields["end-time"]);
    const now = getNow();
    const isActive = startTime <= now && now <=endTime;
    if (isActive) {
      el.setAttribute("event-active", "");
    } else {
      el.removeAttribute("event-active");
    }
  }
}

requestPage(0, () => {
  markActiveEvents();
  scheduleRefresh();
});
