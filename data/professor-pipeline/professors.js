import * as professorsJSON from "./invalidProfessors.json" with {type: "json"};
import * as validProfessorsJSON from "./validProfessors.json" with {type: "json"};
import fs from "fs";

const professors = professorsJSON.default;

const COURSE_CODE_REGEX = new RegExp("\\b([A-Za-z]{1,4})(\\d{3})\\b");


const filteredProfessors = [];

function filterInvalidProfessors() {
  professors.forEach((prof) => {
    prof.courses = prof.courses.filter((course) => {
      return COURSE_CODE_REGEX.test(course)
    }
  );

    filteredProfessors.push(prof);
  });
}

filterInvalidProfessors();
filteredProfessors.push(...validProfessorsJSON.default);
fs.writeFileSync("professors.json", JSON.stringify(filteredProfessors));