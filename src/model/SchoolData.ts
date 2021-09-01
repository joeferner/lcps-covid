import { SchoolType } from "./SchoolType";

export interface SchoolData {
    name: string;
    type: SchoolType;
    staffActiveCases: number;
    staffQuarantining: number;
    studentActiveCases: number;
    studentQuarantining: number;
}