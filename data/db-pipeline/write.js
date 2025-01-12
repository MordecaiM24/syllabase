// everything starts with a driver. just one though.

import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  "neo4j+s://localhost:7687",
  neo4j.auth.basic(username, password)
);

await driver.verifyConnectivity();

// from there, everything goes into a session. these are kind of like threads and are opened per transaction.

async function read(courseCode) {
  const session = driver.session({
    defaultAccessMode: session.read,
    database: "classes",
  });

  const res = await session.executeRead((tx) => {
    return tx.run(
      `MATCH (parent:Class) -[:REQUIRES]-> (child:Class)
        WHERE parent.code=$courseCode
        RETURN child`,
      { courseCode }
    );
  });

  const prereqs = res.records.map((record) => record.get("child"));

  await session.close();
}

// or to write:

async function write(courseCode, prereqCode) {
  const session = driver.session({
    defaultAccessMode,
    database: "classes",
  });

  const res = await session.executeWrite((tx) => {
    return tx.run(
      `MATCH (parent:Class {code: $courseCode})
            MATCH (child:Class {code: $prereqCode})
            MERGE (parent) -[:REQUIRES]-> (child)`,
      { courseCode, prereqCode }
    );
  });

  await session.close();
}

// we can also wrap this stuff in try catches to handle errors:
// Open the session
const session = this.driver.session();

try {
  const res = await session.executeWrite((tx) => {
    return tx.run(`CREATE (u:User {email: $email})`, { email: user.email });
  });

  console.log(res.records[0]);
} catch (e) {
  if (e.code === "Neo.ClientError.Schema.ConstraintValidationFailed") {
    console.log(e.message);

    throw new ValidationError(`An account already exists with email ${email}`, {
      email: e.message,
    });
  }
} finally {
  await session.close();
}
