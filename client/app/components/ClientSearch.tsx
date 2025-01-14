// components/CourseSearchClient.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface CourseBasicInfo {
  code: string;
  name: string;
  department: string;
  hours: string;
}

interface Department {
  id: string;
  name: string;
}

interface CourseSearchClientProps {
  initialCourses: CourseBasicInfo[];
  departments: Department[];
}

const ITEMS_PER_PAGE = 6;
const HOURS = ["1", "2", "3", "4", "5"];

export default function CourseSearchClient({
  initialCourses,
  departments,
}: CourseSearchClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [hoursFilter, setHoursFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1);

  // Memoize filtered courses based on the smaller dataset
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || course.department === departmentFilter;

      const matchesHours =
        hoursFilter === "all" || course.hours === hoursFilter;

      return matchesSearch && matchesDepartment && matchesHours;
    });
  }, [initialCourses, searchQuery, departmentFilter, hoursFilter]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push("ellipsis");

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(currentPage + 1, totalPages - 1);
        i++
      ) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) pageNumbers.push("ellipsis");
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <Card className="sm:p-4">
      <CardHeader>
        <CardTitle>Course Explorer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="search">Search Courses</Label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={16}
                />
                <Input
                  id="search"
                  placeholder="Search by code or name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    resetPage();
                  }}
                  className="w-80 pl-10 sm:w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      resetPage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Department Filter */}
            <div className="flex w-80 flex-col gap-2 sm:w-full">
              <Label htmlFor="department">Department</Label>
              <Select
                value={departmentFilter}
                onValueChange={(value) => {
                  setDepartmentFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hours Filter */}
            <div className="flex w-80 flex-col gap-2 sm:w-full">
              <Label htmlFor="hours">Credit Hours</Label>
              <Select
                value={hoursFilter}
                onValueChange={(value) => {
                  setHoursFilter(value);
                  resetPage();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hours</SelectItem>
                  {HOURS.map((hours) => (
                    <SelectItem key={hours} value={hours}>
                      {hours} {hours === "1" ? "Hour" : "Hours"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500">
            {filteredCourses.length} courses found
          </div>

          {/* Course grid */}
          {paginatedCourses.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No courses match your search criteria
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedCourses.map((course) => (
                <Link
                  href={`/${course.code}`}
                  key={course.code}
                  className="block hover:no-underline"
                >
                  <Card className="h-full w-80 cursor-pointer transition-shadow hover:shadow-md sm:w-full">
                    <CardContent className="h-full pt-6">
                      <div className="mb-2 flex flex-col items-start justify-between gap-y-2">
                        <div className="flex w-full flex-row items-center justify-between">
                          <h3 className="text-lg font-medium text-foreground">
                            {course.code}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {course.hours}
                            {parseInt(course.hours) === 1 ? " hour" : " hours"}
                          </span>
                        </div>
                        <h4 className="text-gray-600">{course.name}</h4>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          {/* Pagination */}
          {filteredCourses.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, index) => (
                  <PaginationItem key={index}>
                    {pageNum === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
