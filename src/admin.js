import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import SectionDesktop from './sectionDesktop';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Grid'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
  },
  grow: {
    flexGrow: 1,
  },
}));

function SmallCard (props){
  const classes = useStyles ();
  return (
    <Grid item {...props}>
      <Paper className={classes.root}>
        <Typography variant="h5" component="h3">
          
        </Typography>
      </Paper>
    </Grid>
  )
}

export default function PaperSheet() {
  const classes = useStyles();

  return (
    <div>
      <Toolbar>
        <div className={classes.grow} />
        <SectionDesktop/>
      </Toolbar>
      <Grid container spacing={3} >
        <SmallCard xs={3}/>
        <SmallCard xs={3}/>
        <SmallCard xs={3}/>
        <SmallCard xs={3}/>
      </Grid>
    </div>
  );
}
