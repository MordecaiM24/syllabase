import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Course, Professor } from "@/types/courses";
import { BookOpen, SquareArrowOutUpRight, ThumbsUp, Users } from "lucide-react";
import { Suspense } from "react";
import CourseNode from "./CourseNode";

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const code = (await params).code.toUpperCase();
  const courseInfo = await getCourseInfo(code);
  const professorInfo = await getProfessorInfo(code);

  if (courseInfo === undefined) {
    throw new Error("Course not found");
  }

  return (
    <Suspense fallback={<div>Loading course tree...</div>}>
      <div className="flex min-h-full flex-col px-4 py-8 gap-6">
        <Card className="w-full">
          {/* Course Header and Description - Always visible */}
          <CardHeader className="pb-2">
            <div className="flex items-baseline gap-4">
              <CardTitle className="text-3xl font-light">{code}</CardTitle>
            </div>
            <CardDescription className="text-lg">
              {courseInfo.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Description */}
            <p className="dark:text-white text-gray-700">
              {courseInfo.description}
            </p>

            {/* Tabs for Professors and Prerequisites */}
            <Tabs defaultValue="prerequisites" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prerequisites" className="text-lg py-4">
                  Prerequisites
                </TabsTrigger>

                <TabsTrigger value="professors" className="text-lg py-4">
                  Professors ({professorInfo.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="professors" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {professorInfo.map((prof) => (
                    <ProfessorCard key={prof.id} prof={prof} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="prerequisites" className="mt-6">
                <div className="flex justify-center">
                  <CourseNode
                    courseCode={code}
                    initialCourseInfo={courseInfo}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}

function ProfessorCard({ prof }: { prof: Professor }) {
  return (
    <TooltipProvider key={prof.id}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl p-0 font-medium flex items-center">
            {prof.name}
            <a
              href={`https://www.ratemyprofessors.com/professor/${prof.legacyId}`}
              target="_blank"
              rel="noreferrer"
            >
              <SquareArrowOutUpRight className="ms-2 h-4 w-4 text-gray-500 cursor-pointer" />
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Rating Section */}

          <div className="flex space-x-4 items-center">
            <span className="text-base text-gray-500">
              Rating: {prof.rating.toFixed(1)}
            </span>
          </div>
          <Progress value={(prof.rating / 5) * 100} className="h-1" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">Would Take Again</span>
              </div>
              <p className="font-medium">
                {prof.wouldTakeAgainPercent > -1
                  ? `${prof.wouldTakeAgainPercent.toFixed(2)} %`
                  : "N/A"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">Difficulty</span>
              </div>
              <p className="font-medium">{prof.difficulty.toFixed(1)} / 5</p>
            </div>
          </div>

          {/* Number of Ratings */}
          <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
            <Users className="h-4 w-4" />
            {prof.numRatings} ratings
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function getRatingVariant(
  rating: number
): "default" | "secondary" | "destructive" {
  if (rating >= 4) return "default";
  if (rating >= 3) return "secondary";
  return "destructive";
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

async function getProfessorInfo(code: string): Promise<Professor[]> {
  const res = await fetch(`${process.env.API_URL}/course/${code}/professors`, {
    cache: "force-cache",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch professors for ${code}`);
  }

  const sortedProfs = await res.json();
  return sortedProfs.sort((a: Professor, b: Professor) => b.rating - a.rating);
}
