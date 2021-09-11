import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from "@material-ui/core";
import { DailyData } from "./model/DailyData";
import { School } from "./model/School";
import { SchoolData } from "./model/SchoolData";
import { StatNumber } from "./StatNumber";
import { FavoriteBorder, Favorite } from '@material-ui/icons';
import { useEffect, useState } from "react";

export interface SchoolListProps {
    mostRecentDailyData: DailyData | undefined;
    secondMostRecentDailyData: DailyData | undefined;
    schools: School[] | undefined;
    favoriteSchoolNames: string[];
    onFavoriteToggle: (schoolName: string, newValue: boolean) => void;
}

const useStyles = makeStyles({
    favorite: {
        cursor: 'pointer',
        marginRight: '5px'
    },
    column: {
        display: 'flex'
    }
});

const COLUMNS = [
    { title: 'School Name', column: 'name' },
    { title: 'Staff Active Cases', column: 'staffActiveCases' },
    { title: 'Staff Quarantined', column: 'staffQuarantining' },
    { title: 'Student Active Cases', column: 'studentActiveCases' },
    { title: 'Student Quarantined', column: 'studentQuarantining' }
];

function findSchoolData(dailyData: DailyData | undefined, schoolName: string): SchoolData | undefined {
    return dailyData?.schoolData.find(sd => sd.name === schoolName);
}

function sortSchools(
    schoolsToSort: School[],
    orderBy: keyof SchoolData | undefined,
    order: 'asc' | 'desc',
    schoolData: DailyData | undefined,
    favoriteSchoolNames: string[]
): School[] {
    const schools: School[] = [...schoolsToSort];
    const myOrderBy = orderBy || 'name';
    const compare = (a: School, b: School): number => {
        if (myOrderBy === 'name') {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }
        const aSchoolData = findSchoolData(schoolData, a.name);
        const bSchoolData = findSchoolData(schoolData, b.name);
        if (!aSchoolData && !bSchoolData) {
            return 0;
        }
        if (!aSchoolData) {
            return -1;
        }
        if (!bSchoolData) {
            return 1;
        }
        const aValue = (aSchoolData[myOrderBy] || 0) as number;
        const bValue = (bSchoolData[myOrderBy] || 0) as number;
        return aValue - bValue;
    };
    const applyOrder = (n: number): number => {
        return order === 'asc' ? n : -n;
    }
    schools.sort((a, b) => {
        const aIsFavorite = favoriteSchoolNames.includes(a.name);
        const bIsFavorite = favoriteSchoolNames.includes(b.name);
        if (aIsFavorite && bIsFavorite) {
            return applyOrder(compare(a, b));
        }
        if (aIsFavorite) {
            return -1;
        }
        if (bIsFavorite) {
            return 1;
        }
        return applyOrder(compare(a, b));
    });
    return schools;
}

export function SchoolList(props: SchoolListProps) {
    const [orderBy, setOrderBy] = useState<keyof SchoolData | undefined>(undefined);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [schools, setSchools] = useState<School[]>([]);
    const classes = useStyles();

    useEffect(() => {
        setSchools(sortSchools(props.schools || [], orderBy, order, props.mostRecentDailyData, props.favoriteSchoolNames));
    }, [props.schools, props.mostRecentDailyData, props.favoriteSchoolNames, order, orderBy]);

    const handleSort = (column: string): void => {
        const isAsc = orderBy === column && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(column as keyof SchoolData);
    };

    return (
        <TableContainer component={Paper} className="schoolList">
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        {COLUMNS.map(column => {
                            return (<TableCell className={column.column} title={column.title} key={column.column}>
                                <TableSortLabel
                                    active={orderBy === column.column}
                                    direction={orderBy === column.column ? order : 'asc'}
                                    onClick={() => handleSort(column.column)}>
                                    <div className="columnTitle">{column.title}</div>
                                </TableSortLabel>
                            </TableCell>);
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {schools.map(school => {
                        const mostRecentSchoolData = findSchoolData(props.mostRecentDailyData, school.name);
                        const secondMostRecentSchoolData = findSchoolData(props.secondMostRecentDailyData, school.name);
                        const isFavorite = props.favoriteSchoolNames.includes(school.name);
                        return (<TableRow key={school.name}>
                            <TableCell className={classes.column}><span className={classes.favorite} onClick={() => props.onFavoriteToggle(school.name, !isFavorite)}>
                                {isFavorite ? (<Favorite />) : (<FavoriteBorder />)}</span> {school.name}</TableCell>
                            <TableCell><StatNumber value={mostRecentSchoolData?.staffActiveCases || 0} lastValue={secondMostRecentSchoolData?.staffActiveCases}></StatNumber></TableCell>
                            <TableCell><StatNumber value={mostRecentSchoolData?.staffQuarantining || 0} lastValue={secondMostRecentSchoolData?.staffQuarantining}></StatNumber></TableCell>
                            <TableCell><StatNumber value={mostRecentSchoolData?.studentActiveCases || 0} lastValue={secondMostRecentSchoolData?.studentActiveCases}></StatNumber></TableCell>
                            <TableCell><StatNumber value={mostRecentSchoolData?.studentQuarantining || 0} lastValue={secondMostRecentSchoolData?.studentQuarantining}></StatNumber></TableCell>
                        </TableRow>);
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}