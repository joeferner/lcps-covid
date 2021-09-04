import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    plusMinus: {
        paddingLeft: '5px',
        fontSize: '10pt',
    },
    plus: {
        color: '#ff0000',
    },
    minus: {
        color: '#39d039',
    },
});

export interface StatNumberProps {
    value: number;
    lastValue?: number;
}

export function StatNumber(props: StatNumberProps) {
    const classes = useStyles();

    if (props.lastValue && props.value !== props.lastValue) {
        const plusMinus = (props.value > props.lastValue) ? '+' : '-';
        const className = props.value > props.lastValue ? classes.plus : classes.minus;
        return (<span>
            {props.value.toLocaleString()}
            <span className={`${classes.plusMinus} ${className}`}>{plusMinus}{Math.abs(props.value - props.lastValue).toLocaleString()}</span>
        </span>);
    }
    return (<span>
        {props.value.toLocaleString()}
    </span>);
}