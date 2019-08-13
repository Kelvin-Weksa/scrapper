import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from './kard';
//import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles ( theme => ( {
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
} ) );

const NestedGrid =  props => {
  const classes = useStyles();
  function FormRow (  ) {
    const items = [ ];
    let data = [ ];// eslint-disable-next-line
    ! props.loaded ? data = new Array ( 8 ) .fill ( { } ) .entries ( ) : data = props.elements .entries ( );
    for ( const [ index , value ] of data ) {
      items.push (
        <Grid item xs={3} key={index}>
          <Card
            characterName={value.name}
            characterPost={value.job}
            characterImage={value.image}
            characterMarket={value.market}
            from={value.from}
          />
        </Grid>
      )
    }
    return (
      <React.Fragment>
        {items}
      </React.Fragment>
    );
  }
  //console.log ( JSON.stringify ( props ) );
  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={3}>
          <FormRow />
        </Grid>
      </Grid>
    </div>
  );
}

export default NestedGrid;
