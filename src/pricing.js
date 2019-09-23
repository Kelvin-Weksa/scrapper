import React from 'react';
import { makeStyles , } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import DashboardIcon from '@material-ui/icons/Dashboard';
import { withRouter , } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import Button from '@material-ui/core/Button';
import Badge from '@material-ui/core/Badge';
import AccountCircle from '@material-ui/icons/AccountCircle';
import SimpleCard from './pricingCard';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import CloseIcon from '@material-ui/icons/Close';
import Listing from './list';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Firebase from './firebase'
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import EmojiPeopleIcon from '@material-ui/icons/EmojiPeople';
import { withSnackbar , useSnackbar } from 'notistack';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
//import CardMedia from '@material-ui/core/CardMedia';

function debounce( func, wait, immediate) {
  // 'private' variable for instance
  // The returned function will be able to reference this due to closure.
  // Each call to the returned function will share this common timer.
  var timeout;

  // Calling debounce returns a new anonymous function
  return function() {
    // reference the context and args for the setTimeout function
    var context = this,
      args = arguments;

    // Should the function be called now? If immediate is true
    //   and not already in a timeout then the answer is: Yes
    var callNow = immediate && !timeout;

    // This is the basic debounce behaviour where you can call this
    //   function several times, but it will only execute once
    //   [before or after imposing a delay].
    //   Each time the returned function is called, the timer starts over.
    clearTimeout(timeout);

    // Set the new timeout
    timeout = setTimeout(function() {

      // Inside the timeout function, clear the timeout variable
      // which will let the next execution run when in 'immediate' mode
      timeout = null;

      // Check if the function already ran with the immediate flag
      if (!immediate) {
        // Call the original function with apply
        // apply lets you define the 'this' object as well as the arguments
        //    (both captured before setTimeout)
        func.apply(context, args);
      }
    }, wait);

    // Immediate mode and no wait timer? Execute the function..
    if (callNow) func.apply(context, args);
  }
}

var card_chosen = {
  num: 0,
};

