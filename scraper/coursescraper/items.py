# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class CourseItem(scrapy.Item):
    # define the fields for your item here like:
    department = scrapy.Field()
    code = scrapy.Field()
    name = scrapy.Field()
    hours = scrapy.Field()
    description = scrapy.Field()
    restrictions_text = scrapy.Field()  # Keep the raw restrictions text if needed
    prerequisites = scrapy.Field()
    corequisites = scrapy.Field()
    other_restrictions = scrapy.Field()
