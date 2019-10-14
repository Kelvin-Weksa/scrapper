import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Firebase from './firebase'
import Switch from '@material-ui/core/Switch';

const IOSSwitch = withStyles(theme => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      //transform: 'translateX(5px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: "#D3D3D3",
    opacity: 1,
    transition: "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    textAlign:'center',
    position : 'sticky' ,
    top : 0 ,
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

function createData(name, followed, subscription, email, spent , data , uid) {
  return { name, followed, subscription, email , spent , data ,uid };
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxHeight: "70vh",
    overflow: 'auto',
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    "&:hover": {
      transform: `scale(1.1)` ,
      boxShadow: `0 0 11px ${theme.palette.secondary.main}` ,
    },
  },
  table: {
    minWidth: 700,
    position:'relative',
  },
  sticky:{
    position : 'sticky' ,
    top : 0 ,
    zIndex: theme.zIndex.appBar ,
  },
}));

export default function CustomizedTables ( props ) {
  const classes = useStyles();

  const showing = props.allUsers.map((item) => {
    return createData(
       item.displayName,
       item.followed,
       item.subscription,
       item.email,
       item.spent,
       item.data,
       item.uid
    )
  })

  const [state, setState] = React.useState({});

  //console.log(state);
  React.useEffect(() => {
    if (Object.keys(state).length === 0 && state.constructor === Object) {
      if (props.allUsers.length) {
        setState(
          props.allUsers.reduce((state_,item)=>{
            state_[item.uid]=false
            return state_;
          },{})
        )
      }
    }
    (async()=> {
      await Promise.all([
        Firebase.database().ref  ( "userData" )
          .once ( 'value').then ( snapshot=>{
            if (snapshot.exists ()) {
              let userdata_ = []
              snapshot.forEach ( function ( childSnapshot) {
                let data={};
                data.data= childSnapshot.val();
                data.key=childSnapshot.key;
                userdata_.push(data)
              });
              if (userdata_.length) {
                var state_ = state;
                userdata_.forEach ( ( list , index ) => {
                  state_[list.key] = list.data.isAdmin;
                } )
                if (JSON.stringify(state)!==JSON.stringify(state_)) {
                  setState(state_)
                }
              }
            }
        } ),
      ])
    })();
    return ()=>{
    }
  },[state,props.allUsers])

  const handleChange = name => event => {
    let picture = event.target.checked;
    setState({ ...state, [name]: picture });
    let initial = showing.filter(item=>item.uid===name)[0]
    Firebase.database().ref ( "userData/" + name + "/isAdmin")
      .set ( event.target.checked , (error) => {
        if (!error) {
          let msg=
            `${picture ? "UpGrading" : "DownGrading"}the status of ${initial.name.replace ( /_/g, ' ')} to ${picture ? "Admin" : "User"} `;
          alert(msg);
        }else {
          console.log ( error )
          alert ( 'failed to update metering information plan to FireBase!' );
        }
      } )
  };

  return (
    <Paper className={classes.root}>
      <Table stickyHeader={true} className={classes.table} aria-label="sticky table">
        <TableHead className={classes.sticky}>
          <TableRow>
            <StyledTableCell align="left">Name</StyledTableCell>
            <StyledTableCell align="right">email</StyledTableCell>
            <StyledTableCell align="right">Days left in subscription</StyledTableCell>
            <StyledTableCell align="right">Total Amount Spent</StyledTableCell>
            <StyledTableCell align="right">No. of Companies followed</StyledTableCell>
            <StyledTableCell align="right">Downloaded data (MB)</StyledTableCell>
            <StyledTableCell align="right">Admin status</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {showing.map(row => (
            <StyledTableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="center">{row.email}</TableCell>
              <TableCell align="center">{row.subscription}</TableCell>
              <TableCell align="center">{row.spent}</TableCell>
              <TableCell align="center">{row.followed}</TableCell>
              <TableCell align="center">{row.data||0}MB</TableCell>
              <TableCell align="right">
                <IOSSwitch
                  checked={state[row.uid]||false}
                  onChange={handleChange(row.uid)}
                />
              </TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
