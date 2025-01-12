"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Bookmark,
  CheckCircle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Course, Dependencies } from "@/types/courses";
import Link from "next/link";

interface CourseNodeProps {
  courseCode: string;
  initialCourseInfo?: Course;
  level?: number;
  className?: string;
}

const CourseNode: React.FC<CourseNodeProps> = ({
  courseCode,
  initialCourseInfo,
  level = 0,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [dependencies, setDependencies] = useState<Dependencies>([]);
  const [courseInfo, setCourseInfo] = useState<Course | null>(
    initialCourseInfo || null,
  );

  useEffect(() => {
    if (!courseInfo) {
      fetch(`/api/course/${courseCode}`)
        .then((res) => res.json())
        .then((data) => setCourseInfo(data))
        .catch(console.error);
    }
  }, [courseCode, courseInfo]);

  useEffect(() => {
    if (dependencies.length === 0) {
      fetch(`/api/course/${courseCode}/dependencies`)
        .then((res) => res.json())
        .then((data) => setDependencies(data))
        .catch(console.error);
    }
  }, [courseCode, dependencies]);

  useEffect(() => {
    const checkStatus = () => {
      setIsBookmarked(
        getBookmarks().some((course: Course) => course.code === courseCode),
      );
      setIsAdded(
        getAddedCourses().some((course: Course) => course.code === courseCode),
      );
    };

    checkStatus();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bookmarkedCourses" || e.key === "addedCourses") {
        checkStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [courseCode]);

  const handleExpand = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    if (!isExpanded && dependencies.length === 0) {
      try {
        const res = await fetch(`/api/course/${courseCode}/dependencies`);
        const deps = await res.json();
        setDependencies(deps);
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const handleBookmark = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isBookmarked) {
      removeBookmark(courseCode);
    } else {
      addBookmark(courseInfo!);
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleAddedCourse(courseInfo!);
    setIsAdded(!isAdded);
  };

  if (!courseInfo) {
    return <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />;
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className="relative flex flex-col items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-center pb-6">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="min-w-36 rounded-md border border-gray-800 px-10 py-4 text-base dark:bg-gray-300 dark:text-black">
                  {courseCode}
                </button>
              </PopoverTrigger>
              <PopoverContent className="min-w-64">
                <div className="text-sm">
                  <div className="mb-2 flex items-center justify-between">
                    {level > 0 ? (
                      <div className="group flex items-center hover:underline">
                        <Link
                          href={`/${courseInfo.code}`}
                          className="text-base"
                        >
                          {courseCode}
                        </Link>
                        <ArrowUpRight
                          size={16}
                          className="hidden text-gray-400 group-hover:inline group-hover:cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="text-base">{courseCode}</div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleBookmark(e)}
                        className="rounded-full p-1"
                      >
                        <Bookmark
                          size={16}
                          className={
                            isBookmarked
                              ? "fill-current text-blue-500"
                              : "text-gray-400"
                          }
                        />
                      </button>
                      <button
                        onClick={(e) => handleAdd(e)}
                        className="rounded-full p-1"
                      >
                        {isAdded ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Plus size={16} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <h5 className="mb-1">{courseInfo.name}</h5>
                  <p className="mb-2 text-gray-600">{courseInfo.description}</p>
                  <p className="text-sm text-gray-500">
                    Credits: {courseInfo.hours}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {isHovered && !isExpanded && dependencies.length > 0 && (
            <button
              onClick={(e) => handleExpand(e)}
              className="absolute bottom-0 rounded-full p-1 transition-colors"
            >
              <ArrowDown
                size={20}
                className="text-gray-400 transition-colors hover:text-black dark:hover:text-white"
              />
            </button>
          )}

          {isHovered && dependencies.length === 0 && (
            <div className="absolute bottom-0 h-0.5 w-full bg-red-600" />
          )}
        </div>
      </div>

      {isExpanded && dependencies.length > 0 && (
        <div className="mt-8 flex flex-nowrap justify-center gap-8">
          {dependencies.map((dep: string) => (
            <div key={dep} className="relative">
              <div className="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 transform bg-gray-300" />
              <CourseNode courseCode={dep} level={level + 1} />
            </div>
          ))}
        </div>
      )}

      {/* {isExpanded && dependencies.length > 0 && (
        <div className="mt-8 flex gap-8 overflow-x-auto">
          <div className="flex flex-nowrap justify-center">
            {dependencies.map((dep: string) => (
              <div key={dep} className="relative">
                <div className="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 transform bg-gray-300" />
                <CourseNode courseCode={dep} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default CourseNode;

// Utility functions for bookmark management
const getBookmarks = () => {
  const stored = localStorage.getItem("bookmarkedCourses");
  return stored ? JSON.parse(stored) : [];
};

const addBookmark = (course: Course) => {
  const bookmarks = getBookmarks();
  if (!bookmarks.some((b: Course) => b.code === course.code)) {
    bookmarks.push({
      code: course.code,
      name: course.name,
      description: course.description,
      hours: course.hours,
      bookmarkedAt: new Date().toISOString(),
    });
    localStorage.setItem("bookmarkedCourses", JSON.stringify(bookmarks));
  }
};

const removeBookmark = (courseCode: string) => {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter(
    (course: Course) => course.code !== courseCode,
  );
  localStorage.setItem("bookmarkedCourses", JSON.stringify(filtered));
};

// Same pattern for added courses
const getAddedCourses = () => {
  const stored = localStorage.getItem("addedCourses");
  return stored ? JSON.parse(stored) : [];
};

const toggleAddedCourse = (course: Course) => {
  const added = getAddedCourses();
  const isCurrentlyAdded = added.some((c: Course) => c.code === course.code);
  const newAdded = isCurrentlyAdded
    ? added.filter((c: Course) => c.code !== course.code)
    : [
        ...added,
        {
          code: course.code,
          name: course.name,
          description: course.description,
          hours: course.hours,
          addedAt: new Date().toISOString(),
        },
      ];
  localStorage.setItem("addedCourses", JSON.stringify(newAdded));
};