function getSteps ( ){
  return ['Select Companies', 'Check Out'];
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    width: '90%',
  },
  paper:{
    //background : `linear-gradient( rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4) )` ,
    backgroundSize: 'cover',
  },
  grow: {
    flexGrow: 1,
  },
  appBar: {
    boxShadow: `0 0 5px ${theme.palette.secondary.light}` ,
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  prices:{
    justifyContent:'flex-end',
    alignItems:'center',
    height:'100vh'
  },
  transitionGroup:{
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    opacity: 0,
    position: 'relative',
    top: '-7vh',
  },
  loading:{
    cursor: 'wait !important'
  },
  media: {
    height: 30,
    width: 80,
    transform:'scale(0.6,0.8)'
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function ListCompanies ( props ){
  //const classes = useStyles();
  const { enqueueSnackbar , } = useSnackbar();
  var st = {}
  Listing.forEach ( ( list ) => {
    st[ list[ 2 ].replace ( /\s/g, '_') ] =
        (props.selected.includes( list[ 2 ].replace ( /\s/g, '_') ) || card_chosen.num === 9999  ) ? true : false;
  } )
  const [ state , setState ] = React.useState(st);

  React.useEffect ( ( ) => {
    if ( ( ( card_chosen.num - props.selected.length )  === 0 ) || card_chosen.num === 9999 ){
      props.continue ( true )
    }else if ( props.selected.length >= 10 ){
      props.continue ( true )
    }else{
      props.continue ( false )
    }
    return () => {
    };
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
    if (event.target.checked){
      props.selected.push ( name )
    }else {
      var index = props.selected.indexOf ( name );
      if (index > -1) {
        props.selected.splice ( index , 1 );
      }
    }
    enqueueSnackbar (
      helperText() , {
        variant : "info"  ,
        autoHideDuration: 2000,
        anchorOrigin:{
              vertical: 'top',
              horizontal: 'right',
          }
      }
    );
  };

  const helperText = ( ) => {
    if ( card_chosen.num - props.selected.length > 0 ){
      let more = card_chosen.num - props.selected.length;
      return `${props.selected.length < 10? `(${props.selected.length})  Select a minimum of 10 Companies!` : `(${more}) Companies remaining...`}`
    }else if ( card_chosen.num - props.selected.length === 0 ) {
      return `You have reached limit`
    }else if ( card_chosen.num - props.selected.length < 0 ) {
      return `In Excess , please Remove ${props.selected.length - card_chosen.num} Companies...`
    }
  }

  return (
    <React.Fragment>
      <Typography>
        {card_chosen.num === 9999 ? "ALL Companies Selected..." : helperText()  }
      </Typography>
      <Grid container spacing={3} justify="center">
        {Listing.map ( ( list , index )=>(
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox checked={state[ list[ 2 ].replace ( /\s/g, '_') ]} onChange={handleChange ( list[ 2 ].replace ( /\s/g, '_') )} />
              }
              label={list[ 2 ]}
            />
          </Grid>
        ) )}
      </Grid>
      <Typography>
        {card_chosen.num === 9999 ? "ALL Companies Selected..." : helperText() }
      </Typography>
    </React.Fragment>
  );
}

function CheckOut ( props ){
  return (
    <div>
      <Box fontWeight="fontWeightBold" style={{paddingLeft:'4px'}}>
        {`You have chosen to follow the ${card_chosen.num === 9999 ? 'ALL the' : 'The following'} Companies`}:
        <Grid container spacing={1}>
          {props.selected.map ( (item) =>
            <Grid item xs={3} wrap="nowrap">
              <Typography color='secondary'>{item.replace ( /_/g, ' ')}</Typography>
            </Grid>)}
        </Grid>
      </Box>
      <Box fontWeight="fontWeightBold" style={{paddingLeft:'4px'}}>
        billing details
      </Box>
      <TextField
        label="credit card"
        variant="outlined"
        id="mui-theme-provider-outlined-input"
        style={{padding:'2px'}}
      />
      <TextField
        label="pass number"
        variant="outlined"
        id="mui-theme-provider-outlined-input"
        style={{padding:'2px'}}
      />
    </div>
  )
}

function getStepContent ( step , fn , selected ){
  switch (step) {
    case 0:
      return <ListCompanies continue={fn} selected={selected}/>;
    case 1:
      return <CheckOut continue={fn} selected={selected}/>;
    default:
      return 'Unknown step';
  }
}

function VerticalLinearStepper ( props ){
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [nexty, setNext] = React.useState(false);
  const { enqueueSnackbar , } = useSnackbar();
  const steps = getSteps();

  function handleNext ( finish ) {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    if ( finish ){
      alert("checking out")
      Firebase.database().ref ( "Plans/" + Firebase.auth().currentUser.uid.toString ( ) )
        .set ( card_chosen ,  ( error )=> {
          if ( error ) {
            console.log ( error )
            alert ( 'failed to update plan to FireBase!' );
          } else { // eslint-disable-next-line
            console.log ( 'FireBase updated' + "__" + Firebase.auth().currentUser.displayName )
            enqueueSnackbar (
              "plan updated" , {
                variant : "success"  ,
                autoHideDuration: 3500,
              }
            );
          }
      } );
      Firebase.database().ref ( "Users/" + Firebase.auth().currentUser.uid.toString ( ) )
        .set ( props.selected.map ( item => item.replace ( /_/g, ' ') ) ,  ( error )=> {
          if ( error ) {
            console.log ( error )
            alert ( 'failed to update companies to FireBase!' );
          } else { // eslint-disable-next-line
            console.log ( 'FireBase updated' + "__" + Firebase.auth().currentUser.displayName )
            enqueueSnackbar (
              "companies updated" , {
                variant : "success"  ,
                autoHideDuration: 3500,
              }
            );
            props.history.push ( '/dashboard' );
          }
      } );
    }
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setNext( false )
  }

  function handleReset() {
    setActiveStep(0);
  }

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Typography>{getStepContent( index , setNext , props.selected)}</Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={()=>{handleNext(activeStep === steps.length - 1)}}
                    className={classes.button}
                    disabled={!nexty}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} className={classes.button}>
            Reset
          </Button>
        </Paper>
      )}
    </div>
  );
}

