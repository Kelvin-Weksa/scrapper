import React from 'react';
import { makeStyles , useTheme } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SimpleCard from './pricingCard';
import Grid from '@material-ui/core/Grid';
import PersonIcon from '@material-ui/icons/Person';
import PeopleIcon from '@material-ui/icons/People';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import Listing from './list';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Firebase from './firebase'
import { withSnackbar , useSnackbar } from 'notistack';

const useStyles = makeStyles(theme => ({
  root: {
    width: '90%',
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

var card_chosen = {};

function getSteps ( ){
  return ['Select Plan', 'Select Companies', 'Check Out'];
}

function PricingCards ( props ){
  const theme = useTheme ( );
  let button1 =  React.createRef ( );
  let button2 =  React.createRef ( );
  let button3 =  React.createRef ( );

  function choose ( num , ref ){
    button1.current.style.border= `none`;
    button2.current.style.border= `none`
    button3.current.style.border= `none`
    card_chosen['num'] = num;
    console.log(card_chosen);
    //next = true;
    ref.current.style.border= `thin solid ${theme.palette.secondary.main}`
    props.continue ( true );
  }

  return (
    <Grid container spacing={3} justify="center">
      <SimpleCard
        icon={<PersonIcon/>}
        type={'10 Companies'}
        value={5}
        user={'Max 1 User'}
        shade={'#448aff'}
        onClick={()=>choose(10,button1)}
        ref={button1}
      />
      <SimpleCard
        icon={<PeopleIcon/>}
        type={'50 Companies'}
        value={50}
        user={'Max 5 Users'}
        shade={'#6a1b9a'}
        onClick={()=>choose(50,button2)}
        ref={button2}
      />
      <SimpleCard
        icon={<BusinessCenterIcon/>}
        type={'Enterprise Package'}
        value={500}
        user={'Max 1 Company'}
        shade={'#00c853'}
        onClick={()=>choose(9999,button3)}
        ref={button3}
      />
    </Grid>
  );
}

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
      return <PricingCards continue={fn} selected={selected}/>;
    case 1:
      return <ListCompanies continue={fn} selected={selected}/>;
    case 2:
      return <CheckOut continue={fn} selected={selected}/>;
    default:
      return 'Unknown step';
  }
}

function VerticalLinearStepper ( ){
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [nexty, setNext] = React.useState(false);
  let selected = React.useRef([])
  const { enqueueSnackbar , } = useSnackbar();
  const steps = getSteps();

  React.useEffect ( ()=>{
    let user = JSON.parse ( sessionStorage.getItem ( 'User' ) )
    if ( user ){
      Firebase.database().ref  ( "Users/" + user.uid.toString ( )  )
        .once ( 'value' , snapshot=>{
          let incoming = [ ];
          snapshot.forEach ( function ( childSnapshot) {
            incoming.push ( childSnapshot.val ( ).replace ( /\s/g, '_') );
            let set = new Set ( incoming );
            selected.current = Array.from ( set );
          });
          console.log ( "User__permissions__" + snapshot.exists() + '__' + incoming.length )
      })
    }
  }, [selected])

  function handleNext ( finish ) {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    if ( finish ){
      alert("checking out")
      Firebase.database().ref ( "Users/" + Firebase.auth().currentUser.uid.toString ( ) )
        .set ( selected.current.map ( item => item.replace ( /_/g, ' ') ) ,  ( error )=> {
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
              <Typography>{getStepContent( index , setNext , selected.current)}</Typography>
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

export default withSnackbar ( VerticalLinearStepper );
