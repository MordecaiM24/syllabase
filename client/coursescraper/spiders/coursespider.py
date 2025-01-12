import scrapy
from coursescraper.items import CourseItem
import unicodedata


class CoursespiderSpider(scrapy.Spider):
    name = "coursespider"
    allowed_domains = ["catalog.ncsu.edu"]
    start_urls = ["https://catalog.ncsu.edu/course-descriptions/"]

    def parse(self, response):
        department_links = response.css("div.az_sitemap ul li a::attr(href)").getall()
        for link in department_links:
            url = response.urljoin(link)
            # Extract department code from the URL, e.g., "/course-descriptions/csc/" -> "CSC"
            department_code = link.strip("/").split("/")[-1].upper()
            yield scrapy.Request(
                url,
                callback=self.parse_department,
                meta={"department": department_code},
            )

    def parse_department(self, response):
        department = response.meta.get("department")
        courses = response.css("div.courseblock")
        for course in courses:
            code_parts = [
                unicodedata.normalize("NFKD", part)
                .strip()
                .replace("\u00a0", "")
                .replace(" ", "")
                for part in course.css(
                    "div.cols .detail-coursecode strong::text, div.cols .detail-coursecode strong a::text"
                ).getall()
            ]
            code = "".join(code_parts).upper()

            name = course.css("div.cols .detail-title strong::text").get()
            hours = course.css("div.cols .detail-hours_html::text").get()

            # Strip and rejoin because of a tags
            description_parts = course.css(
                "div.noindent p.courseblockextra::text, div.noindent p.courseblockextra a::text"
            ).getall()
            description = " ".join(description_parts).strip()

            # Same thing here
            restrictions = course.css(
                "p.courseblockextra.noindent a::text, p.courseblockextra.noindent::text"
            ).getall()
            restrictions_text = " ".join(restrictions).strip() if restrictions else None

            course_item = CourseItem()
            course_item["department"] = department
            course_item["code"] = code
            course_item["name"] = name
            course_item["hours"] = hours
            course_item["description"] = description
            course_item["restrictions_text"] = restrictions_text

            yield course_item
