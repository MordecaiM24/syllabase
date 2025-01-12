import json
import os


def review_flagged_courses(flagged_file, approved_file, review_file):
    # helper to load or initialize a file
    def load_json_file(filename):
        if os.path.exists(filename):
            with open(filename, "r") as f:
                return json.load(f)
        return []

    # helper to append to a json file
    def append_to_json_file(filename, entry):
        data = load_json_file(filename)
        data.append(entry)
        with open(filename, "w") as f:
            json.dump(data, f, indent=2)

    # load flagged courses
    with open(flagged_file, "r") as f:
        flagged_courses = json.load(f)

    # review courses
    for entry in flagged_courses:
        course = entry["course"]
        issues = entry["issues"]

        # clear terminal for clean display
        os.system("cls" if os.name == "nt" else "clear")

        print("\n--- Review Course ---\n")
        print("Flagged Course:")
        print(json.dumps(course, indent=2))
        print("\nIssues:")
        print(issues)
        print("\n" + "-" * 40)
        print("Input at the bottom ↓\n")

        # input approval choice
        choice = input(
            "Approve ((a)pprove) or Send for Further Review ((r)eview)? "
        ).lower()

        if choice == "approve" or choice == "a":
            append_to_json_file(approved_file, course)
            print("Course approved and added.")
        elif choice == "review" or choice == "r":
            append_to_json_file(review_file, course)
            print("Course sent for further review.")
        else:
            print("Invalid choice. Skipping course.")

    print("\nReview complete.")


# run review
review_flagged_courses(
    "flagged_courses.json", "manually_approved_courses.json", "further_review.json"
)