function PaperSheet ( props ) {
  const classes = useStyles();
  //const theme = useTheme ( );
  let button1 =  React.createRef ( );
  let button2 =  React.createRef ( );
  let button3 =  React.createRef ( );
  let button4 =  React.createRef ( );
  let selected = React.useRef ( [ ] );
  let root = React.createRef ( );
  const [open, setOpen] = React.useState(false);
  let done = false
  const { enqueueSnackbar , closeSnackbar } = useSnackbar();

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  React.useEffect ( ()=>{
    (async ()=> {
      let user = Firebase.auth().currentUser;
      if ( user ){
        let key =
        enqueueSnackbar (
          "loading..." , {
            variant : "warning"  ,
            persist: true,
          }
        );
        document.body.style.cursor = "wait";
        await Promise.all( [
          Firebase.database().ref  ( "Users/" + user.uid.toString ( )  )
            .once ( 'value').then ( snapshot=>{
              let incoming = [ ];
              snapshot.forEach ( function ( childSnapshot) {
                incoming.push ( childSnapshot.val ( ).replace ( /\s/g, '_') );
                let set = new Set ( incoming );
                selected.current = Array.from ( set );
              });
              console.log ( "User__permissions_++_" + snapshot.exists() + '__' + incoming.length );
          } ).catch ( console.log )
          ,
          Firebase.database().ref  ( "Plans/" + user.uid.toString ( )  )
            .once ( 'value').then ( snapshot=>{
              let incoming = [];
              snapshot.forEach ( function ( childSnapshot) {
                incoming.push ( childSnapshot.val ( ) );
              });
              if ( incoming.length === 1 ){
                switch ( incoming[ 0 ] ){
                  case ( 10 ) : decorate ( 10 , button1 , '448aff' ); break;
                  case ( 50 ) : decorate ( 50 , button2 , '6a1b9a' ); break;
                  case ( 80 ) : decorate ( 80 , button3 , 'e040fb' ); break;
                  case ( 9999 ) : decorate ( 9999 , button4 , '00c853' ); break;
                  default:
                }
              }
              console.log ( "User__plans_++_" + snapshot.exists() + '_-_' + incoming[0] );
          } ).catch ( console.log )
        ] )
        setTimeout( ()=> {
          root.current.style.top = '0vh';
          root.current.style.opacity = 1;
          closeSnackbar ( key.current );
          document.body.style.cursor = "default";
          // eslint-disable-next-line
          done=true;//rest of the page works from here!
        }, 10);
      }
    })();
  })

  function decorate ( num , ref , color){
    button1.current.style.border= `none`
    button2.current.style.border= `none`
    button3.current.style.border= `none`
    button4.current.style.border= `none`
    console.log(card_chosen);
    ref.current.style.border= `4px solid ${'#' + color}`
  }

  function choose ( num , ref, color ){
    if ( done ){
      card_chosen.num = num;
      decorate ( num , ref, color);
      handleClickOpen ( );
    }else {
      console.log ( 'averted' );
    }
  }

  return (
    <div className={classes.paper}>
      <Toolbar>
        <div className={classes.grow} />
        <Tooltip title="Dashboard">
          <IconButton edge="start" aria-label="close">
            <DashboardIcon onClick={()=>props.history.push( '/dashboard' )} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Account">
          <IconButton onClick={()=>props.history.push ( '/account' )}>
            <Badge badgeContent={1} color="secondary">
              <AccountCircle />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Pricing">
          <IconButton color="secondary">
            <AddShoppingCartIcon onClick={()=>props.history.push( '/pricing' )} />
          </IconButton>
        </Tooltip>
        <Tooltip title="LogOut">
            <IconButton onClick={()=>props.history.push( '/' )}>
              <ExitToAppOutlinedIcon/>
            </IconButton>
        </Tooltip>
      </Toolbar>
      <div className={classes.root}>
        <div className={classes.transitionGroup} ref={root}>
          <Typography variant="h2" component="p" color="textSecondary" style={{textAlign:'center'}}>
            Choose a plan that is best for you
          </Typography>
          <Grid container spacing={5} className={classes.prices}>
            <SimpleCard
              onClick={debounce(()=>choose(10,button1,'448aff'),300)}
              ref={button1}
              icon={<PersonIcon/>}
              type={'10 Companies'}
              value={5}
              user={'Max 1 User'}
              shade={'#448aff'}
              title={card_chosen.num === 10? 'Your current Plan' : ''}
            />
            <SimpleCard
              onClick={debounce(()=>choose(50,button2,'6a1b9a'),300)}
              ref={button2}
              icon={<PeopleIcon/>}
              type={'50 Companies'}
              value={50}
              user={'Max 5 Users'}
              shade={'#6a1b9a'}
              tooltipOpen={false}
              title={card_chosen.num === 50? 'Your current Plan' : ''}
            />
            <SimpleCard
              onClick={debounce(()=>choose(80,button3,'e040fb'),300)}
              ref={button3}
              icon={<EmojiPeopleIcon/>}
              type={'80 Companies'}
              value={150}
              user={'Max 15 Users'}
              shade={'#e040fb'}
              title={card_chosen.num === 80? 'Your current Plan' : ''}
            />
            <SimpleCard
              onClick={debounce(()=>choose(9999,button4,'00c853'),300)}
              ref={button4}
              icon={<BusinessCenterIcon color='white'/>}
              type={'Enterprise Package'}
              value={500}
              user={'Max 1 Company'}
              shade={'#00c853'}
              title={card_chosen.num === 9999? 'Your current Plan' : ''}
            />
          </Grid>
        </div>
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition} >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Toolbar/>
          <VerticalLinearStepper {...props} selected={selected.current}/>
        </Dialog>
      </div>
    </div>
  );
}

export default withRouter ( withSnackbar ( PaperSheet ) )
