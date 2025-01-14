import neo4j from "neo4j-driver";
import fs, { write } from "fs";
import * as courseTimesJSON from "./courseTimes.json" with {type: "json"};
import dotenv from "dotenv";

dotenv.config();

const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic(username, password)
);

await driver.verifyConnectivity();

fs.writeFileSync("logs.txt", "");

const courseTimes = courseTimesJSON.default;

async function writeMeetingTimes(courseCode, meetingTimes) {
  const session = driver.session({});

  try {
    const res = await session.executeWrite((tx) => {
      return tx.run(
        `
        MATCH (c: Course {code: $courseCode})
        SET c.meetingTimes = $meetingTimes
        `,
        {
          courseCode,
          meetingTimes,
        }
      );
    });

    const summary = res.summary;
    fs.appendFileSync("logs.txt", JSON.stringify(summary, null, 2) + "\n");
  } catch (e) {
    fs.appendFileSync("logs.txt", JSON.stringify({ ERROR: e }, null, 2) + "\n");
    console.error(e);
  } finally {
    await session.close();
  }
}

async function main() {
  await Promise.all(
    courseTimes.map(async (course) => {
      await writeMeetingTimes(course.courseCode, course.sections);
    })
  );

  await driver.close();
}

main();
