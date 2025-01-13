import neo4j from "neo4j-driver";
import fs, { write } from "fs";
import * as professors from "./professors.json" with {type: "json"};
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

async function writeProfessor(professor) {
  const {
    id,
    name,
    firstName,
    lastName,
    avgDifficulty: difficulty,
    avgRating: rating,
    department,
    legacyId,
    numRatings,
    school: { id: schoolId, name: schoolName },
    wouldTakeAgainPercent,
  } = professor;

  const session = driver.session({});
  try {
    const res = await session.executeWrite((tx) => {
      return tx.run(
        `
          MERGE (p:Professor {
            id: $id,
            name: $name,
            firstName: $firstName,
            lastName: $lastName,
            difficulty: $difficulty,
            rating: $rating,
            department: $department,
            legacyId: $legacyId,
            numRatings: $numRatings,
            schoolId: $schoolId,
            schoolName: $schoolName,
            wouldTakeAgainPercent: $wouldTakeAgainPercent
          })`,
        {
          id,
          name,
          firstName,
          lastName,
          difficulty,
          rating,
          department,
          legacyId,
          numRatings,
          schoolId,
          schoolName,
          wouldTakeAgainPercent,
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

async function writeTeaches(professorId, courseCode) {
  const session = driver.session({});

  try {
    const res = await session.executeWrite((tx) => {
      return tx.run(
        `
        MATCH (p:Professor {id: $professorId})
        MATCH (c:Course {code: $courseCode})
        MERGE (p) -[:TEACHES]-> (c)`,
        { professorId, courseCode }
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
    professors.default.map(async (professor) => {
      await writeProfessor(professor);
    })
  );

  await Promise.all(
    professors.default.map(async (professor) => {
      await Promise.all(
        professor.courses.map(async (course) => {
          await writeTeaches(professor.id, course);
        })
      );
    })
  );

  await driver.close();
}

main();
