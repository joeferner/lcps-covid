import { makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core";
import { useEffect, useState } from "react";
import Moment from "react-moment";
import { DailyData } from "./model/DailyData";
import { StatNumber } from "./StatNumber";

export interface CurrentTotalsProps {
    mostRecentDailyData: DailyData | undefined;
    secondMostRecentDailyData: DailyData | undefined;
}

const useStyles = makeStyles({
    title: {
        fontWeight: 'bold',
    },
});

export function CurrentTotals(props: CurrentTotalsProps) {
    const classes = useStyles();
    const [mostRecentStats, setMostRecentStats] = useState<Stats>(calculateStats(undefined));
    const [secondMostRecentStats, setSecondMostRecentStats] = useState<Stats>(calculateStats(undefined));

    useEffect(() => {
        setMostRecentStats(calculateStats(props.mostRecentDailyData));
    }, [props.mostRecentDailyData]);
    useEffect(() => {
        setSecondMostRecentStats(calculateStats(props.secondMostRecentDailyData));
    }, [props.secondMostRecentDailyData]);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className={classes.title}>Last Updated</TableCell>
                        <TableCell><Moment date={props.mostRecentDailyData?.date} format="MM/DD/YYYY"></Moment></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.title}>Total Active Cases</TableCell>
                        <TableCell><StatNumber value={mostRecentStats.totalActiveCases} lastValue={secondMostRecentStats.totalActiveCases}></StatNumber>&nbsp;
                            (Staff: <StatNumber value={mostRecentStats.totalStaffActiveCases} lastValue={secondMostRecentStats.totalStaffActiveCases}></StatNumber>,
                            Students: <StatNumber value={mostRecentStats.totalStudentActiveCases} lastValue={secondMostRecentStats.totalStudentActiveCases}></StatNumber>)</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.title}>Total Quarantining</TableCell>
                        <TableCell><StatNumber value={mostRecentStats.totalQuarantining} lastValue={secondMostRecentStats.totalQuarantining}></StatNumber>&nbsp;
                            (Staff: <StatNumber value={mostRecentStats.totalStaffQuarantining} lastValue={secondMostRecentStats.totalStaffQuarantining}></StatNumber>,
                            Students: <StatNumber value={mostRecentStats.totalStudentQuarantining} lastValue={secondMostRecentStats.totalStudentQuarantining}></StatNumber>)</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function calculateStats(data: DailyData | undefined): Stats {
    let totalActiveCases = 0;
    let totalQuarantining = 0;
    let totalStaffActiveCases = 0;
    let totalStaffQuarantining = 0;
    let totalStudentActiveCases = 0;
    let totalStudentQuarantining = 0;
    for (const d of data?.schoolData || []) {
        totalActiveCases += d.staffActiveCases + d.studentActiveCases;
        totalStaffActiveCases += d.staffActiveCases;
        totalStudentActiveCases += d.studentActiveCases;
        totalQuarantining += d.staffQuarantining + d.studentQuarantining;
        totalStaffQuarantining += d.staffQuarantining;
        totalStudentQuarantining += d.studentQuarantining;
    }
    return {
        totalActiveCases,
        totalQuarantining,
        totalStaffActiveCases,
        totalStaffQuarantining,
        totalStudentActiveCases,
        totalStudentQuarantining,
    }
}

interface Stats {
    totalActiveCases: number;
    totalQuarantining: number;
    totalStaffActiveCases: number;
    totalStaffQuarantining: number;
    totalStudentActiveCases: number;
    totalStudentQuarantining: number;
}