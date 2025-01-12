import courses from "./output.js";

const coursesWoRestrictions = courses.filter(
  (course) => !course.restrictions_text
);
console.log(coursesWoRestrictions.length);
