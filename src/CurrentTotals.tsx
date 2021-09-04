import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Moment from "react-moment";
import { DailyData } from "./model/DailyData";

export interface CurrentTotalsProps {
    data: DailyData | undefined;
}

const useStyles = makeStyles({
    title: {
        fontWeight: 'bold',
    },
});

export function CurrentTotals(props: CurrentTotalsProps) {
    const classes = useStyles();

    let totalActiveCases = 0;
    let totalQuarantining = 0;
    let totalStaffActiveCases = 0;
    let totalStaffQuarantining = 0;
    let totalStudentActiveCases = 0;
    let totalStudentQuarantining = 0;
    for (const d of props.data?.schoolData || []) {
        totalActiveCases += d.staffActiveCases + d.studentActiveCases;
        totalStaffActiveCases += d.staffActiveCases;
        totalStudentActiveCases += d.studentActiveCases;
        totalQuarantining += d.staffQuarantining + d.studentQuarantining;
        totalStaffQuarantining += d.staffQuarantining;
        totalStudentQuarantining += d.studentQuarantining;
    }
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className={classes.title}>Last Updated</TableCell>
                        <TableCell><Moment date={props.data?.date} format="MM/DD/YYYY"></Moment></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.title}>Total Active Cases</TableCell>
                        <TableCell>{totalActiveCases.toLocaleString()} (Staff: {totalStaffActiveCases.toLocaleString()}, Students: {totalStudentActiveCases.toLocaleString()})</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.title}>Total Quarantining</TableCell>
                        <TableCell>{totalQuarantining.toLocaleString()} (Staff: {totalStaffQuarantining.toLocaleString()}, Students: {totalStudentQuarantining.toLocaleString()})</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}
