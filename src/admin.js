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
import UsersTable from './usersTable';
import Firebase from './firebase';
import Notifications from './notification';
import Footer from './footer';
import clsx from 'clsx';
import {useScrollPosition} from './use-scroll-position'

function myNet () {
  if (this.getMonth() === 0){return "January"};
  if (this.getMonth() === 1){return "February"};
  if (this.getMonth() === 2){return "March"};
  if (this.getMonth() === 3){return "April"};
  if (this.getMonth() === 4){return "May"};
  if (this.getMonth() === 5){return "June"};
  if (this.getMonth() === 6){return "July"};
  if (this.getMonth() === 7){return "August"};
  if (this.getMonth() === 8){return "September"};
  if (this.getMonth() === 9){return "October"};
  if (this.getMonth() === 10){return "November"};
  if (this.getMonth() === 11){return "December"};
};

function msToTime ( duration ) {
    var minutes = parseInt ( ( duration / ( 1000 * 60 ) ) % 60 )
        , hours = parseInt ( ( duration / ( 1000 * 60 * 60 ) ) % 24 );

    hours =  ( hours < 10 ) ? "0" + hours : hours;
    minutes = ( minutes < 10 ) ? "0" + minutes : minutes;
    return hours + ":hrs " + minutes + ": mins";
}

function isBetween ( past , future ) {
  if (future.getTime()>past.getTime()) {
    return past.getTime() <= this.getTime() && future.getTime() > this.getTime()
  }else {
    return future.getTime() <= this.getTime() && past.getTime() > this.getTime()
  }
}
// eslint-disable-next-line
Date.prototype.isBetween = isBetween;
// eslint-disable-next-line
Date.prototype.myNet = myNet;

