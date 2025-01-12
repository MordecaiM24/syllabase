# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import re


class CoursescraperPipeline:
    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        field_names = adapter.field_names()

        # Remove non-breaking spaces and strip whitespace
        for field_name in field_names:
            value = adapter.get(field_name)
            if value is not None and isinstance(value, str):
                adapter[field_name] = value.replace("\xa0", " ").strip()

        # Extract credit hours
        hours = adapter.get("hours")
        if hours:
            match = re.search(r"\(([\d-]+) credit hours\)", hours)
            if match:
                adapter["hours"] = match.group(1)

        # Parse restrictions_text into prerequisites, corequisites, and other_restrictions
        restrictions_text = adapter.get("restrictions_text")
        if restrictions_text:
            # remove everything starting with "not"
            restrictions_text = re.sub(
                r"\bnot\b.*", "", restrictions_text, flags=re.IGNORECASE
            ).strip()
            adapter["restrictions_text"] = restrictions_text

            parsed_restrictions = self.parse_restrictions(
                restrictions_text, adapter.get("department")
            )
            adapter.update(parsed_restrictions)

        return item

    def parse_restrictions(self, text, primary_department):
        """
        Parses the restrictions text and extracts prerequisites, corequisites,
        and other restrictions.
        """
        prerequisites = []
        corequisites = []
        other_restrictions = []

        # Normalize the text
        text = text.replace("Prerequisite", "Prerequisite")
        text = text.replace("prerequisite", "Prerequisite")
        text = text.replace("Corequisite", "Corequisite")
        text = text.replace("corequisite", "Corequisite")
        text = text.replace("Co-requisite", "Corequisite")
        text = text.replace("co-requisite", "Corequisite")
        text = text.replace("Restricition", "Restriction")  # Fix common typos if any

        # Regex patterns
        # prereq_pattern = r"Prerequisite[s]?:\s*([^;:\n]+)"
        # coreq_pattern = r"Corequisite[s]?:\s*([^;:\n]+)"
        # other_pattern = r"(?!Prerequisite[s]?|Corequisite[s]?:)([^;:\n]+)"

        # updated patterns
        prereq_pattern = r"[Pp](?:rereq(?:uisite)?s?)?:\s*([^;:\n]+)"  # matches capital and lowercase p, then optionally the string "rereq", the optionally the rest of that, and more optionally the plural s
        coreq_pattern = r"[Cc](?:oreq(?:uisite)?s?)?:\s*([^;:\n]+)"  # matches capital and lowercase c, then optionally the string "oreq", the optionally the rest of that, and more optionally the plural s
        other_pattern = r"(?![Pp](?:rereq(?:uisite)?s?)?|[Cc](?:oreq(?:uisite)?s?)?:)([^;:\n]+)"  # matches anything that is not a prerequisite or corequisite to put in the other restrictions

        # Extract prerequisites
        prereq_matches = re.findall(prereq_pattern, text, re.IGNORECASE)
        for match in prereq_matches:
            prerequisites.append(match.strip())

        # Extract corequisites
        coreq_matches = re.findall(coreq_pattern, text, re.IGNORECASE)
        for match in coreq_matches:
            corequisites.append(match.strip())

        # Remove extracted parts to find other restrictions
        text_cleaned = re.sub(prereq_pattern, "", text, flags=re.IGNORECASE)
        text_cleaned = re.sub(coreq_pattern, "", text_cleaned, flags=re.IGNORECASE)
        other_matches = re.findall(other_pattern, text_cleaned, re.IGNORECASE)
        for match in other_matches:
            if match.strip():
                other_restrictions.append(match.strip())

        # Further processing to extract course codes from prerequisites and corequisites
        prerequisites = self.extract_course_codes(prerequisites, primary_department)
        corequisites = self.extract_course_codes(corequisites, primary_department)
        other_restrictions = [res.strip() for res in other_restrictions if res.strip()]

        return {
            "prerequisites": prerequisites if prerequisites else None,
            "corequisites": corequisites if corequisites else None,
            "other_restrictions": other_restrictions if other_restrictions else None,
        }

    def extract_course_codes(self, texts, primary_department):
        """
        Extracts course codes from a list of texts, handling incomplete course codes
        by inferring department codes from the last seen department code.
        """
        course_codes = []
        # Define a regex pattern for course codes, e.g., CHE 312 or CHE312, or just 312
        # Pattern captures either DEPT CODE + number or just number
        pattern = r"([A-Z]{1,4})\s*(\d{3})|(\d{3})"

        for text in texts:
            current_dept = None
            matches = re.findall(pattern, text)
            for match in matches:
                dept, number, number_only = match
                if dept and number:
                    current_dept = dept.upper()
                    course_code = f"{current_dept}{number}"
                    course_codes.append(course_code)
                elif number_only:
                    if current_dept:
                        course_code = f"{current_dept}{number_only}"
                        course_codes.append(course_code)
                    elif primary_department:
                        # Infer department code from primary_department if possible
                        course_code = f"{primary_department}{number_only}"
                        course_codes.append(course_code)
                    else:
                        # Cannot determine department code, skip or handle accordingly
                        pass

        return course_codes if course_codes else None
