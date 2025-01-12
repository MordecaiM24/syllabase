import courses from "./output.js";
import neo4j from "neo4j-driver";
import fs from "fs";

const username = "neo4j";
const password = "mordecai";

const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic(username, password)
);

await driver.verifyConnectivity();

fs.writeFileSync("logs.txt", "");

async function writeCourse(course) {
  const {
    department,
    code: courseCode,
    name,
    hours,
    description,
    restrictions_text,
  } = course;

  const session = driver.session({});
  try {
    const res = await session.executeWrite((tx) => {
      return tx.run(
        `
        MERGE (c:Course {
          code: $courseCode,
          name: $name,
          hours: $hours,
          description: $description,
          restrictions: coalesce($restrictions_text, ""),
          department: $department
        })`,
        { department, courseCode, name, hours, description, restrictions_text }
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

async function writePrereq(parentCode, childCode, type) {
  const session = driver.session({});
  try {
    const res = await session.executeWrite((tx) => {
      return tx.run(
        `MATCH (parent:Course {code: $parentCode})
        MATCH (child:Course {code: $childCode})
        MERGE (parent) -[:REQUIRES {type: $type}]-> (child)`,
        { parentCode, childCode, type }
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
    courses.map(async (course) => {
      await writeCourse(course);

      if (course.prerequisites) {
        await Promise.all(
          course.prerequisites.map((prereq) =>
            writePrereq(course.code, prereq, "prereq")
          )
        );
      }

      if (course.corequisites) {
        await Promise.all(
          course.corequisites.map((coreq) =>
            writePrereq(course.code, coreq, "coreq")
          )
        );
      }
    })
  );

  await driver.close();
}

await main();
