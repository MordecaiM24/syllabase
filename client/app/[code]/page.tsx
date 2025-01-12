// CourseExplorer.jsx
import { Suspense } from "react";
import CourseNode from "./CourseNode";
import { Course } from "@/types/courses";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const code = (await params).code.toUpperCase();
  const courseInfo = await getCourseInfo(code);
  if (courseInfo === undefined) {
    throw new Error("Course not found");
  }
  return (
    <Suspense fallback={<div>Loading course tree...</div>}>
      <div className="flex min-h-full min-w-full px-4 py-8">
        <div className="mx-12 flex w-[320px] min-w-[320px] flex-col gap-y-4">
          <h1 className="text-center text-2xl font-light">{code}</h1>
          <p className="text-center">{courseInfo.name}</p>
          <p className="text">{courseInfo.description}</p>
        </div>

        <CourseNode
          courseCode={code}
          className="mt-12 flex-1 justify-self-center"
          initialCourseInfo={courseInfo}
        />
      </div>
    </Suspense>
  );
}

async function getCourseInfo(code: string): Promise<Course> {
  const res = await fetch(`${process.env.API_URL}/course/${code}`, {
    cache: "force-cache",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch course ${code}`);
  }

  return res.json();
}
