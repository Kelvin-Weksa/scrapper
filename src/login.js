import React from 'react';
import { withStyles , makeStyles , } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Linkedin from 'mdi-material-ui/GooglePlusBox';
import FacebookBox from 'mdi-material-ui/FacebookBox';
import TwitterBox from 'mdi-material-ui/Twitter';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { withSnackbar , useSnackbar } from 'notistack';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

function validateEmail(email) {// eslint-disable-next-line
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function strongPass ( pwd ){
  let array = [ ];

  array[0] = /[A-Z]/.test ( pwd );
  array[1] = /[a-z]/.test ( pwd );
  array[2] = /\d/.test ( pwd );
  array[3] = /[!_.-]/.test ( pwd );
  array[4] = pwd.length > 5;
  let sum = 0;
  for ( let i=0; i<array.length; i++) {
    sum += array[i] ? 1 : 0;
  }
  let strength = '';
  if ( array[ 4 ] ){
    switch (sum) {
      case 0: strength = ["weird..." , true ]; break;
      case 2: strength = ["weak" , true ]; break;
      case 3: strength = ["ok" , false ]; break;
      case 4: strength = ["strong" , false ]; break;
      case 5: strength = ["awesome" , false ]; break;
      default: strength = ["weird..." , true ]; break;
    }
  }else {
    strength = ["too short" , true ]
  }
  return strength;
}

const useStyles = makeStyles( theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing(0),
  },
  HeaderCard: {
    width: '90%',
    margin: 'auto',
    backgroundColor: theme.palette.primary.main ,
    height :  '25vh',
    position: 'relative',
    top:'-5vh',
    boxShadow: `0 0 5px ${theme.palette.primary.main}` ,
    textAlign: 'center'
  },
  HeaderCard2: {
    width: '90%',
    margin: 'auto',
    backgroundColor: theme.palette.primary.main ,
    height :  '14vh',
    position: 'relative',
    top:'-5vh',
    boxShadow: `0 0 5px ${theme.palette.primary.main}` ,
    textAlign: 'center'
  },
  Card: {
    [theme.breakpoints.up('md')]: {
      //display: 'none',
      width: '30%',
    },
    position: 'relative',
    width: '90%',
    margin: 'auto',
    top: '-25vh' ,
    overflow: "visible" ,
    //transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    transform: `translateY(10vh)` ,
    //visibility:'hidden',
  },
  Card2: {
    visibility:'hidden',
    [theme.breakpoints.up('md')]: {
      //display: 'none',
      width: '60%',
    },
    position: 'relative',
    width: '90%',
    margin: 'auto',
    top: '-85vh' ,
    overflow: "visible" ,
    //transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  Kard:{
    background : `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url(static/bg7.jpg)` ,
    height : '100vh',
  },
}));

const ValidationTextField = withStyles({
  root: {
    '& input:valid + fieldset': {
      borderColor: 'green',
      borderWidth: 2,
    },
    '& input:invalid + fieldset': {
      borderColor: 'red',
      borderWidth: 2,
    },
    '& input:valid:focus + fieldset': {
      borderLeftWidth: 6,
      padding: '4px !important', // override inline-style
    },
  },
})(TextField);

