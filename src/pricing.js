import React from 'react';
import { makeStyles ,useTheme } from '@material-ui/core/styles';
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

var card_chosen = {};

function getSteps ( ){
  return ['Select Companies', 'Check Out'];
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    width: '90%',
  },
  paper:{
    background : `linear-gradient( rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4) )` ,
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
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function ListCompanies ( props ){

  var st = {}
  Listing.forEach ( ( list ) => {
    st[ list[ 2 ].replace ( /\s/g, '_') ] =
        (props.selected.includes( list[ 2 ].replace ( /\s/g, '_') ) || card_chosen.num === 9999  ) ? true : false;
  } )
  const [ state , setState ] = React.useState(st);

  React.useEffect ( ( ) => {
    if ( ( ( card_chosen.num - props.selected.length )  === 0 ) || card_chosen.num === 9999 ){
      props.continue ( true )
    }else {
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
  };

  const helperText = ( ) => {
    if ( card_chosen.num - props.selected.length > 0 ){
      return `Select ${card_chosen.num - props.selected.length} More  Companies...`
    }else if ( card_chosen.num - props.selected.length === 0 ) {
      return `You are Done`
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
      Firebase.database().ref ( "Users/" + Firebase.auth().currentUser.uid.toString ( ) )
        .set ( props.selected.map ( item => item.replace ( /_/g, ' ') ) ,  ( error )=> {
          if ( error ) {
            console.log ( error )
            alert ( 'failed to update FireBase!' );
          } else { // eslint-disable-next-line
            console.log ( 'FireBase updated' + "__" + Firebase.auth().currentUser.displayName )
            enqueueSnackbar (
              "companies updated" , {
                variant : "success"  ,
                autoHideDuration: 3500,
              }
            );
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
  const theme = useTheme ( );
  let button1 =  React.createRef ( );
  let button2 =  React.createRef ( );
  let button3 =  React.createRef ( );
  let button4 =  React.createRef ( );
  let selected = React.useRef ( [ ] );

  React.useEffect ( ()=>{
    let user = Firebase.auth().currentUser;
    if ( user ){
      Firebase.database().ref  ( "Users/" + user.uid.toString ( )  )
        .once ( 'value' , snapshot=>{
          let incoming = [ ];
          snapshot.forEach ( function ( childSnapshot) {
            incoming.push ( childSnapshot.val ( ).replace ( /\s/g, '_') );
            let set = new Set ( incoming );
            selected.current = Array.from ( set );
          });
          console.log ( "User__permissions_++_" + snapshot.exists() + '__' + incoming.length )
      })
    }
  }, [selected])

  function choose ( num , ref ){
    button1.current.style.border= `none`;
    button2.current.style.border= `none`
    button3.current.style.border= `none`
    button4.current.style.border= `none`
    card_chosen['num'] = num;
    console.log(card_chosen);
    ref.current.style.border= `thin solid ${theme.palette.secondary.main}`
    handleClickOpen ( );
  }

  const [open, setOpen] = React.useState(false);

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <div className={classes.paper}>
      <AppBar className={classes.appBar}>
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
          <Tooltip title="LogOut">
            <IconButton onClick={()=>props.history.push( '/' )}>
              <ExitToAppOutlinedIcon/>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <div className={classes.root}>
        <Toolbar/>
        <Grid container spacing={3} style={{justifyContent:'space-evenly',alignItems:'center',height:'100vh'}}>
          <SimpleCard
            onClick={()=>choose(10,button1)}
            ref={button1}
            icon={<PersonIcon/>}
            type={'10 Companies'}
            value={5}
            user={'Max 1 User'}
            shade={'#448aff'}
          />
          <SimpleCard
            onClick={()=>choose(50,button2)}
            ref={button2}
            icon={<PeopleIcon/>}
            type={'50 Companies'}
            value={50}
            user={'Max 5 Users'}
            shade={'#6a1b9a'}
          />
          <SimpleCard
            onClick={()=>choose(80,button3)}
            ref={button3}
            icon={<EmojiPeopleIcon/>}
            type={'80 Companies'}
            value={150}
            user={'Max 15 Users'}
            shade={'#e040fb'}
          />
          <SimpleCard
            onClick={()=>choose(9999,button4)}
            ref={button4}
            icon={<BusinessCenterIcon color='white'/>}
            type={'Enterprise Package'}
            value={500}
            user={'Max 1 Company'}
            shade={'#00c853'}
          />
        </Grid>
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition} >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Toolbar/>
          <VerticalLinearStepper selected={selected.current}/>
        </Dialog>
      </div>
    </div>
  );
}
let App = withSnackbar ( PaperSheet )
export default withRouter ( App )
