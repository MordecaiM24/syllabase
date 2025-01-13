const NCSU_ID = "U2Nob29sLTY4NQ==";

/**
 * search for professors by name at a specific school
 * @param {string} name - professor name to search for
 * @param {string} schoolId - base64 encoded school id (e.g. "U2Nob29sLTY4NQ==" for ncsu)
 * @returns {Promise} search results w/ matching professors
 */
async function searchProfessor(name, schoolId) {
  const searchQuery = `query NewSearchTeachersQuery(
      $query: TeacherSearchQuery!
      $count: Int
    ) {
      newSearch {
        teachers(query: $query, first: $count) {
          didFallback
          edges {
            cursor
            node {
              id
              legacyId
              firstName
              lastName
              department
              departmentId
              school {
                legacyId 
                name
                id
              }
            }
          }
        }
      }
    }`;

  return await fetchRMP({
    query: searchQuery,
    variables: {
      query: {
        text: name,
        schoolID: schoolId,
      },
      count: 10,
    },
  });
}

/**
 * get detailed ratings/info for a specific professor
 * @param {string} profId - base64 encoded professor id (e.g. "VGVhY2hlci0xOTQ5NDIw")
 * @returns {Promise} professor details including ratings
 */
async function getProfessorDetails(profId) {
  const detailsQuery = `query TeacherRatingsPageQuery(
      $id: ID!
    ) {
      node(id: $id) {
        __typename
        ... on Teacher {
          id
          legacyId
          firstName
          lastName
          department
          school {
            legacyId
            name
            city
            state
            country
            id
          }
          lockStatus
          numRatings
          avgRating
          avgDifficulty
          wouldTakeAgainPercent
          ratings(first: 20) {
            edges {
              node {
                comment
                difficultyRating
                clarityRating
                helpfulRating
                grade
                date
                class
                ratingTags
              }
            }
          }
        }
      }
    }`;

  return await fetchRMP({
    query: detailsQuery,
    variables: {
      id: profId,
    },
  });
}

/**
 * get all professors at a school with optional department filter and pagination
 * @param {string} schoolId - base64 encoded school id
 * @param {string} [deptId] - optional base64 encoded department id to filter by
 * @param {string} [cursor] - optional pagination cursor for getting next page
 * @returns {Promise} list of professors with basic info
 */
async function getAllProfessors(schoolId, deptId = null, cursor = "") {
  const allProfsQuery = `query TeacherSearchResultsPageQuery(
      $query: TeacherSearchQuery!
      $schoolID: ID
      $includeSchoolFilter: Boolean!
    ) {
      search: newSearch {
        teachers(query: $query, first: 8, after: "${cursor}") {
          didFallback
          edges {
            cursor
            node {
              id
              legacyId
              firstName
              lastName
              department
              avgRating
              avgDifficulty
              numRatings
              wouldTakeAgainPercent
              school {
                name
                id
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          resultCount
          filters {
            field
            options {
              value
              id
            }
          }
        }
      }
      school: node(id: $schoolID) @include(if: $includeSchoolFilter) {
        __typename
        ... on School {
          name
          city
          state
          legacyId
        }
        id
      }
    }`;

  const variables = {
    query: {
      text: "",
      schoolID: schoolId,
      fallback: true,
    },
    schoolID: schoolId,
    includeSchoolFilter: true,
  };

  if (deptId) {
    variables.query.departmentID = deptId;
  }

  return await fetchRMP({
    query: allProfsQuery,
    variables,
  });
}

/**
 * get complete list of professors for a department/school
 * @param {string} schoolId - base64 encoded school id
 * @param {string} [deptId] - optional base64 encoded department id
 * @param {number} [delayMs=500] - delay between requests in ms. be nice to RMP
 * @returns {Promise<Array>} complete list of professors
 */
async function getAllProfessorsComplete(
  schoolId,
  deptId = null,
  delayMs = 500
) {
  const allProfs = [];
  let hasMore = true;
  let cursor = "";

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    while (hasMore) {
      const response = await getAllProfessors(schoolId, deptId, cursor);

      // check for error response
      if (!response?.data?.search?.teachers) {
        console.error("invalid response:", response);
        break;
      }

      const teachers = response.data.search.teachers;
      allProfs.push(...teachers.edges.map((edge) => edge.node));

      hasMore = teachers.pageInfo.hasNextPage;
      if (hasMore) {
        cursor = teachers.pageInfo.endCursor;
        await sleep(delayMs); // i'll be nice to your api, RMP
      }
    }
  } catch (err) {
    console.error("error fetching professors:", err);
  }

  return allProfs;
}
/**
 * get all departments at a school by making an empty search query
 * @param {string} schoolId - base64 encoded school id
 * @returns {Promise<Array>} array of department objects with {id, name}
 */
async function getDepartments(schoolId) {
  const result = await getAllProfessors(schoolId);

  // extract departments from filters array
  const deptFilter = result.data.search.teachers.filters.find(
    (f) => f.field === "teacherdepartment_s"
  );

  return deptFilter.options.map((opt) => ({
    id: opt.id,
    name: opt.value,
  }));
}

/**
 * helper function to make graphql requests to RMP
 * @param {Object} body - request body with query and variables
 * @returns {Promise} json response data
 */
async function fetchRMP(body) {
  const response = await fetch("https://www.ratemyprofessors.com/graphql", {
    method: "POST",
    headers: {
      authorization: "Basic dGVzdDp0ZXN0", // base64 encoded "test:test"? really?
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await response.json();
}

const departments = await getDepartments(NCSU_ID);
const csDeptId = departments.find((d) => d.name === "computer science").id;
console.log(departments);

// get all CS profs
const csProfs = await getAllProfessorsComplete(NCSU_ID, csDeptId);
console.log(csProfs);

// search for a prof
const professors = await searchProfessor("jessica schmidt", NCSU_ID).then(
  (res) => res.data.newSearch.teachers.edges
);
console.log(professors);

// get details for first result
const profId = professors[0].node.id;
const details = await getProfessorDetails(profId);
// get all reviews
console.log(details.data.node.ratings.edges.map((e) => e.node));
