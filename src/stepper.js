import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
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

function PricingCards ( ){
  return (
    <Grid container spacing={3} justify="center">
      <SimpleCard
        icon={<PersonIcon/>}
        type={'10 Companies'}
        value={5}
        user={'Max 1 User'}
        shade={'#448aff'}
      />
      <SimpleCard
        icon={<PeopleIcon/>}
        type={'50 Companies'}
        value={50}
        user={'Max 5 Users'}
        shade={'#6a1b9a'}
      />
      <SimpleCard
        icon={<BusinessCenterIcon/>}
        type={'Enterprise Package'}
        value={500}
        user={'Max 1 Company'}
        shade={'#00c853'}
      />
    </Grid>
  );
}

function ListCompanies ( ){
  const [ state , setState ] = React.useState({
    ...Listing.map ( ( list , index ) => {
      var item = {};
      item[ list[ 2 ] ] = false;
      return item;
    } )
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  return (
    <Grid container spacing={3} justify="center">
      {Listing.map ( ( list , index )=>(
        <Grid item xs={3}>
          <FormControlLabel
            control={
              <Checkbox checked={state.checkedA} onChange={handleChange ( list[ 2 ] )} />
            }
            label={list[ 2 ]}
          />
        </Grid>
      ) )}
    </Grid>
  );
}

function CheckOut ( ){
  return (
    <div>
      <Typography style={{paddingLeft:'4px'}}>
        billing details
      </Typography>
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

function getSteps() {
  return ['Select Plan', 'Select Companies', 'Check Out'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return <PricingCards/>;
    case 1:
      return <ListCompanies/>;
    case 2:
      return <CheckOut/>;
    default:
      return 'Unknown step';
  }
}

export default function VerticalLinearStepper() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  function handleNext() {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }

  function handleBack() {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
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
              <Typography>{getStepContent(index)}</Typography>
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
                    onClick={handleNext}
                    className={classes.button}
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
