import express from "express";
import neo4j from "neo4j-driver";
const router = express.Router();
import "dotenv/config.js";

console.log(process.env);
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(username, password)
);

await driver.verifyConnectivity();

// In-memory cache
const dependencyCache = new Map();
const courseInfoCache = new Map();

// Cache duration - 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Middleware to check localStorage cache first
const checkLocalStorage = (req, res, next) => {
  res.header("Cache-Control", `public, max-age=${CACHE_DURATION / 1000}`);
  next();
};

// Get course dependencies
router.get(
  "/course/:code/dependencies",
  checkLocalStorage,
  async (req, res) => {
    const courseCode = req.params.code.toUpperCase();

    try {
      // Check memory cache first
      if (dependencyCache.has(courseCode)) {
        return res.json(dependencyCache.get(courseCode));
      }

      const session = driver.session();
      const result = await session.run(
        "MATCH (c:Course {code: $courseCode}) -[:REQUIRES]->(n:Course) RETURN n.code as code",
        { courseCode }
      );

      const dependencies = result.records.map((record) => record.get("code"));

      // Cache the results
      dependencyCache.set(courseCode, dependencies);

      await session.close();
      res.json(dependencies);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      res.status(500).json({ error: "Error fetching course dependencies" });
    }
  }
);

// Get course info
router.get("/course/:code", checkLocalStorage, async (req, res) => {
  const courseCode = req.params.code.toUpperCase();

  try {
    // Check memory cache first
    if (courseInfoCache.has(courseCode)) {
      return res.json(courseInfoCache.get(courseCode));
    }

    const session = driver.session();
    const result = await session.run(
      "MATCH (c:Course {code: $courseCode}) RETURN c",
      { courseCode }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseInfo = result.records[0].get("c").properties;

    // Cache the results
    courseInfoCache.set(courseCode, courseInfo);

    await session.close();
    res.json(courseInfo);
  } catch (error) {
    console.error("Error fetching course info:", error);
    res.status(500).json({ error: "Error fetching course info" });
  }
});

// Clear cache endpoint (for admin use)
router.post("/clear-cache", (req, res) => {
  dependencyCache.clear();
  courseInfoCache.clear();
  res.json({ message: "Cache cleared successfully" });
});

router.get("/courses", async (req, res) => {
  const session = driver.session();
  const result = await session.run("MATCH (c:Course) RETURN c");

  const courses = result.records.map((record) => record.get("c").properties);
  await session.close();
  res.json(courses);
});

export default router;

// New endpoint for basic course info
router.get("/courses/basic", async (req, res) => {
  try {
    const session = driver.session();
    const result = await session.run(
      "MATCH (c:Course) RETURN c.code, c.name, c.department, c.hours"
    );

    const courses = result.records.map((record) => ({
      code: record.get("c.code"),
      name: record.get("c.name"),
      department: record.get("c.department"),
      hours: record.get("c.hours"),
    }));

    await session.close();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Error fetching courses" });
  }
});
