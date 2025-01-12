"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Search, X, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Course } from "@/types/courses";

// Utility functions for storage management
const getStoredCourses = (key: string) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const CourseList = ({ type }: { type: string }) => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoursFilter, setHoursFilter] = useState("all");

  const isBookmarkList = type === "bookmarks";
  const storageKey = isBookmarkList ? "bookmarkedCourses" : "addedCourses";
  const icon = isBookmarkList ? Bookmark : Plus;
  const title = isBookmarkList ? "Bookmarked Courses" : "Saved Courses";

  useEffect(() => {
    const loadCourses = () => {
      setCourses(getStoredCourses(storageKey));
    };

    loadCourses();
    window.addEventListener("storage", loadCourses);
    return () => window.removeEventListener("storage", loadCourses);
  }, [storageKey]);

  const handleRemove = (courseCode: string) => {
    const updated = courses.filter(
      (course: Course) => course.code !== courseCode,
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setCourses(updated);
  };

  const filterCourses = (courses: Course[]) => {
    return courses.filter((course: Course) => {
      const matchesSearch =
        !searchQuery ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesHours =
        hoursFilter === "all" || course.hours.toString() === hoursFilter;

      return matchesSearch && matchesHours;
    });
  };

  const displayedCourses = filterCourses(courses);
  const uniqueHours = [
    ...new Set(courses.map((course: Course) => course.hours)),
  ].sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(icon, {
              className: isBookmarkList ? "text-blue-500" : "text-green-500",
            })}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                    size={16}
                  />
                  <Input
                    id="search"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="hours">Credit Hours</Label>
                <Select value={hoursFilter} onValueChange={setHoursFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Credit Hours</SelectItem>
                    {uniqueHours.map((hours) => (
                      <SelectItem key={hours} value={hours.toString()}>
                        {hours} {hours === "1" ? "Hours" : "Hours"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {displayedCourses.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {searchQuery || hoursFilter !== "all"
                ? "No courses match your filters"
                : `No ${isBookmarkList ? "bookmarked" : "saved"} courses yet`}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {displayedCourses.map((course: Course) => (
                <Link href={`/${course.code}`} key={course.code}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{course.code}</h3>
                          <h4 className="mb-1 text-gray-600">{course.name}</h4>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-900"
                              title={`Remove ${isBookmarkList ? "bookmark" : "course"}`}
                            >
                              {isBookmarkList ? (
                                <Bookmark className="h-5 w-5 fill-current text-blue-500" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48">
                            <p className="text-sm">
                              Remove this course from{" "}
                              {isBookmarkList ? "bookmarks" : "saved courses"}?
                            </p>
                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                onClick={() => handleRemove(course.code)}
                                className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                        {course.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        {course.hours}{" "}
                        {course.hours === "1" ? "hours" : "hours"}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Export individual components for specific usage
