import { DailyData } from "./DailyData";
import { School } from "./School";

export interface Data {
    schools: School[];
    dailyData: DailyData[];
}