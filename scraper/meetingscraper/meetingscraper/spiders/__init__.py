import scrapy
from scrapy.http import FormRequest
from urllib.parse import quote_plus

# scraped directly using
# [...document.querySelectorAll('#browse-menu a')].map(a => a.getAttribute('data-value'))
departments = [
    "AA - Advanced Analytics",
    "ACC - Accounting",
    "ADN - Art and Design",
    "AEC - Applied Ecology",
    "AEE - Agricultural and Extension Education",
    "AEHS - Agricultural Education and Human Sciences",
    "AFS - Africana Studies",
    "AGI - Agricultural Institute",
    "ALS - Agriculture and Life Sciences",
    "ANS - Animal Science",
    "ANT - Anthropology",
    "ARC - Architecture",
    "ARE - Agricultural and Resource Economics",
    "ARS - Arts Studies",
    "AS - Aerospace Studies",
    "AVS - Arts Village",
    "BAE - Biological and Agricultural Engineering",
    "BAET - Biological and Agricultural Engineering Technology",
    "BBS - Bioprocessing",
    "BCH - Biochemistry",
    "BEC - Biomanufacturing Training Education Center",
    "BIO - Biological Sciences",
    "BIT - Biotechnology",
    "BMA - Biomathematics",
    "BME - Biomedical Engineering",
    "BSC - Biological Sciences",
    "BUS - Business Management",
    "CBS - Comparative Biological Science",
    "CE - Civil Engineering",
    "CH - Chemistry",
    "CHE - Chemical Engineering",
    "COM - Communication",
    "COP - Cooperative Education",
    "COS - College of Sciences",
    "CRD - Communication Rhetoric & Digital Media",
    "CS - Crop Science",
    "CSC - Computer Science",
    "CSSC - Crop and Soil Sciences",
    "D - Design",
    "DAN - Dance",
    "DDN - Design courses for Graduate Students",
    "DS - Design Studies",
    "DSA - Data Science Academy Courses",
    "E - Engineering",
    "EA - Environmental Assessment",
    "EAC - Adult & Higher Education",
    "EC - Economics",
    "ECD - Counselor Education",
    "ECE - Electrical and Computer Engineering",
    "ECG - Graduate Economics",
    "ECI - Curriculum and Instruction",
    "ED - Education",
    "EDP - Educational Psychology",
    "EED - Engineering Education",
    "EGR - EGR-Engineering Master's",
    "EI - Entrepreneurship Initiative",
    "ELM - Elementary Education",
    "ELP - Educ Leadership & Program Eval",
    "EM - Engineering Management",
    "EMA - Entrepreneurship in Music and the Arts",
    "EMS - Math & Science Education",
    "ENG - English",
    "ENT - Entomology",
    "ENV - Environmental First Year",
    "ES - Environmental Science",
    "ET - Environmental Technology",
    "FB - Forest Biomaterials",
    "FDS - Foundations of Data Science",
    "FIM - Financial Mathematics",
    "FM - Feed Mill",
    "FOR - Forestry",
    "FPS - Fiber and Polymer Science",
    "FS - Food Science",
    "FSA - Food Science",
    "FTD - Fashion and Textile Design",
    "FTM - Fashion and Textile Management",
    "FW - Fisheries & Wildlife Sciences",
    "GC - Graphic Communications",
    "GD - Graphic Design",
    "GEO - Geography",
    "GES - Genetic Engineering and Society",
    "GGA - Genetics and Genomics Academy",
    "GGS - Genetic and Genomic Sciences",
    "GIS - Geographic Information Systems",
    "GN - Genetics",
    "GOH - Global One Health",
    "GR - Graduate Special Categories",
    "GTI - NC Global Training Initiative",
    "HA - History of Art",
    "HESA - HESA - Health Exercise Aquatics",
    "HESF - Health Exercise Studies Fitness",
    "HESM - Health and Exercise Studies Minor",
    "HESO - Health Exercise Studies Outdoor",
    "HESR - Health Exercise Studies Racquet",
    "HESS - Health Exercise Studies Specialty",
    "HEST - Health Exercise Studies Team",
    "HI - History",
    "HON - Honors",
    "HS - Horticulture Science",
    "HSS - Humanites and Social Sciences",
    "ID - Industrial Design",
    "IDS - Interdisciplinary Studies",
    "IMM - Immunology",
    "IMS - Integrated Manufacturing Sys",
    "INB - INB - Interdepartmental Graduate Biology",
    "IPGE - Interdisciplinary Perspectives",
    "IS - International Studies",
    "ISE - Industrial and Systems Engineering",
    "JDP - Joint Degree Program placeholder courses",
    "LAR - Landscape Architecture",
    "LOG - Logic",
    "LPS - Leadership in the Public Sector",
    "LSC - Life Sciences First Year",
    "M - Management",
    "MA - Mathematics",
    "MAA - Math in Agriculture and Related Sciences",
    "MAE - Mechanical & Aerospace Engr",
    "MB - Microbiology",
    "MBA - Business Administration",
    "MEA - Marine, Earth, and Atmospheric Sciences",
    "MIE - Management Innovation Entrepreneurship",
    "MIS - International Studies",
    "MLS - Liberal Studies",
    "MS - Military Science",
    "MSE - Materials Science and Engineering",
    "MT - Medical Textiles",
    "MUS - Music",
    "MUT - Music Technology",
    "NE - Nuclear Engineering",
    "NPS - Nonprofit Studies",
    "NR - Natural Resources",
    "NS - Naval Science",
    "NTR - Nutrition",
    "NW - Nonwovens",
    "OR - Operations Research",
    "PA - Public Administration",
    "PB - Plant Biology",
    "PCC - Polymer and Color Chemistry",
    "PHI - Philosophy",
    "PHY - Physiology",
    "PO - Poultry Science",
    "PP - Plant Pathology",
    "PRK - Park Scholars",
    "PRT - Parks, Recreation, and Tourism Management",
    "PS - Political Science",
    "PSC - Public Science",
    "PSE - Paper Science Engineering",
    "PSY - Psychology",
    "PY - Physics",
    "REL - Religious Studies",
    "SAO - Study Abroad Office",
    "SIP - Solving Interdisciplinary Problems",
    "SLC - Shelton Leadership Course",
    "SMT - Sustainable Materials and Technology",
    "SOC - Sociology",
    "SSC - Soil Science",
    "ST - Statistics",
    "STS - Science, Technology and Society",
    "SW - Social Work",
    "T - Textiles",
    "TC - Textile Chemistry",
    "TDE - Technology Engineering and Design Education",
    "TE - Textile Engineering",
    "TED - Technology Education",
    "THE - Theatre",
    "TMS - Textile Materials Science",
    "TOX - Toxicology",
    "TT - Textile Technology",
    "TTM - Textile Technology Management",
    "USC - University Studies Course",
    "USDEI - U.S. Diversity Equity and Inclusion",
    "VET - Veterinary Medicine",
    "VMB - Veterinary Science - VMB",
    "VMC - Veterinary Medicine-Companion Animal & Sp Species",
    "VMP - Veterinary Science - VMP",
    "WGS - Women's, Gender, and Sexuality Studies",
    "WL - World Languages",
    "WLAR - World Languages - Arabic",
    "WLCH - World Languages - Chinese",
    "WLCL - World Languages - Classics",
    "WLEN - World Languages - English",
    "WLFR - World Languages - French",
    "WLGE - World Languages - German",
    "WLGR - World Languages - Greek",
    "WLHU - World Languages - Hindi-Urdu",
    "WLIT - World Languages - Italian",
    "WLJA - World Languages - Japanese",
    "WLLA - World Languages - Latin",
    "WLPO - World Languages - Portuguese",
    "WLRU - WLRU - World Languages - Russian",
    "WLSP - World Languages - Spanish",
    "WRT - Professional Writing",
    "ZO - Zoology",
]


