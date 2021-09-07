import { makeStyles } from "@material-ui/core";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { CurrentTotals } from "./CurrentTotals";
import { DataLineChart } from "./DataLineChart";
import { DailyData } from "./model/DailyData";
import { Data } from "./model/Data";
import { School } from "./model/School";
import { SchoolList } from "./SchoolList";

const LOCAL_STORAGE_FAVORITE_SCHOOL_NAMES_KEY = 'v1.favoriteSchoolNames';

const sortSchools = (schools: School[], favoriteSchoolNames: string[]): School[] => {
    return schools.sort((a, b) => {
        const aIsFavorite = favoriteSchoolNames.includes(a.name);
        const bIsFavorite = favoriteSchoolNames.includes(b.name);
        if (aIsFavorite && !bIsFavorite) {
            return -1;
        }
        if (!aIsFavorite && bIsFavorite) {
            return 1;
        }
        return a.name > b.name ? 1 : -1;
    });
};

const useStyles = makeStyles({
    wrapper: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
});

export function App() {
    const classes = useStyles();
    const [dailyData, setDailyData] = useState<DailyData[] | undefined>(undefined);
    const [mostRecentDailyData, setMostRecentDailyData] = useState<DailyData | undefined>(undefined);
    const [secondMostRecentDailyData, setSecondMostRecentDailyData] = useState<DailyData | undefined>(undefined);
    const [schools, setSchools] = useState<School[] | undefined>(undefined);
    const [favoriteSchoolNames, setFavoriteSchoolNames] = useState<string[]>([]);

    const handleFavoriteToggle = useCallback((schoolName: string, newValue: boolean): void => {
        const set = new Set<string>(favoriteSchoolNames);
        if (newValue) {
            set.add(schoolName);
        } else {
            set.delete(schoolName);
        }
        const newFavoriteSchoolNames = [...set];
        setFavoriteSchoolNames(newFavoriteSchoolNames);
        window.localStorage.setItem(LOCAL_STORAGE_FAVORITE_SCHOOL_NAMES_KEY, JSON.stringify(newFavoriteSchoolNames));
        setSchools(sortSchools(schools || [], favoriteSchoolNames));
    }, [setFavoriteSchoolNames, setSchools, favoriteSchoolNames, schools]);

    useEffect(() => {
        const loadFavoriteSchoolNames = (): string[] => {
            const favoriteSchoolNamesString = window.localStorage.getItem(LOCAL_STORAGE_FAVORITE_SCHOOL_NAMES_KEY);
            if (favoriteSchoolNamesString) {
                const schoolNames = JSON.parse(favoriteSchoolNamesString);
                setFavoriteSchoolNames(schoolNames);
                return schoolNames;
            }
            return [];
        };

        const refresh = async (favoriteSchoolNames: string[]) => {
            console.log('loading data...');
            const response = await axios.get('/data.json');
            const data = response.data as Data;
            const responseDailyData = data.dailyData
                .map(a => {
                    const m = a.date.match('([0-9]+)-([0-9]+)-([0-9]+).*');
                    a.date = new Date(`${m[1]}/${m[2]}/${m[3]}`);
                    return a;
                })
                .sort((a, b) => {
                    return a.date.getTime() - b.date.getTime();
                });
            const schools = sortSchools(data.schools, favoriteSchoolNames);
            setDailyData(responseDailyData);
            setMostRecentDailyData(responseDailyData[responseDailyData.length - 1]);
            setSecondMostRecentDailyData(responseDailyData[responseDailyData.length - 2]);
            setSchools(schools);
        };

        const favoriteSchoolNames = loadFavoriteSchoolNames();
        refresh(favoriteSchoolNames);
    }, []);

    return (
        <div>
            <div>
                <a href="https://www.lcps.org/COVID19data">Source</a>
            </div>
            <div className={classes.wrapper}>
                <CurrentTotals mostRecentDailyData={mostRecentDailyData} secondMostRecentDailyData={secondMostRecentDailyData} />
                <SchoolList
                    onFavoriteToggle={handleFavoriteToggle}
                    favoriteSchoolNames={favoriteSchoolNames}
                    schools={schools}
                    mostRecentDailyData={mostRecentDailyData}
                    secondMostRecentDailyData={secondMostRecentDailyData} />
                <DataLineChart dailyData={dailyData} favoriteSchoolNames={favoriteSchoolNames} />
            </div>
        </div>
    );
}
