import * as courseMeetingsJSON from "../../scraper/meetingscraper/course_times.json" with {type:"json"};
import fs from "fs";

function formatSection(section) {
  // skip recitations and async/TBD
  if (
    !section.days ||
    section.time === "TBD" ||
    /\d{3}[A-Z]/.test(section.section)
  )
    return null;

  const days = section.days === "TT" ? "TTh" : section.days;
  return `${section.section} ${days}${convertTimeToMilitary(section.time)}`;
}

function convertTimeToMilitary(timeStr) {
  // split "1:30 PM  - 5:45 PM" into start/end times
  const [start, end] = timeStr.split("-").map((t) => t.trim());

  // parse each time
  const parseTime = (time) => {
    const [hourMin, ampm] = time.split(" ");
    let [hours, mins] = hourMin.split(":").map(Number);

    // convert to military
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}${mins
      .toString()
      .padStart(2, "0")}`;
  };

  return `${parseTime(start)}-${parseTime(end)}`;
}

const courseMeetings = courseMeetingsJSON.default;

const meetingTimes = courseMeetings.map((course) => {
  const courseCode = course.course.replace("-", "");

  const sections = course.sections.map(formatSection).filter(Boolean);

  return {
    courseCode,
    sections,
  };
});

console.log(meetingTimes);

fs.writeFileSync("courseTimes.json", JSON.stringify(meetingTimes));
