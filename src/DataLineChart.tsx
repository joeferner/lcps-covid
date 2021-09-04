import { Paper } from "@material-ui/core";
import moment from "moment";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { DailyData } from "./model/DailyData";
import { SchoolType } from "./model/SchoolType";

export interface DataLineChartProps {
    dailyData: DailyData[] | undefined;
    favoriteSchoolNames: string[];
}

interface DataPoint {
    date: Date;
    favorite: number;
    elementarySchool: number;
    middleSchool: number;
    highSchool: number;
    other: number;
}

function sum(arr: number[]): number {
    return arr.reduce((prev, cur) => prev + cur, 0);
}

function xAxisTickFormatter(tickItem: any): string {
    if (typeof tickItem.getMonth === 'function') {
        return moment(tickItem).format('M/d');
    } else {
        return tickItem;
    }
}

export function DataLineChart(props: DataLineChartProps) {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

    useEffect(() => {
        const newDataPoints: DataPoint[] = (props.dailyData || []).map(dd => {
            const favorite = sum(dd.schoolData
                .filter(sd => props.favoriteSchoolNames.includes(sd.name))
                .map(sd => sd.staffActiveCases + sd.studentActiveCases));
            const elementarySchool = sum(dd.schoolData
                .filter(sd => sd.type === SchoolType.ElementarySchool && !props.favoriteSchoolNames.includes(sd.name))
                .map(sd => sd.staffActiveCases + sd.studentActiveCases));
            const middleSchool = sum(dd.schoolData
                .filter(sd => sd.type === SchoolType.MiddleSchool && !props.favoriteSchoolNames.includes(sd.name))
                .map(sd => sd.staffActiveCases + sd.studentActiveCases));
            const highSchool = sum(dd.schoolData
                .filter(sd => sd.type === SchoolType.HighSchool && !props.favoriteSchoolNames.includes(sd.name))
                .map(sd => sd.staffActiveCases + sd.studentActiveCases));
            const other = sum(dd.schoolData
                .filter(sd => sd.type === SchoolType.Other && !props.favoriteSchoolNames.includes(sd.name))
                .map(sd => sd.staffActiveCases + sd.studentActiveCases));
            return {
                date: dd.date,
                favorite,
                elementarySchool,
                middleSchool,
                highSchool,
                other
            };
        });
        setDataPoints(newDataPoints);
    }, [props.dailyData, props.favoriteSchoolNames, setDataPoints]);

    return (<Paper>
        <div style={{ margin: '5px' }}>
            <AreaChart width={500} height={300} data={dataPoints}>
                <XAxis dataKey="date" tickFormatter={xAxisTickFormatter} />
                <YAxis />
                <Tooltip />
                <Legend />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="favorite" name="Favorite" stackId="1" stroke="#184a49" fill="#184a49" />
                <Area type="monotone" dataKey="elementarySchool" name="ES" stackId="1" stroke="#c78045" fill="#ffa357" />
                <Area type="monotone" dataKey="middleSchool" name="MS" stackId="1" stroke="#a7a3a0" fill="#ccc7c3" />
                <Area type="monotone" dataKey="highSchool" name="HS" stackId="1" stroke="#387577" fill="#438d90" />
                <Area type="monotone" dataKey="other" name="Other" stackId="1" stroke="#8b9fa5" fill="#bedbe3" />
            </AreaChart>
        </div>
    </Paper>);
}