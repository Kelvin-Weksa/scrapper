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

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position:'relative',
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
    left: '1.5vh',
    border: `1px solid ${theme.palette.primary.main}` ,
    borderRadius: '2px',
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 0 11px ` ,
    zIndex:theme.zIndex.appBar,
  },
}));

export default function SelectedListItem(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const notifications = ["Server Info","Scrapper's Scheduler"]

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  return (

    <div className={classes.root}>
      <Paper  className={classes.info}>
        <IconButton  className={classes.rightIcon}>
          <AllInboxIcon/>
        </IconButton>
      </Paper>
      <Grid container spacing={2} className={classes.container}>
        <Grid item xs={6}>
          <List component="nav" aria-label="main mailbox folders">
            {notifications.map((item,index)=>
              <ListItem
                button
                selected={selectedIndex === index}
                onClick={event => handleListItemClick(event, index)}
              >
                <ListItemIcon>
                  <CommentIcon color="primary"/>
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            )}
          </List>
        </Grid>
        <Grid item xs={6} className={classes.message_display}>
          <Paper className={classes.paper}>
            <Typography
              style={{
                textAlign:"center",
                position:'relative',
                top:theme.mixins.toolbar.minHeight/2
              }}
            >
              {notifications[selectedIndex]}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider />
    </div>

  );
}
