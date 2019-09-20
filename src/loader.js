import React from 'react';
import { makeStyles , useTheme } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withRouter } from 'react-router-dom'

const useStyles = makeStyles( theme =>({
  root: {
    flexGrow: 1,
  },
}));

function LinearIndeterminate( props ) {
  const classes = useStyles();
  const theme = useTheme ( )

  React.useEffect ( () => {
    props.history.listen((location, action) => {
      console.log("En--Route change");
    });
  } )

  return (
    <div className={classes.root}>
      <LinearProgress style={{zIndex: theme.zIndex.tooltip,display:'none'}} />
    </div>
  );
}

export default withRouter( LinearIndeterminate );
