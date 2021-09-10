import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import { DailyData } from "./model/DailyData";
import { School } from "./model/School";
import { SchoolData } from "./model/SchoolData";
import { StatNumber } from "./StatNumber";
import { FavoriteBorder, Favorite } from '@material-ui/icons';

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

export function SchoolList(props: SchoolListProps) {
    const classes = useStyles();

    const findSchoolData = (dailyData: DailyData | undefined, schoolName: string): SchoolData | undefined => {
        return dailyData?.schoolData.find(sd => sd.name === schoolName);
    };

    return (
        <TableContainer component={Paper} className="schoolList">
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>School Name</TableCell>
                        <TableCell className="staffActiveCases" title="Staff Active Cases"><div>Staff Active Cases</div></TableCell>
                        <TableCell className="staffQuarantined" title="Staff Quarantined"><div>Staff Quarantined</div></TableCell>
                        <TableCell className="studentActiveCases" title="Student Active Cases"><div>Student Active Cases</div></TableCell>
                        <TableCell className="studentQuarantined" title="Student Quarantined"><div>Student Quarantined</div></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.schools?.map(school => {
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