function SimpleCard ( ) {
  const classes = useStyles ( );
  let card = React.createRef ( );
  let card2 = React.createRef ( );
  const [email_log, setEmail_log] = React.useState('');
  const [emailValid_log, setEmailValid_log] = React.useState(false);
  const [email_reg, setEmail_reg] = React.useState('');
  const [emailValid_reg, setEmailValid_reg] = React.useState(false);
  const [page, setPage] = React.useState(true);
  const [pass, setPass] = React.useState({
    value:'',
    eval: false,
    label:'Password'
  });
  const [pass2, setPass2] = React.useState('');
  const [passMatch, setPassMatch] = React.useState(false);
  const [fName, setfName] = React.useState('');
  const [fNameValid, setfNameValid] = React.useState(false);
  const [sName, setsName] = React.useState('');
  const [sNameValid, setsNameValid] = React.useState(false);
  const { enqueueSnackbar , } = useSnackbar();
  const [values, setValues] = React.useState({
    showPassword0: false,
    showPassword: false,
  });

  React.useEffect ( ( ) => {
    page ? loginCard( ) : registerCard ( );
    return () => {
    };
  });

  function disablePaste ( e ) {
    e.preventDefault ( );
    enqueueSnackbar ( "paste disabled!" , {
        variant : "warning"  ,
        autoHideDuration: 2500,
    });
  }

  const handleClickShowPassword0 = () => {
    setValues({ ...values, showPassword0: !values.showPassword0 });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  function handleFocus (){
    setTimeout( card.current.style.boxShadow = '0 0 11px' , 0 );
    setTimeout( card2.current.style.boxShadow = '0 0 11px' , 0 );
  }

  function handleBlur (){
    setTimeout( card.current.style.boxShadow = 'none' , 0 );
    setTimeout( card2.current.style.boxShadow = 'none' , 0 );
  }

  function registerCard ( ){
    card.current.style.transition = `none`;
    card.current.style.visibility = 'hidden';
    setTimeout( card.current.style.top = '-25vh' , 300 );

    card2.current.style.transition = `all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)`;
    setTimeout( card2.current.style.visibility = 'visible' , 300 );
    setTimeout( card2.current.style.top = '-57vh' , 300 );
    setPage( false );
  }

  function loginCard ( ){
    card2.current.style.transition = `none`
    card2.current.style.visibility = 'hidden';
    setTimeout( card2.current.style.top = '-85vh' , 300 );

    card.current.style.transition = `all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)`;
    setTimeout( card.current.style.visibility = 'visible' , 300 );
    setTimeout( card.current.style.top = '0vh' , 300 );
    setPage( true );
  }

  function handleEmailChange_log (event) {
    setEmail_log ( event.target.value );
    setEmailValid_log( ! validateEmail( event.target.value ) && event.target.value )
    //console.log(email_log);
  }

  function handleEmailChange_reg (event) {
    setEmail_reg ( event.target.value );
    setEmailValid_reg( ! validateEmail( event.target.value ) && event.target.value )
    //console.log(email_reg);
  }

  function handlePass ( event ){
    if ( event.target.value ){
      let asses = strongPass ( event.target.value )
      setPass ( { ...pass, value: event.target.value , label: asses[ 0 ] , eval: asses[ 1 ] } );
    }else {
      setPass ( { ...pass, value: event.target.value , label: "Password" , eval:false} );
    }
  }

  function handlePass2 ( event ){
    setPass2 ( event.target.value );
    if ( (pass.value === event.target.value) && event.target.value ){
      setPassMatch ( false )
    }else{
      setPassMatch ( true )
    }
  }

  function handlefName ( event ){
    setfName ( event.target.value )
    setfNameValid ( false );
  }

  function handlesName ( event ){
    setsName ( event.target.value )
    setsNameValid ( false );
  }

  function handleRegister (  ){
    if( !fName ){
      setfNameValid ( true );
      enqueueSnackbar ( "First Name is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( !sName ){
      setsNameValid ( true );
      enqueueSnackbar ( "Second Name is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( !email_reg ){
      setsNameValid ( true );
      enqueueSnackbar ( "Email is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( emailValid_reg ){
      enqueueSnackbar ( "Enter Valid Email" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( !pass.value ){
      setsNameValid ( true );
      enqueueSnackbar ( "Password is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( strongPass ( pass.value )[ 1 ] ){
      enqueueSnackbar (
        "Password must be alteast 5 characters long containing Upper, Lower Case, number & special" , {
          variant : "error"  ,
          autoHideDuration: 3500,
      });
      return;
    }
    if( passMatch ){
      enqueueSnackbar ( "Passwords Dont Match" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }

    enqueueSnackbar ( "Registering Details..." , {
        variant : "success"  ,
        autoHideDuration: 2500,
    });
    console.log(fName + " " + sName + " " + email_reg + " " + email_log + " " + pass2);
  }

  return (
      <div className={classes.Kard}>
          <Toolbar style={{display:'flex',justifyContent:'flex-end',color:'white'}}>
            <Button style={{color:'white'}} onClick={registerCard}>
              <FingerprintIcon/>
              Register
            </Button>
            <Button style={{color:'white'}} onClick={loginCard}>
              <VpnKeyIcon/>
              Log in
            </Button>
          </Toolbar>
          <Card ref={card} className={classes.Card}>
            <Card className={classes.HeaderCard}>
              <Typography style={{padding:'12px' , color: 'white'}}>
                Log in
              </Typography>
              <CardActions style={{ display:'flex' , justifyContent:"center" , padding:'12px' }}>
                <IconButton style={{color:'white'}}>
                  <FacebookBox/>
                </IconButton>
                <IconButton style={{color:'white'}}>
                  <TwitterBox/>
                </IconButton>
                <IconButton style={{color:'white'}}>
                  <Linkedin/>
                </IconButton>
              </CardActions>
            </Card>
            <CardContent >
              <TextField
                error={emailValid_log}
                label={emailValid_log ? "Enter Valid Email" : "Email"}
                variant="outlined"
                type="email"
                id="mui-theme-provider-outlined-input"
                fullWidth={true}
                style={{paddingTop:'12px',paddingBottom:'12px'}}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleEmailChange_log}
              />
              <TextField
                label="Password"
                variant="outlined"
                id="mui-theme-provider-outlined-input"
                fullWidth={true}
                type="password"
                style={{paddingTop:'12px'}}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </CardContent>
            <CardActions >
              <Link to='/dashboard' style={{margin:'0 auto'}}>
                <Button color='secondary' size="small">
                  Let's Go
                </Button>
              </Link>
            </CardActions>
          </Card>
          <Card ref={card2} className={classes.Card2}>
            <Card className={classes.HeaderCard2}>
              <Typography style={{padding:'2px' , color: 'white'}}>
                Register
              </Typography>
              <CardActions style={{ display:'flex' , justifyContent:"center" , padding:'2px' }}>
                <IconButton style={{color:'white'}}>
                  <FacebookBox/>
                </IconButton>
                <IconButton style={{color:'white'}}>
                  <TwitterBox/>
                </IconButton>
                <IconButton style={{color:'white'}}>
                  <Linkedin/>
                </IconButton>
              </CardActions>
              </Card>
              <div style={{height:'50vh',overflowY:'scroll'}}>
                <CardContent>
                  <Typography style={{paddingLeft:'4px'}}>
                    contact details
                  </Typography>
                  <ValidationTextField
                    className={classes.margin}
                    required
                    error={fNameValid}
                    label={fNameValid ? "First Name" : "First Name"}
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handlefName}
                  />
                  <ValidationTextField
                    className={classes.margin}
                    required
                    error={sNameValid}
                    label="Second Name"
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handlesName}
                  />
                  <ValidationTextField
                    className={classes.margin}
                    required
                    error={emailValid_reg}
                    label= {emailValid_reg ? "Invalid Email" : "Email" }
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    type="email"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleEmailChange_reg}
                  />
                  <ValidationTextField
                    onPaste={disablePaste}
                    className={classes.margin}
                    required
                    error={pass.eval}
                    label={pass.label}
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    type={values.showPassword0 ? 'text' : 'password'}
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handlePass}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword0}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {values.showPassword0 ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <ValidationTextField
                    onPaste={disablePaste}
                    className={classes.margin}
                    required
                    error={passMatch}
                    label={passMatch ? "Doesn't match!" : "Confirm Password"}
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    type={values.showPassword ? 'text' : 'password'}
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handlePass2}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {values.showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <hr/>
                  <Typography style={{paddingLeft:'4px'}}>
                    billing details
                  </Typography>
                  <ValidationTextField
                    label="credit card"
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <ValidationTextField
                    label="pass number"
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <hr/>
                </CardContent>
              </div>
              <CardActions >
                <Link  style={{margin:'0 auto'}}>
                  <Button color='secondary' size="small" onClick={handleRegister}>
                    Let's Go
                  </Button>
                </Link>
              </CardActions>
          </Card>
      </div>
  );
}

export default withSnackbar ( SimpleCard );
//we@we.we
