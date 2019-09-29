import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import SectionDesktop from './sectionDesktop';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import PeopleIcon from '@material-ui/icons/People';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import green from '@material-ui/core/colors/green';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import red from '@material-ui/core/colors/red';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import DataUsageIcon from '@material-ui/icons/DataUsage';
import Graph from './barchart';
import Doughnut from './doughnutchart';

const useStyles = makeStyles(theme => ({
  paper1: {
    padding: theme.spacing(1.5, 1),
    //overflow: 'visible',
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    "&:hover": {
      transform: `scale(1.1)` ,
      boxShadow: `0 0 11px ${theme.palette.secondary.main}` ,
    },
    minWidth: "50%",
  },
  grow: {
    flexGrow: 1,
  },
  info: {
    display: 'flex' ,
    justifyContent: 'center' ,
    width : theme.mixins.toolbar.minHeight,
    height: theme.mixins.toolbar.minHeight,
    position: 'relative' ,
    top: -(theme.mixins.toolbar.minHeight/2),
    //left: '3vh',
    border: `1px solid ${theme.palette.primary.main}` ,
    borderRadius: '2px',
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 0 11px ` ,
  },
  content:{
    display:'flex',
    flexFlow:'row no-wrap',
},
  container:{
    position:'relative',
    top:theme.mixins.toolbar.minHeight/2,
    display:'flex',
    flexFlow:'row wrap',
    justifyContent:"space-evenly",
  }
}));

function SmallCard (props){
  const classes = useStyles ();
  return (
    <Grid item {...props}style={{display:'flex',justifyContent:'center'}}>
      <Paper className={classes.paper1}>
        <span className={classes.content}>
          <Paper  className={classes.info}>
            <IconButton  className={classes.rightIcon}>
              {props.icon}
            </IconButton>
          </Paper>
          <div style={{flex:' 1 0 auto'}}/>
          <div style={{display:'flex',flexFlow:"column wrap"}}>
            <Typography color="textSecondary" variant="body2" style={{alignSelf:'flex-end'}}>
              {props.title}
            </Typography>
            <Typography variant={props.content? props.content.length <= 9? "h3" : 'h4' : 'h4'} style={{alignSelf:'flex-end'}}>
              {props.content}
            </Typography>
          </div>
        </span>
        <hr/>
        <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-evenly'}}>
          {props.direction ?
            (<Typography variant="subtitle2"  style={{ display:'flex',color:green[500]}}>
              <ArrowUpwardIcon/><div style={{position:'relative',top:'2px'}}>{props.percent}</div>
            </Typography>) :
            (<Typography variant="subtitle2"  style={{ display:'flex',color:red[500]}}>
              <ArrowDownwardIcon/><div style={{position:'relative',top:'2px'}}>{props.percent}</div>
            </Typography>)
          }
          <Typography variant="caption" style={{position:'relative',top:'-5px',flex:'0 0 auto'}}>
           {props.duration ? `${props.duration}` : `since last month`}
          </Typography>
        </div>
      </Paper>
    </Grid>
  )
}

export default function PaperSheet() {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div>
      <Toolbar>
        <div className={classes.grow} />
        <SectionDesktop/>
      </Toolbar>
      <Grid container spacing={2} className={classes.container}>
        <SmallCard xs={12} sm={6} lg={3}
          icon={<PeopleIcon/>}
          title={"Registered Users"}
          content={"250"}
          percent={"0.5%"}
          direction={true}
        />
        <SmallCard xs={12} sm={6} lg={3}
          icon={<MonetizationOnIcon/>}
          title={"Revenue"}
          content={"$15,000"}
          percent={"8%"}
          direction={true}
        />
        <SmallCard xs={12} sm={6} lg={3}
          icon={<EmojiPeopleIcon/>}
          title={"Active Users"}
          content={"50"}
          percent={"-10%"}
          direction={false}
          duration={'since last week'}
        />
        <SmallCard xs={12} sm={6} lg={3}
          icon={<DataUsageIcon/>}
          title={"Downloaded App Data"}
          content={"603MB"}
          percent={"17%"}
          direction={true}
        />
      </Grid>
      <div style={{height:theme.mixins.toolbar.minHeight/2}}/>
      <Grid container spacing={2} className={classes.container}>
        <Grid item xs={5} style={{}}>
          <Paper className={classes.paper1}>
            <Graph/>
          </Paper>
        </Grid>
        <Grid item xs={5}>
          <Paper className={classes.paper1}>
            <Doughnut/>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
//{[33,22,2.5,2.3,5,1,20,2.5,4,1.5,2,2.5,5].reduce ( (a,b) => a + b , 0)}
