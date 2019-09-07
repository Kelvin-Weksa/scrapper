import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from './kard';
import Toolbar from '@material-ui/core/Toolbar';
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
    ! props.loaded ? data = new Array ( 9 ) .fill ( { } ) .entries ( ) : data = props.elements .entries ( );
    for ( const [ index , value ] of data ) {
      items.push (
        <Grid item xl={2} md={3} sm={12} xs={12} key={index}>
          <Card
            characterName={value.name}
            characterPost={value.job}
            characterImage={value.image}
            characterMarket={value.market}
            characterAbout={value.about}
            characterPhone={value.phone}
            characterFax={value.fax}
            characterMail={value.mail}
            characterMap={value.map}
            characterLinkedIn={value.linkedIn}
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
    <div className={classes.root} >
        <Toolbar/>
        <Grid container xs={12} spacing={4} justify="space-evenly">
          <FormRow />
        </Grid>
    </div>
  );
}

export default NestedGrid;