class MeetingSpider(scrapy.Spider):
    name = "meeting_spider"
    search_endpoint = "https://webappprd.acs.ncsu.edu/php/coursecat/search.php"

    def start_requests(self):
        headers = {
            "accept": "application/json",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
        }

        for dept in departments:
            body = (
                f"term=2251"
                f"&subject={quote_plus(dept)}"
                f"&course-inequality=%3D"
                f"&course-number="
                f"&course-career="
                f"&session="
                f"&start-time-inequality=%3C%3D"
                f"&start-time="
                f"&end-time-inequality=%3C%3D"
                f"&end-time="
                f"&instructor-name="
                f"&current_strm=2251"
            )

            yield scrapy.Request(
                self.search_endpoint,
                method="POST",
                headers=headers,
                body=body,
                callback=self.parse,
                meta={"department": dept},  # pass dept through for reference
            )

    def parse(self, response):
        data = response.json()
        sel = scrapy.Selector(text=data["html"])

        for course in sel.css("section.course"):
            course_id = course.attrib["id"]
            sections = []
            for row in course.css(
                "table.section-table tr:not(:first-child):not(:last-child)"
            ):
                days = [
                    d.css("abbr::text").get()[0]
                    for d in row.css(".weekdisplay li.meet")
                ]

                sections.append(
                    {
                        "section": row.css("td:nth-child(1)::text").get("").strip(),
                        "type": row.css("td:nth-child(2)::text").get("").strip(),
                        "days": "".join(days),
                        "time": row.css("td:nth-child(5)::text").getall()[-1].strip(),
                        "location": row.css("td:nth-child(6)::text").get("").strip(),
                    }
                )

            if sections:
                yield {
                    "department": response.meta["department"],
                    "course": course_id,
                    "sections": sections,
                }
