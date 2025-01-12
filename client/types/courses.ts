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
