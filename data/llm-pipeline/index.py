import json
import re
import ollama
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock


def validate_restrictions(course, progress_counter, lock, approved_file, flagged_file):
    restrictions_text = course.get("restrictions_text", None)
    if not restrictions_text:
        with lock:
            progress_counter["processed"] += 1
        # append to approved file immediately
        with open(approved_file, "a") as f:
            f.write(json.dumps(course) + "\n")
        return

    prompt = f"""
        You are validating course data. The course is:
        {json.dumps(course, indent=2)}

        Focus on the "prerequisites", "corequisites", and "other_restrictions" fields.
        Check:
        1. Does it make sense? 
        2. Are there inconsistencies like graduate-level courses as prerequisites for undergrad courses?
        Define a graduate level course as one that is over 200 levels above, i.e. a 100 level class has a 300+ level restriction.
        3. Does it need manual clarification?

        For example, some courses say they require the SAT subject test as a prerequisite. I don't care about this, unless
        it is mistakenly present in the prerequisites array. That is the only situation in which it would matter. 

        Another example of things that don't matter are restrictions like "or similar experience", or "permission of the instructor".
        These are not relevant to this task. As long as any alphanumerical department + course codes are reflected accurately 
        in the prerequisite and corequisite arrays, and both are null if and when they should be, then it is fine.

        By "making sense" in this context we mean that the pre and co req
        arrays are reasonable translations of the restrictions_text.
        We don't care about other restrictions outside of the pre and co reqs.
        But make sure those make sense.

        I do not care at all if the pre req and co req themselves are valid,
        or if they make sense in the abstract. 
        I just need the prereq and coreq array to be reasonable translations of the restrictions text.
        That is the only thing that matters.

        As long as all of that is true, respond with "VALID". Otherwise, list specific issues.
    
        To reiterate,
        Respond with "VALID" if it looks correct, or list specific issues.
        """
    print("started ollama read")
    response = ollama.generate(model="llama3.2:3b", prompt=prompt)
    print("finished ollama write")

    response_content = response["response"].strip()

    # check for "VALID"
    if re.search(r"\bVALID\b", response_content, re.IGNORECASE):
        # append to approved file
        with open(approved_file, "a") as f:
            f.write(json.dumps(course) + "\n")
    else:
        # append to flagged file
        with open(flagged_file, "a") as f:
            f.write(json.dumps({"course": course, "issues": response_content}) + "\n")

    with lock:
        progress_counter["processed"] += 1


def process_courses_parallel(input_file, approved_file, flagged_file, max_workers=3):
    with open(input_file, "r") as f:
        courses = json.load(f)

    # initialize progress counter and lock
    progress_counter = {"processed": 0}
    lock = Lock()

    # clear or create output files
    open(approved_file, "w").close()
    open(flagged_file, "w").close()

    # use ThreadPoolExecutor to parallelize
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(
                validate_restrictions,
                course,
                progress_counter,
                lock,
                approved_file,
                flagged_file,
            )
            for course in courses
        ]

        for future in as_completed(futures):
            try:
                future.result()  # trigger exception handling if something went wrong
            except Exception as e:
                print(f"Error in processing: {e}")

            # log progress periodically
            with lock:
                if progress_counter["processed"] % 10 == 0:
                    print(
                        f"Processed {progress_counter['processed']} of {len(courses)}"
                    )


process_courses_parallel(
    "ncsu_courses.json", "approved_courses.json", "flagged_courses.json", max_workers=2
)
