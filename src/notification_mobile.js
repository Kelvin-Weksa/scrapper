import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Firebase from './firebase';
import Listing from './list';
import CommentIcon from '@material-ui/icons/Comment';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import AllInboxIcon from '@material-ui/icons/AllInbox';
import Paper from '@material-ui/core/Paper';
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
    height: '90%',
    margin:'auto'
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
    left: '1.5vh',
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
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function SelectedListItem() {
  const classes = useStyles();
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [notif,setNotif] = React.useState([ ]);
  const [open, setOpen] = React.useState(false);

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    handleClickOpen();
  };

  return (
    <div className={classes.root}>
      <Paper  className={classes.info}>
        <IconButton  className={classes.rightIcon}>
          <AllInboxIcon/>
        </IconButton>
      </Paper>
      <List component="nav" aria-label="main mailbox folders">
        <List component="nav" aria-label="main mailbox folders">
          {notif.map((item,index)=>
            <ListItem
              button
              selected={selectedIndex === index}
              onClick={event => handleListItemClick(event, index)}
            >
              <ListItemIcon>
                <CommentIcon color="primary"/>
              </ListItemIcon>
              <ListItemText
                primary={
                  Listing.filter(em=>em.some(it=>it===item.subject))[0] ?
                    Listing.filter(em=>em.some(it=>it===item.subject))[0][2] :
                      item.subject
                }/>
            </ListItem>
          )}
        </List>
      </List>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {notif.length?
                Listing.filter(em=>em.some(it=>it===notif[selectedIndex].subject))[0] ?
                  Listing.filter(em=>em.some(it=>it===notif[selectedIndex].subject))[0][2] :
                    notif[selectedIndex].subject
                :
                ``
              }
            </Typography>
          </Toolbar>
        </AppBar>
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
      </Dialog>
    </div>
  );
}