const useStyles = makeStyles(theme => ({
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em',
    },
    '*::-webkit-scrollbar-track': {
      boxShadow: `inset 0 0 3px ${theme.palette.secondary.light}` ,
      borderRadius: '10px'
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: `${theme.palette.primary.dark}`,
      borderRadius: '10px',
      "&:hover": {
        //transform: `scale(1.1)` ,
        backgroundColor: `${theme.palette.primary.light}`,
      }
    }
  },
  root:{
    padding: theme.spacing(3, 2),
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    opacity: 0,
    position: 'relative',
    top: '-7vh'
  },
  transitionGroup:{
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    opacity: 0,
    position: 'relative',
    top: '-7vh',
  },
  paper1: {
    padding: theme.spacing(1.5, 1),
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    "&:hover": {
      transform: `scale(1.1)` ,
      boxShadow: `0 0 11px ${theme.palette.secondary.dark}` ,
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
    position:'relative',
},
  container:{
    position:'relative',
    top:theme.mixins.toolbar.minHeight/2,
    display:'flex',
    flexFlow:'row wrap',
    justifyContent:"space-evenly",
  },
  vl: {
    borderLeft: `6px solid ${theme.palette.primary.main}`,
    height: `4vh`,
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
  },
  vll: {
    borderLeft: `6px solid ${theme.palette.secondary.main}`,
    height: `10vh`,
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
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

function AllPlans ( ){
  const [plans , setPlans] = React.useState([])
  const [expiredPlans , setExpiredPlans] = React.useState([])
  const [allUsers_plans,setAllUsers_plans]=React.useState({})

  React.useEffect( () => {
    (async()=> {
      if (!plans.length||!expiredPlans.length||!allUsers_plans.length) {
        await Promise.all([
          Firebase.database().ref  ( "Plans" )
            .once ( 'value').then ( snapshot=>{
              if (snapshot.exists ()) {
                let plans_ = []
                let allUsers_plans_ = {}
                snapshot.forEach ( function ( childSnapshot) {
                  allUsers_plans_[childSnapshot.key]=childSnapshot.val();
                  plans_ = plans_.concat ( ...childSnapshot.val() );
                });
                if (plans_.length) {
                  if (JSON.stringify(plans_)!==JSON.stringify(plans)) {
                    setPlans (plans_)
                  }
                }
                if (JSON.stringify(allUsers_plans_)!==JSON.stringify(allUsers_plans)) {
                  setAllUsers_plans (allUsers_plans_)
                }
              }
          } ),

          Firebase.database().ref  ( "expiredPlans" )
            .once ( 'value').then ( snapshot=>{
              if (snapshot.exists ()) {
                let expiredPlans_ = []
                snapshot.forEach ( function ( childSnapshot) {
                  expiredPlans_= expiredPlans_.concat ( ...childSnapshot.val() );
                });
                if (expiredPlans_.length) {
                  if (JSON.stringify(expiredPlans_)!==JSON.stringify(expiredPlans)) {
                    setExpiredPlans (expiredPlans_)
                  }
                }
              }
          } ),
        ])
      }
    })();
  },[plans,expiredPlans,allUsers_plans] )

  return {
    allPlans:[ ...plans, ...expiredPlans ],
    allUsers_plans: allUsers_plans,
  };

}

function Metering (){
  const [meter,setMeter] = React.useState([])
  React.useEffect(() => {
    if (!meter.length) {
      Firebase.database().ref  ( "metering" )
        .once ( 'value').then ( snapshot=>{
          if (snapshot.exists()) {
            let meter_ = [];
            snapshot.forEach ( function ( childSnapshot) {
              let obj = childSnapshot.val();
              for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                  let outgoing = {}
                  outgoing[prop]={key:childSnapshot.key,data:obj[prop]}
                  meter_.push ( outgoing );
                  //console.log(outgoing);
                }
              }
            });
            if (JSON.stringify(meter_)!==JSON.stringify(meter)) {
              setMeter (meter_)
            }
          }
        } )
    }
  },[meter])
  return meter;
}

function Devices (){
  const [devices,setDevices] = React.useState([])
    React.useEffect( () => {
      if (!devices.length) {
        Firebase.database().ref  ( "devices")
          .once ( 'value').then ( snapshot=>{
            if (snapshot.exists()) {
              let voter = {
                desktop:0,
                tablet:0,
                mobile:0
              };
              snapshot.forEach ( function ( childSnapshot) {
                let obj = childSnapshot.val();
                for (var prop in obj) {
                  if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    //console.log(obj[prop]);
                    voter = obj[prop].reduce((voter,item)=>{
                      if (item==="Desktop") {
                        voter.desktop += 1;
                      }else if (item==="Tablet") {
                        voter.tablet += 1;
                      }else if (item==="Mobile") {
                        voter.mobile += 1;
                      }
                      return voter;
                    },voter)
                  }
                }
              });
              let devices_ = [voter.tablet,voter.mobile,voter.desktop]
              //console.log(devices_);
              if (JSON.stringify(devices)!==JSON.stringify(devices_)) {
                setDevices (devices_)
              }
            }
        } )
      }
    },[devices] )
  return devices;
}

function AllUsers(){
  const [allUsers,setAllUsers] = React.useState([]);
  React.useEffect(() => {
      if (!allUsers.length) {
        fetch ('/allUsers').then(
          jsondata=>jsondata.json()
            .then((data) => {
              if (JSON.stringify(data)!==JSON.stringify(allUsers)) {
                console.log("it didnt");
                setAllUsers(data.reverse())
              }
            })
        )
      }
  },[allUsers])
  return allUsers;
}

