import * as professorsJSON from "../../rmp/professorInfo.json" with {type: "json"};
import fs from "fs";

const professors = professorsJSON.default;

// matches course codes that are in the format: ABCD123
const COURSE_CODE_REGEX = new RegExp("\\b([A-Za-z]{1,4})(\\d{3})\\b");

// matches course codes that are in the format: ABCD 123
const COURSE_CODE_REGEX_WITH_SPACE =  new RegExp("\\b([A-Za-z]{1,4})\\s*(\\d{3})\\b");

// matches course codes that are in the format: ABCD-123
const COURSE_CODE_REGEX_WITH_DASH = new RegExp("\\b([A-Za-z]{1,4})-(\\d{3})\\b");

const invalidCourseCodes = [];
const validCourseCodes = [];

const validProfessors = [];
const invalidProfessors = [];


function validateCourseCodeFormat() {
  professors.forEach((prof, index) => {
    const name = prof.name;
    const id = prof.id;
    console.log("Validating professor: ", index + 1);

    let validProfessor = true;
    prof.courses.forEach((course) => {
      if (COURSE_CODE_REGEX_WITH_DASH.test(course)) {
        course = course.replace("-", "");
      }

      if (COURSE_CODE_REGEX_WITH_SPACE.test(course)) {
        course = course.replace(" ", "");
      }

      if (!COURSE_CODE_REGEX.test(course)) {
        validProfessor = false;
        invalidCourseCodes.push({course, name, id});
        return;
      }

      validCourseCodes.push({course, name, id});
    });

    if (validProfessor) {
      validProfessors.push(prof);
    }

    if (!validProfessor) {
      invalidProfessors.push(prof);
    }
  });
}

validateCourseCodeFormat();

fs.writeFileSync(
  "invalidCourseCodes.json",
  `${JSON.stringify(invalidCourseCodes)}`
);
fs.writeFileSync("validCourseCodes.json", `${JSON.stringify(validCourseCodes)}`);

fs.writeFileSync("validProfessors.json", `${JSON.stringify(validProfessors)}`);
fs.writeFileSync("invalidProfessors.json", `${JSON.stringify(invalidProfessors)}`);