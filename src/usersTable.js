import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton'

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    textAlign:'center',
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
}))(TableRow);

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Kelvin Wekesa', "50", "3 days", "Mobile", 4.0),
  createData('Bernard Lom', "0", "10 days", "Desktop", 4.3),
  createData('Kel vin', "80", "7 days", "Tablet", 6.0),
  createData('Vin Kel', "ALL", "11 days", "Desktop", 3.9),
];

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    //marginTop: theme.spacing(3),
    overflowX: 'auto',
    //overflow: 'visible',
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    "&:hover": {
      transform: `scale(1.1)` ,
      boxShadow: `0 0 11px ${theme.palette.secondary.main}` ,
    },
  },
  table: {
    minWidth: 700,
  },
}));

export default function CustomizedTables ( props ) {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <StyledTableCell align="right">Name</StyledTableCell>
            <StyledTableCell align="right">No. of Companies followed</StyledTableCell>
            <StyledTableCell align="right"> Days left in subscription</StyledTableCell>
            <StyledTableCell align="right">Device</StyledTableCell>
            <StyledTableCell align="right">Downloaded data (MB)</StyledTableCell>
            <StyledTableCell align="right"/>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <StyledTableRow key={row.name}>
              <StyledTableCell component="th" scope="row">
                {row.name}
              </StyledTableCell>
              <StyledTableCell align="center">{row.calories}</StyledTableCell>
              <StyledTableCell align="center">{row.fat}</StyledTableCell>
              <StyledTableCell align="center">{row.carbs}</StyledTableCell>
              <StyledTableCell align="center">{row.protein}</StyledTableCell>
              <StyledTableCell align="center">
                <IconButton color='secondary'>
                  <DeleteIcon/>
                </IconButton>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
