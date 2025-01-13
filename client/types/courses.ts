// types/course.ts
export interface Course {
  code: string;
  name: string;
  description: string;
  hours: string;
  restrictions: string;
  department: string;
}

export type Dependencies = string[];

export interface Professor {
  difficulty: number;
  firstName: string;
  lastName: string;
  schoolId: string;
  wouldTakeAgainPercent: number;
  name: string;
  rating: number;
  legacyId: number;
  id: string;
  department: string;
  schoolName: string;
  numRatings: number;
}
