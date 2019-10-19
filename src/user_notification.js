import React from 'react';
import { makeStyles,useTheme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import CommentIcon from '@material-ui/icons/Comment';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AllInboxIcon from '@material-ui/icons/AllInbox';
import Firebase from './firebase';
import Listing from './list';
import CardMedia from '@material-ui/core/CardMedia';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position:'relative',
    width: '100%',
    maxHeight: "70vh",
  },
  container:{
    position:'relative',
    display:'flex',
    flexFlow:'row-reverse wrap',
    justifyContent:"space-evenly",
  },
  paper:{
    backgroundColor: theme.palette.background.paper,
    width: '90%',
    height: '90%'
  },
  message_display:{
    backgroundColor:"#D3D3D3",
    display:'flex',
    flexFlow:'row wrap',
    justifyContent:'center',
    alignItems:'center'
  },
  info: {
    display: 'flex' ,
    justifyContent: 'center' ,
    width : theme.mixins.toolbar.minHeight,
    height: theme.mixins.toolbar.minHeight,
    position: 'absolute' ,
    top: -(theme.mixins.toolbar.minHeight/2),
    right: '1.5vh',
    border: `1px solid ${theme.palette.primary.main}` ,
    borderRadius: '2px',
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 0 11px ` ,
    zIndex:theme.zIndex.appBar,
  },
  media: {
    height: 80,
    transform:'scale(0.9,0.5)'
  },
}));

export default function SelectedListItem(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [notif,setNotif] = React.useState([
    {
      message:{
        message:"dummy message1"
      },
      subject:"dummy notification1"
    },
    {
      message:{
        message:"dummy message2"
      },
      subject:"dummy notification2"
    },
    {
      message:{
        message:"dummy message3"
      },
      subject:"dummy notification3"
    },
  ]);

  React.useEffect(() => {
    if (!notif.length) {
      Firebase.database().ref  ( "notification/glitches" )
        .once ( 'value').then ( snapshot=>{
          if (snapshot.exists ()) {
            let notif_ = []
            snapshot.forEach ( function ( childSnapshot) {
              notif_.push({
                subject:childSnapshot.key,
                message:childSnapshot.val()
              });
            });
            if (notif_.length) {
              if (JSON.stringify(notif_)!==JSON.stringify(notif)) {
                setNotif (notif_)
              }
            }
          }
      } )
    }
  },[notif])

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  return (
    <div className={classes.root} style={{width:'65vw'}}>
      <Paper  className={classes.info}>
        <IconButton  className={classes.rightIcon}>
          <AllInboxIcon/>
        </IconButton>
      </Paper>
      <Grid container spacing={2} className={classes.container}>
        <Grid item xs={4}>
          <List component="nav" aria-label="main mailbox folders">
            {notif.map((item,index)=>
              <ListItem
                button
                selected={selectedIndex === index}
                onClick={event => handleListItemClick(event, index)}
              >
                <ListItemText
                  primary={
                    Listing.filter(em=>em.some(it=>it===item.subject))[0] ?
                      Listing.filter(em=>em.some(it=>it===item.subject))[0][2] :
                        item.subject
                  }/>
                  <ListItemIcon>
                    <CommentIcon color="primary"/>
                  </ListItemIcon>
              </ListItem>
            )}
          </List>
        </Grid>
        <Grid item xs={8} className={classes.message_display}>
          <Paper className={classes.paper}>
            <Typography
              style={{
                textAlign:"center",
                position:'relative',
                top:theme.mixins.toolbar.minHeight/2,
                padding:'3px'
              }}
              color="primary"
              variant="subtitle1"
            >
              {notif.length?notif[selectedIndex].message.date:''}
            </Typography>
            <div style={{height:theme.mixins.toolbar.minHeight/2,}}/>
            <Typography variant="body1" color="secondary" style={{padding:'5px',textAlign:"center",}}>
              {notif.length?notif[selectedIndex].message.message:''}
            </Typography>
            <div style={{height:theme.mixins.toolbar.minHeight}}/>
            <CardMedia
              className={classes.media}
              image={
                notif.length&&Listing.filter(em=>em.some(it=>it===notif[selectedIndex].subject))[0] ?
                  Listing.filter(em=>em.some(it=>it===notif[selectedIndex].subject))[0][3] :
                    ``
              }
            />
          </Paper>
        </Grid>
      </Grid>
      <Divider />
    </div>
  );
}