export default function PaperSheet() {
  const classes = useStyles();
  const theme = useTheme();
  let root = React.createRef();

  const date = new Date();
  const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  const allPlans_Master = React.useCallback(AllPlans,[])();
  const allUsers_plans = allPlans_Master.allUsers_plans;
  const allPlans = allPlans_Master.allPlans;
  const meter = React.useCallback(Metering,[])();
  const devices = React.useCallback(Devices,[])();
  const allUsers = React.useCallback(AllUsers,[])();

  const lastMonthUsers = allUsers.filter(item=>new Date (item.metadata.creationTime).isBetween(lastMonth,thisMonth));
  const thisMonthUsers = allUsers.filter(item=>new Date (item.metadata.creationTime).isBetween(thisMonth,nextMonth));

  const lastMonthPlans = allPlans.filter(item=>new Date (item.startDate).isBetween(lastMonth,thisMonth));
  const thisMonthPlans = allPlans.filter(item=>new Date (item.startDate).isBetween(thisMonth,nextMonth));

  const lastMonthActiveUsers = allUsers.filter(item=>new Date (item.metadata.lastSignInTime).isBetween(lastMonth,thisMonth));
  const thisMonthActiveUsers = allUsers.filter(item=>new Date (item.metadata.lastSignInTime).isBetween(thisMonth,nextMonth));

  const total_meter = meter.map((obj) => {
    let item = 0;
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        item = obj[prop].data;
      }
    }
    return item;
  });

  let item_of_week = [0,0,0,0,0,0,0];

  meter.filter((item) => {//obtain last six days + today
    for (var prop in item) {
      let date;
      if (Object.prototype.hasOwnProperty.call(item, prop)) {
        date = new Date( prop.replace(/_/g,' ') );
        let today = new Date()
        return date.isBetween(
            new Date(date.getFullYear(),date.getMonth(),today.getDate()-6),
            new Date(today.getFullYear(),today.getMonth(),today.getDate()+1))
      }
    }
    return false;
  }).forEach((obj) => {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        let date = new Date( prop.replace(/_/g,' ') );
        item_of_week[date.getDay()] += obj[prop].data
      }
    }
  });

  React.useEffect ( () => {
    (async ()=> {
      new Promise( async(resolve, reject)=> {
        setTimeout( ()=> {
          try {
            if (root.current) {
              root.current.style.top = '0vh';
              root.current.style.opacity = 1;
            }
          } catch (e) {
            return reject ( e )
          }

        }, 10);
      }).catch(console.log)
    })();
  },[root]);

  const [row, setRow] = React.useState ([false,true,true,true])
  let row1 = React.createRef();
  let row2 = React.createRef();
  let row3 = React.createRef();
  let row4 = React.createRef();
  let guide = React.createRef();

  useScrollPosition(
    ({ prevPos, currPos }) => {
      try {
        if (row1.current&&row2.current&&row3.current&&row4.current&&guide.current) {
          //console.log( JSON.stringify ( { prevPos, currPos } ) );
          function midPoint ( box ){
            return ( box.top + ( box.height / 2 ) )
          }
          function absolute ( row ){
            return Math.abs(
              midPoint ( row.current.getBoundingClientRect() )
                - midPoint ( guide.current.getBoundingClientRect() )
            )
          }
          let rows = [ row1 , row2 , row3 , row4 ]
          let row_positions = rows.map ( item=>absolute(item) );
          //loop through the array and look for the lowest number
          var index = 0;
          var value = row_positions[0];
          for (var i = 1; i < row_positions.length; i++) {
            if (row_positions[i] < value) {
              value = row_positions[i];
              index = i;
            }
            //console.log(row_positions);
          }
          let update = row_positions.map ( item=>true );
          update[index] = false;
          setRow ( update )
        }
      } catch (e) {
        console.log(e);
      }
    },
    null,
    false,
    150
  )

  return (
    <div style={{
      display:'flex',
      flexFlow:'column wrap',
      minHeight:'100vh'
    }}>
      <Toolbar>
        <div className={classes.grow} />
        <SectionDesktop/>
      </Toolbar>
      <Grid container className={classes.root} ref={root}>
        <Grid item  style={{flex:'0 1 5%',alignSelf:'flex-start',}}>
          <div style={{display:'flex',justifyContent:"center"}}>
            <div style={{position:'fixed',top:'30vh'}} ref={guide}>
              <div className={clsx({
                [classes.vl]: row[0],
                [classes.vll]: !row[0],
              })}>
              </div>
              <div style={{height:'1vh'}}/>
              <div className={clsx({
                [classes.vl]: row[1],
                [classes.vll]: !row[1],
              })}>
              </div>
              <div style={{height:'1vh'}}/>
              <div className={clsx({
                [classes.vl]: row[2],
                [classes.vll]: !row[2],
              })}>
              </div>
              <div style={{height:'1vh'}}/>
              <div className={clsx({
                [classes.vl]: row[3],
                [classes.vll]: !row[3],
              })}>
              </div>
            </div>
          </div>
        </Grid>
        <Grid  item style={{flex:'1 0 95%'}}>
          <Grid container spacing={2} className={classes.container} ref={row1}>
            <SmallCard xs={12} sm={6} lg={3}
              icon={<PeopleIcon/>}
              title={"Registered Users"}
              content={allUsers.length}
              percent={Math.round(((thisMonthUsers.length-lastMonthUsers.length) * 100)/thisMonthUsers.length)+'%'}
              direction={thisMonthUsers.length>lastMonthUsers.length}
            />
            <SmallCard xs={12} sm={6} lg={3}
              icon={<MonetizationOnIcon/>}
              title={"Revenue"}
              content={"$"+allPlans.reduce((total,num) => total+num.value,0)}
              percent={Math.round(((thisMonthPlans.length-lastMonthPlans.length) * 100)/thisMonthPlans.length)+'%'}
              direction={thisMonthPlans.length>lastMonthPlans.length}
            />
            <SmallCard xs={12} sm={6} lg={3}
              icon={<EmojiPeopleIcon/>}
              title={"Active Users"}
              content={thisMonthActiveUsers.length}
              percent={Math.round(((thisMonthActiveUsers.length-lastMonthActiveUsers.length) * 100)/thisMonthActiveUsers.length)+'%'}
              direction={thisMonthActiveUsers.length>lastMonthActiveUsers.length}
            />
            <SmallCard xs={12} sm={6} lg={3}
              icon={<DataUsageIcon/>}
              title={"Downloaded App Data"}
              content={total_meter.reduce((total,num)=>total+num,0)+"MB"}
              percent={"17%"}
              direction={true}
            />
          </Grid>
          <div style={{height:theme.mixins.toolbar.minHeight/2}}/>
          <Grid container spacing={2} className={classes.container} ref={row2}>
            <Grid item xs={5} style={{}}>
              <Paper className={classes.paper1}>
              {/*eslint-disable-next-line*/}
                {React.useMemo(()=><Graph data={{wk_days:item_of_week}}/>,[meter])}
              </Paper>
            </Grid>
            <Grid item xs={5}>
              <Paper className={classes.paper1}>
                {React.useMemo(()=><Doughnut data={{devices:devices}}/>,[devices])}
              </Paper>
            </Grid>
          </Grid>
          <div style={{height:theme.mixins.toolbar.minHeight/2}}/>
          <Grid container spacing={2} className={classes.container} ref={row3}>
            <Grid item xs={10}>
              {React.useMemo(()=>
                <UsersTable
                  allUsers={allUsers.map((item) => {
                    if (allUsers_plans[item.uid]) {
                    let sum = [];
                    let value = 0;
                    let remains = [];
                    allUsers_plans[item.uid].forEach((it) => {
                      sum.push (it.following.length)
                      value += it.value;
                      if ((it.endDate - new Date()) >= 0) {
                        remains.push (Math.round((it.endDate - new Date())/(24 * 60 * 60 * 1000)) > 1 ?
                          `${Math.round((it.endDate - new Date())/(24 * 60 * 60 * 1000))} days`
                          :
                          `${msToTime((it.endDate - new Date())%(24 * 60 * 60 * 1000))}`)
                      }
                    })
                    item.followed = `[${sum.join(" | ")}]`;
                    item.spent = value;
                    item.subscription = `[${remains.join(" | ")}]`;
                    item.data = meter.filter((obj) => {
                      let key;
                      for (var prop in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                          key = obj[prop].key;
                        }
                      }
                      return key===item.uid;
                    }).map((obj) => {
                      let data;
                      for (var prop in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                          data = obj[prop].data;
                        }
                      }
                      return data;
                    }).reduce((total,num)=>total+num,0);
                  }
                    return item;
                })}/>
                ,[allUsers,allUsers_plans,meter])
              }
            </Grid>
          </Grid>
          <div style={{height:theme.mixins.toolbar.minHeight}}/>
          <Grid container spacing={2} className={classes.container} ref={row4}>
            <Grid item xs={10}>
              <Paper className={classes.paper1}>
              {React.useMemo(()=><Notifications/>,[])}
              </Paper>
            </Grid>
          </Grid>
          <div style={{height:theme.mixins.toolbar.minHeight}}/>
        </Grid>
      </Grid>
      <Footer/>
    </div>
  );
}

//balanc
