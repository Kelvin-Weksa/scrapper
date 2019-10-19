import React from 'react';
import { makeStyles,useTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SectionDesktop from './sectionDesktop';
import Toolbar from '@material-ui/core/Toolbar';
import Footer from './footer';
import { withRouter , } from 'react-router-dom';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import Button from '@material-ui/core/Button';

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
  root: {
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    opacity: 0,
    position: 'relative',
    top: '-7vh'
  },
  grow: {
    flexGrow: 1,
  },
  button:{
    margin: 'auto',
    boxShadow: `0 0 4px`,
  },
}));

function PaperSheet(props) {
  const classes = useStyles();
  const theme = useTheme();

  let root = React.createRef()

  React.useEffect(() => {
    (async()=> {
      new Promise( async(resolve, reject)=> {
        setTimeout( ()=> {
          try {
            if (root.current) {
              root.current.style.top = '0vh';
              root.current.style.opacity = 1;
            }
            return resolve()
          } catch (e) {
            return reject ( e )
          }

        }, 10);
      }).catch ( console.log );
    })();
  },[root])

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
      <div className={classes.root} ref={root}>
        <div style={{height:theme.mixins.toolbar.minHeight}}/>
        <div style={{display:'flex',justifyContent:'center'}}>
          <Paper
            style={{
              padding: theme.spacing(1.5, 1),
              width:"90vw",
              display:'flex',
              flexFlow:'column nowrap',
              justifyContent:'center'
            }}
          >
            <Typography variant="h3" component="h3" style={{textAlign:'center'}}>
              About
            </Typography>
            <Typography variant="body1" component="p" style={{textAlign:'center'}}>
              Subscribe to follow all the major investement banking players in the Netherlands
            </Typography>
            <Button variant="contained" color="secondary" className={classes.button} onClick={()=>{props.history.push ( '/pricing' )}}>
              Subscribe
              <AccountBalanceIcon className={classes.rightIcon} />
            </Button>
          </Paper>
        </div>
      </div>
      <div className={classes.grow} />
      <Footer/>
    </div>
  );
}

export default withRouter ( PaperSheet )
