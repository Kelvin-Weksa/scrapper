import React from 'react';
import { makeStyles , withStyles , useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { withRouter , } from 'react-router-dom';
import Button from '@material-ui/core/Button';
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
import SectionDesktop from './sectionDesktop';
import TimePeriod from './finishChoosing';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import Footer from './footer';
import PrintIcon from '@material-ui/icons/Print';
import {useScrollPosition} from './use-scroll-position'
import clsx from 'clsx';
import Hidden from '@material-ui/core/Hidden';
import StarIcon from '@material-ui/icons/Star';
//import jsPDF from 'jspdf';
//import html2canvas from 'html2canvas';

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.default,
    },
  },
}))(TableRow);

function debounce( func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);
    if (callNow) func.apply(context, args);
  }
}

function msToTime ( duration ) {
    var minutes = parseInt ( ( duration / ( 1000 * 60 ) ) % 60 )
        , hours = parseInt ( ( duration / ( 1000 * 60 * 60 ) ) % 24 );

    hours =  ( hours < 10 ) ? "0" + hours : hours;
    minutes = ( minutes < 10 ) ? "0" + minutes : minutes;
    return hours + ":hrs " + minutes + ": mins";
}

function getSteps ( ){
  return ['Select Companies', 'Check Out'];
}

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
    padding: theme.spacing(3, 2),
    display: 'flex',
    flexFlow: 'row wrap',
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
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent:'flex-end',
    alignItems:'flex-end',
    alignContent: 'flex-end',
    position: 'relative',
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function ListCompanies ( props ){
  //const classes = useStyles();
  const { enqueueSnackbar , } = useSnackbar();
  var st = {}
  Listing.forEach ( ( list ) => {
    st[ list[ 2 ].replace ( /\s/g, '_') ] =
        (props.selected.includes( list[ 2 ].replace ( /\s/g, '_') ) || props.card_chosen.num === 9999  ) ? true : false;
  } )
  const [ state , setState ] = React.useState(st);

  React.useEffect ( ( ) => {
    if ( ( ( props.card_chosen.num - props.selected.length )  === 0 ) || props.card_chosen.num === 9999 ){
      props.continue ( true )
    }else if ( props.selected.length >= 10 && props.selected.length < props.card_chosen.num  ){
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
    if ( props.card_chosen.num - props.selected.length > 0 ){
      let more = props.card_chosen.num - props.selected.length;
      return `${props.selected.length < 10? `(${props.selected.length})  Select a minimum of 10 Companies!` : `(${more}) Companies remaining...`}`
    }else if ( props.card_chosen.num - props.selected.length === 0 ) {
      return `You have reached limit`
    }else if ( props.card_chosen.num - props.selected.length < 0 ) {
      return `In Excess , please Remove ${props.selected.length - props.card_chosen.num} Companies...`
    }
  }

  function isEven(n) {
   return n % 2 === 0;
  }

  const boxProps = {
    bgcolor: 'background.paper',
    m: 1,
    border: 1,
    //style: { width: '5rem', height: '5rem' },
  };

  let Listed = Listing.sort((a,b) => (
    a[2].toUpperCase() > b[2].toUpperCase()) ? 1 :
      ((b[2].toUpperCase() > a[2].toUpperCase()) ? -1 : 0));

  return (
    <React.Fragment>
      <Typography>
        {props.card_chosen.num === 9999 ? "ALL Companies Selected..." : helperText()  }
      </Typography>
      <Grid container spacing={3} justify="space-between">
        {Listed.map ( ( list , index )=>(
          <Grid item md={3}>
            <Box borderColor="primary.main" {...boxProps}>
              <FormControlLabel
                control={
                  <Checkbox checked={state[ list[ 2 ].replace ( /\s/g, '_') ]} onChange={handleChange ( list[ 2 ].replace ( /\s/g, '_') )} />
                }
                label={list[ 2 ]}
                labelPlacement={isEven(index) ? "end" : "start"}
              />
            </Box>
          </Grid>
        ) )}
      </Grid>
      <Typography>
        {props.card_chosen.num === 9999 ? "ALL Companies Selected..." : helperText() }
      </Typography>
    </React.Fragment>
  );
}

function CheckOut ( props ){
  return (
    <div>
      <Box fontWeight="fontWeightBold" style={{paddingLeft:'4px'}}>
        {`You have chosen to follow the ${props.card_chosen.num === 9999 ? 'ALL the' : 'The following'} Companies`}:
        {props.card_chosen.num !== 9999 ?
          (<Grid container spacing={1}>
            {props.selected.map ( (item) =>
              <Grid item sm={3} wrap="nowrap">
                <Typography color='secondary'>
                  <StarIcon color='primary' fontSize="small"/>
                  {item.replace ( /_/g, ' ')}
                </Typography>
              </Grid>)}
          </Grid>) :
          (null)
        }
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

const Recipt  = React.forwardRef( ( props , ref )=>{
  const theme = useTheme ();

  const salutation = (
    <div>
      <Typography variant='h6'>
        {Firebase.auth().currentUser.displayName}
      </Typography>
      <Typography variant='h6'>
        {Firebase.auth().currentUser.email}
      </Typography>
      <Button
        variant="contained"
        size="small"
        style={{backgroundColor:theme.palette.secondary.light}}
        onClick={()=>props.print()}
      >
        <PrintIcon /> print
      </Button>
    </div>
  )

  const duration = (
    <div>
      <Table>
        <TableBody>
          <StyledTableRow>
            <StyledTableCell align="center">from</StyledTableCell>
            <StyledTableCell align="center">
              <Typography variant='subtitle2' color="primary">
                {props.start ? `${props.start.toString().split(' ').slice ( 0 , 5 ).join(' ')}` : ``}
              </Typography>
            </StyledTableCell>
          </StyledTableRow>
          <StyledTableRow>
            <StyledTableCell align="center">to</StyledTableCell>
            <StyledTableCell align="center">
              <Typography variant='subtitle2' color="primary">
                {props.expiry ? `${props.expiry.toString().split(' ').slice ( 0 , 5 ).join(' ')}` : ``}
              </Typography>
            </StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center'}} ref={ref}>
      <div style={{height:theme.mixins.toolbar.minHeight*2}}/>
      <Paper style={{paddingLeft:'5%',paddingRight:'5%',paddingTop:'5%',position:'relative'}}>
        <div style={{display:'flex',flexFlow:'column wrap'}}>
          <Typography variant='h4' style={{alignSelf:'center'}}>
            INVOICE
          </Typography>
          <Hidden xsDown>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              {salutation}
              {duration}
            </div>
          </Hidden>
          <Hidden smUp>
            <div style={{display:'flex', flexFlow:'column nowrap', justifyContent:'space-between'}}>
              {salutation}
              {duration}
            </div>
          </Hidden>
        </div>
        <Table >
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">
                <Typography>
                  {`You are following ${props.card_chosen.num === 9999 ? 'ALL the' : 'these'} Companies`}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="right">Damages</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow>
              <StyledTableCell component="th" scope="row" >
                {props.card_chosen.num !== 9999 ?
                  (<Grid container spacing={1}>
                    {props.selected.map ( (item) =>
                      <Grid item sm={4} >
                        <Typography color='secondary' >
                          <StarIcon color='primary' fontSize="small"/>
                          {item.replace ( /_/g, ' ')}
                        </Typography>
                      </Grid>)}
                    </Grid>) :
                  (null)
                }
              </StyledTableCell>
              <StyledTableCell align="center" style={{backgroundColor: theme.palette.background.default,}}>
                <div style={{display:"inline-block"}}>
                  <Typography variant="h4" component="h2" style={{float:'left',padding:0}}>
                    <AttachMoneyIcon/>{props.card_chosen.value}
                  </Typography>
                  <Typography variant="overline" style={{float:'left'}}>
                    Month
                  </Typography>
                </div>
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
        <div style={{display:'flex',justifyContent:'space-evenly'}}>
          <div style={{display:'flex',flexFlow:'column wrap',alignItems:'center'}}>
            {(props.expiry - new Date()) > 0 ?
              (
                <Typography variant='subtitle1' color="primary">
                  {props.expiry ? Math.round((props.expiry - new Date())/(24 * 60 * 60 * 1000)) >= 1 ?
                    `${Math.round((props.expiry - new Date())/(24 * 60 * 60 * 1000))} days remaining`
                    :
                    `${msToTime((props.expiry - new Date())%(24 * 60 * 60 * 1000))} remaining` : ``}
                </Typography>
              )
              :
              (
                <Typography variant='subtitle2' color="secondary">
                  EXPIRED
                </Typography>
              )
            }
          </div>
        </div>
      </Paper>
    </div>
  )
})

function getStepContent ( step , fn , selected , card_chosen ){
  switch (step) {
    case 0:
      return <ListCompanies continue={fn} selected={selected} card_chosen={card_chosen}/>;
    case 1:
      return <CheckOut continue={fn} selected={selected} card_chosen={card_chosen}/>;
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
      alert("checking out on " + new Date ( ).toString().split(' ').slice ( 0 , 5 ).join(' ')
      + ` You have Subscribed for ${props.card_chosen.period} days`)
      let following = props.selected.map ( item => item.replace ( /_/g, ' ') );
      props.card_chosen.following = following;
      Firebase.database().ref ( "Plans/" + Firebase.auth().currentUser.uid.toString ( ) )
        .set ( [ ...props.plan.filter ( item=>item.num!==0 ) , props.card_chosen ] ,  ( error )=> {
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
        .set ( following ,  ( error )=> {
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
              <Typography>{getStepContent( index , setNext , props.selected , props.card_chosen)}</Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  {activeStep !== steps.length - 1 ?
                    (<Button
                      variant="contained"
                      color="primary"
                      onClick={()=>{handleNext(activeStep === steps.length - 1)}}
                      className={classes.button}
                      disabled={!nexty}
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>) :
                    (<TimePeriod
                      className={classes.button}
                      disabled={!nexty}
                      selector={(selected)=>{
                          if (selected) {
                            props.card_chosen.period = selected;
                            props.card_chosen.endDate = new Date().getTime() + selected * 1000 * 60 * 60 * 24;
                            props.card_chosen.startDate = new Date().getTime();
                            handleNext(activeStep === steps.length - 1)
                          }
                        }
                      }
                    />)
                  }
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
  let selected = React.useRef ( [ ] );
  let recipt = React.useRef ({
    index:null,
    expired:false,
  });
  const selected_plan = ()=>{
    let array = !recipt.current.expired ? plan : expiredplan;
    return array[recipt.current.index]
  };
  let recipt_pdf = React.createRef();
  let root  = React.createRef();
  let row1 = React.createRef();
  let row2 = React.createRef();
  let row3 = React.createRef();
  let guide = React.createRef();
  let key = React.createRef(0);
  const [open, setOpen] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [plan, setPlan] = React.useState([{
    num:0,
    period:0,
    endDate:0,
    value:0,
    startDate:0,
  },]);
  const [expiredplan, setExpiredPlan] = React.useState([]);
  const [card_chosen, set_card_chosen] = React.useState ({
    num: 0,
    period:0,
    endDate:0,
    value:0,
    startDate:0,
    following:[],
  });
  const [row, setRow] = React.useState ([false,true,true])

  const { enqueueSnackbar , closeSnackbar } = useSnackbar();

  function handleClickOpen() {
    setDisabled ( true )
    setOpen(true);
  }

  function handleClose() {
    setDisabled ( true )
    setOpen(false);
  }

  React.useEffect ( ()=>{
    key.current = enqueueSnackbar (
      "loading..." , {
        variant : "warning"  ,
        persist: true,
      }
    );
    (async ()=> {
      let user = Firebase.auth().currentUser;
      if (disabled && user){
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
              //console.log ( "User__permissions_++_" + snapshot.exists() + '__' + incoming.length );
          } )
          ,
          Firebase.database().ref  ( "Plans/" + user.uid.toString ( )  )
            .once ( 'value').then ( snapshot=>{
              if (snapshot.exists ()) {
                let incoming = [];
                snapshot.forEach ( function ( childSnapshot) {
                  incoming.push(childSnapshot.val());
                });
                //console.log(JSON.stringify(incoming));
                let incoming_ = incoming.filter(item=>parseInt(new Date() - item.endDate) < 0 && item.endDate !== 0);
                if (incoming_.length!==incoming.length) {
                  Firebase.database().ref ( "Plans/" + Firebase.auth().currentUser.uid.toString ( ) )
                    .set ( incoming_ ,  ( error )=> {
                      if ( error ) {
                        console.log ( error )
                        alert ( 'failed to update plan to FireBase!' );
                      } else {
                        console.log ( 'FireBase updated__' + Firebase.auth().currentUser.displayName )
                        enqueueSnackbar (
                          "atleast one plan has expired!" , {
                            variant : "warning"  ,
                            autoHideDuration: 3500,
                          }
                        );
                        let expired = incoming.filter(item=>!(parseInt(new Date() - item.endDate) < 0 && item.endDate !== 0));
                        Firebase.database().ref ( "expiredPlans/" + Firebase.auth().currentUser.uid.toString ( ) )
                          .once ( "value" ).then ( (snapshot) => {
                            let mem = [];
                            if (snapshot.exists()) {
                              snapshot.forEach ( function ( childSnapshot) {
                                expired.push(childSnapshot.val());
                              });
                            }
                            Firebase.database().ref ( "expiredPlans/" + Firebase.auth().currentUser.uid.toString ( ) )
                              .set ( [...mem, ...expired], (error) => {
                                if (!error) {
                                  setExpiredPlan ( [ ...mem , ...expired ] );
                                }else {
                                  console.log ( error )
                                  alert ( 'failed to update expired plan to FireBase!' );
                                }
                              } )
                          } )
                      }
                  } );
                }
                if ( JSON.stringify(incoming_) !== JSON.stringify(plan) ){
                  //console.log ( "User__plans_++_" + snapshot.exists() + '_-_' + JSON.stringify ( incoming ) );
                  setPlan ( incoming_ );
                }
              }
          } )
          ,
          Firebase.database().ref ( "expiredPlans/" + user.uid.toString ( ) )
            .once ( "value" ).then ( (snapshot) => {
              if (snapshot.exists()) {
                let expired = [];
                snapshot.forEach ( function ( childSnapshot) {
                  expired.push(childSnapshot.val());
                });
                if (!expiredplan.length) {
                  setExpiredPlan (expired);
                }
              }
            } )
        ] )
          .catch ( console.log )
        document.body.style.cursor = "default";
        setDisabled ( false )
      }
      closeSnackbar ( key.current );
    })();
    return ()=>{
    }
  })

  React.useLayoutEffect (() => {
    new Promise ( async (resolve, reject)=> {
      setTimeout ( function () {
          try {
            if (root.current) {
              root.current.style.top = '0vh';
              root.current.style.opacity = 1;
            }
            return resolve ( )
          } catch (e) {
            return reject ( e )
          }
      }, 10);
    }).catch(console.log)
  },[root])

  function  printDocument() {
    /*if (recipt_pdf.current) {
      alert('printing')
      const input = recipt_pdf.current;
      html2canvas(input)
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF();
          pdf.addImage(imgData, 'JPEG', 0, 0);
          // pdf.output('dataurlnewwindow');
          pdf.save("receipt.pdf");
        });
    }else{
      alert ( 'nothing to print' )
    }*/
  }

  function choose ( num, plan, key=null, ){
    recipt.current.index = key;
    recipt.current.expired = new Date(plan.endDate) - new Date() < 0;
    set_card_chosen ( { ...card_chosen,num:num,value:plan.value })
    handleClickOpen ( );
  }

  function PriceList (props){
    switch (props.plan.num) {
      case 10:
        return  <
          SimpleCard
            onClick={debounce(()=>choose(10,props.plan,props.index),300)}
            icon={<PersonIcon/>}
            type={'10 Companies'}
            value={props.plan.value}
            user={'Max 1 User'}
            shade={'#448aff'}
            title={props.plan.startDate && props.plan.num === 10? props.title : ''}
            expiry={props.plan.startDate && props.plan.num === 10? new Date ( props.plan.endDate ) : ''}
            disabled={disabled}
            border={props.border}
            expired={new Date(props.plan.endDate) - new Date() < 0}
          />;
      case 50:
        return <
          SimpleCard
            onClick={debounce(()=>choose(50,props.plan,props.index),300)}
            icon={<PeopleIcon/>}
            type={'50 Companies'}
            value={props.plan.value}
            user={'Max 5 Users'}
            shade={'#6a1b9a'}
            title={props.plan.startDate && props.plan.num === 50? props.title : ''}
            expiry={props.plan.startDate && props.plan.num === 50? new Date ( props.plan.endDate ) : ''}
            disabled={disabled}
            border={props.border}
            expired={new Date(props.plan.endDate) - new Date() < 0}
          />
      case 80:
        return <
          SimpleCard
            onClick={debounce(()=>choose(80,props.plan,props.index),300)}
            icon={<EmojiPeopleIcon/>}
            type={'80 Companies'}
            value={props.plan.value}
            user={'Max 15 Users'}
            shade={'#e040fb'}
            title={props.plan.startDate && props.plan.num === 80? props.title : ''}
            expiry={props.plan.startDate && props.plan.num === 80? new Date ( props.plan.endDate ) : ''}
            disabled={disabled}
            border={props.border}
            expired={new Date(props.plan.endDate) - new Date() < 0}
          />
      case 9999:
        return <
          SimpleCard
            onClick={debounce(()=>choose(9999,props.plan,props.index),300)}
            icon={<BusinessCenterIcon color='white'/>}
            type={'Enterprise Package'}
            value={props.plan.value}
            user={'Max 1 Company'}
            shade={'#00c853'}
            title={props.plan.startDate && props.plan.num === 9999? props.title : ''}
            expiry={props.plan.startDate && props.plan.num === 9999? new Date ( props.plan.endDate ) : ''}
            disabled={disabled}
            border={props.border}
            expired={new Date(props.plan.endDate) - new Date() < 0}
          />
      default:
        return null;
    }
  }

  useScrollPosition(
    ({ prevPos, currPos }) => {
      try {
        if (row1.current&&row2.current&&row3.current&&guide.current) {
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
          let rows = [ row1 , row2 , row3 ]
          let row_positions = rows.map ( item=>absolute(item) );
          //loop through the array and look for the lowest number
          var index = 0;
          var value = row_positions[0];
          for (var i = 1; i < row_positions.length; i++) {
            if (row_positions[i] < value) {
              value = row_positions[i];
              index = i;
            }
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
    <div
      className={classes.paper}
      style={{
        display:'flex',
        flexFlow:'column wrap',
        minHeight:'100vh'
      }}>
      <Toolbar>
        <div className={classes.grow} />
        <SectionDesktop/>
      </Toolbar>
      <Grid container className={classes.root}>
        <Grid item xs={1} style={{flex:'0 1 5%',alignSelf:'flex-start',}}>
          <div style={{display:'flex',justifyContent:"center"}}>
            <div style={{position:'fixed',top:'30vh',left:'1vw'}} ref={guide}>
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
            </div>
          </div>
        </Grid>
        <Grid  item style={{flex:'1 0 95%'}} className={classes.transitionGroup} ref={root}>
          <div ref={row1}>
            <Typography variant="h2" component="p" color="textSecondary" style={{textAlign:'right'}}>
              Your Current Plan
            </Typography>
            <div style={{height:theme.mixins.toolbar.minHeight*2/3}}/>
            <Grid container spacing={5} className={classes.prices}>
              {React.useMemo(() =>
                plan.map ( (plan , index) =>
                  <PriceList
                    index={index}
                    border={true}
                    plan={plan}
                    disabled={disabled}
                    title={"Your current Plan"}
                  />
                ),[plan,disabled])
              }
            </Grid>
          </div>
          <div ref={row2}>
            <Typography variant="h2" component="p" color="textSecondary" style={{textAlign:'right'}}>
              Choose a plan that is best for you
            </Typography>
            <div style={{height:theme.mixins.toolbar.minHeight*2/3}}/>
            <Grid container spacing={5} className={classes.prices}>
              {React.useMemo(()=><PriceList plan={{num:10,value:5,disabled:disabled}}  />,[disabled])}
              {React.useMemo(()=><PriceList plan={{num:50,value:50,disabled:disabled}}  />,[disabled])}
              {React.useMemo(()=><PriceList plan={{num:80,value:150,disabled:disabled}}  />,[disabled])}
              {React.useMemo(()=><PriceList plan={{num:9999,value:500,disabled:disabled}} />,[disabled])}
            </Grid>
          </div>
          <div ref={row3}>
            <Typography variant="h2" component="p" color="textSecondary" style={{textAlign:'right'}}>
              Expired plans
            </Typography>
            <div style={{height:theme.mixins.toolbar.minHeight*2/3}}/>
            <Grid container spacing={5} className={classes.prices}>
            {React.useMemo(()=>
              expiredplan.map ( (plan , index) =>
                <PriceList
                  index={index}
                  border={true}
                  plan={plan}
                  disabled={disabled}
                  title={"expired plan"}
                />
              ) , [expiredplan,disabled])
            }
            </Grid>
          </div>
        </Grid>
      </Grid>
      <Footer/>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}
        style={{display:'flex',flexFlow:'column nowrap',width:'99%'}}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Toolbar/>
        {(recipt.current.index!==null) ?
          (
            <Recipt
              selected={selected_plan().following}
              expiry={new Date ( selected_plan().endDate )}
              start={new Date ( selected_plan().endDate - ( selected_plan().period * 24 * 60 * 60 * 1000 ) )}
              plan={selected_plan().num}
              card_chosen={card_chosen}
              ref={recipt_pdf}
              print={printDocument}
            />
          )
            :
          (
           <VerticalLinearStepper
            {...props}
            selected={selected.current}
            card_chosen={card_chosen}
            plan={plan}
          />
          )
        }
        <div style={{flex:`1 0 auto`}}/>
        <Footer/>
      </Dialog>
    </div>
  );
}

export default withRouter ( withSnackbar ( PaperSheet ) )//to the end
