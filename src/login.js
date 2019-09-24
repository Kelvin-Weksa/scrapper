import React from 'react';
import { makeStyles , } from '@material-ui/core/styles';
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
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { withSnackbar , useSnackbar } from 'notistack';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import clsx from 'clsx';
import Firebase from './firebase'

function validateEmail(email) {// eslint-disable-next-line
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function strongPass ( pwd ){
  let array = [ ];

  array[0] = /[A-Z]/.test ( pwd );
  array[1] = /[a-z]/.test ( pwd );
  array[2] = /\d/.test ( pwd );
  array[3] = /[^\w\s]/.test ( pwd );
  array[4] = pwd.length > 5;
  let sum = 0;
  for ( let i=0; i<array.length; i++) {
    sum += array[i] ? 1 : 0;
  }
  let strength = '';
  if ( array[ 4 ] ){
    switch (sum) {
      case 0: strength = [ "weird..." , true ]; break;
      case 2: strength = [ "weak" , true ]; break;
      case 3: strength = [ "ok" , false ]; break;
      case 4: strength = [ "strong" , false ]; break;
      case 5: strength = [ "awesome" , false ]; break;
      default: strength = [ "weird..." , true ]; break;
    }
  }else {
    strength = ["too short" , true ]
  }
  return strength;
}

function validateName(name) {// eslint-disable-next-line
  var re = /[^\w\s]/g;
  return re.test(name);
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
  input: {
    '& label.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderLeftWidth: 6,
        padding: '4px !important', // override inline-style
      },
    },
  },
  inputValid: {
    '& label.Mui-focused': {
      color: 'green',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
          borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: 'green',
        borderLeftWidth: 6,
        padding: '4px !important', // override inline-style
      },
    },
  },
  inputError: {
    '& label.Mui-focused': {
      color: 'red',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: 'red',
        borderLeftWidth: 6,
        padding: '4px !important', // override inline-style
      },
    },
  },
}));

function SimpleCard ( props ) {
  const classes = useStyles ( );
  let card = React.createRef ( );
  let card2 = React.createRef ( );
  const [page, setPage] = React.useState(true);
  const [email_log, setEmail_log] = React.useState({
    val:'',
    error:false,
    valid:false
  });
  const [email_reg, setEmail_reg] = React.useState({
    val:'',
    error:false,
    valid:false
  });
  const [pass3, setPass3] = React.useState({
    val:'',
    label:'Password',
    error:false,
    valid:false
  });
  const [pass, setPass] = React.useState({
    val:'',
    label:'Password',
    error:false,
    valid:false
  });
  const [pass2, setPass2] = React.useState({
    val:'',
    error:false,
    valid:false
  });
  const [fName, setfName] = React.useState({
    val:'',
    error:false,
    valid:false
  });
  const [sName, setsName] = React.useState({
    val:'',
    error:false,
    valid:false
  });
  const { enqueueSnackbar , } = useSnackbar();
  const [visiblePass, setValues] = React.useState({
    showPassword0: false,
    showPassword: false,
    showPassword3: false,
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
    setValues({ ...visiblePass, showPassword0: !visiblePass.showPassword0 });
  };

  const handleClickShowPassword = () => {
    setValues({ ...visiblePass, showPassword: !visiblePass.showPassword });
  };

  const handleClickShowPassword3 = () => {
    setValues({ ...visiblePass, showPassword3: !visiblePass.showPassword3 });
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
    if ( event.target.value ){
      let error = ! validateEmail( event.target.value );
      setEmail_log ( {...email_log , val:event.target.value , error:error , valid:!error} );
    }else {
      setEmail_log ( {...email_log , val:event.target.value , error:false , valid:false} );
    }

  }

  function handleEmailChange_reg (event) {
    let error = !validateEmail( event.target.value );
    if (!event.target.value){
      setEmail_reg( {...fName , error:false , valid:false , val: event.target.value} );
    }else {
      setEmail_reg ( {...fName , error:error , valid:true , val: event.target.value} );
    }
  }

  function handlePass ( event ){
    if ( event.target.value ){
      let asses = strongPass ( event.target.value )
      setPass ( { ...pass, val: event.target.value , label: asses[ 0 ] , error: asses[ 1 ] , valid:!asses[ 1 ] } );
      setPass2 ( {...pass2 , error:true} );
    }else {
      setPass ( { ...pass, val: event.target.value , label: "Password" , error:false , valid:false} );
      setPass2 ( {...pass2 , error:false} );
    }
  }

  function handlePass2 ( event ){
    setPass2 ( {...pass2 , val:event.target.value} );
    if ( (pass.val === event.target.value) && event.target.value ){
      setPass2 ( {...pass2 , error:false , valid:true , val:event.target.value} );
    }else{
      setPass2 ( {...pass2 , error:true} );
    }
  }

  function handlePass3 ( event ){
    if ( event.target.value ){
      let asses = strongPass ( event.target.value )
      setPass3 ( { ...pass, val: event.target.value , label: asses[ 0 ] , error: asses[ 1 ] , valid:!asses[ 1 ] } );
    }else {
      setPass3 ( { ...pass, val: event.target.value , label: "Password" , error:false , valid:false} );
    }
  }

  function handlefName ( event ){
    let error = validateName( event.target.value );
    if (!event.target.value){
      setfName( {...fName , error:false , valid:false , val: event.target.value} );
    }else {
      setfName ( {...fName , error:error , valid:true , val: event.target.value} );
    }
  }

  function handlesName ( event ){
    let error = validateName( event.target.value );
    if (!event.target.value){
      setsName( {...sName , error:false , valid:false , val: event.target.value} );
    }else {
      setsName ( {...sName , error:error , valid:true , val: event.target.value} );
    }
  }

  function handleRegister (  ){
    if( fName.error || sName.error ){
      enqueueSnackbar ( "control characters not allowed" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( !fName.val ){
    setfName ( {...fName , error:true} );
      enqueueSnackbar ( "First Name is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( !sName.val ){
      setsName ( {...sName , error:true} );
      enqueueSnackbar ( "Second Name is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( !email_reg.val ){
      setEmail_reg ( {...email_reg , error:true} )
      enqueueSnackbar ( "Email is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( email_reg.error ){
      enqueueSnackbar ( "Enter Valid Email" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( !pass.val ){
      setPass ( {...pass , error:true } );
      enqueueSnackbar ( "Password is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( strongPass ( pass.val )[ 1 ] ){
      enqueueSnackbar (
        "Password must be alteast 5 characters long containing Upper, Lower Case, number & special" , {
          variant : "error"  ,
          autoHideDuration: 3500,
      });
      return;
    }
    if( pass2.error ){
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
    console.log(fName.val + " " + sName.val + " " + email_reg.val + " " + pass2.val);
    (async () => {
      const rawResponse = await fetch ( '/register' , {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({fname:fName.val,sname:sName.val,email:email_reg.val,pass:pass2.val })
      }).catch ( console.log );
      const content = await rawResponse.json ( );
      if( content.code && !content.uid){
        enqueueSnackbar (
          content.message , {
            variant : "error"  ,
            autoHideDuration: 3500,
        });
      }else if ( content.uid ){
        enqueueSnackbar (
          "You have been registered!" , {
            variant : "success"  ,
            autoHideDuration: 3500,
        });

        (async ()=> {
          await Firebase.auth()
            .signInWithEmailAndPassword ( email_reg.val , pass2.val )
              .then( (signIn)=> {
                enqueueSnackbar (
                  "Log In Successful!" , {
                    variant : "success"  ,
                    autoHideDuration: 3500,
                  }
                );
                if ( Firebase.auth().currentUser ){
                  //sessionStorage.setItem('User', JSON.stringify ( Firebase.auth().currentUser ) );
                  props.history.push("/dashboard")
                }
              }).catch ( error=>{
                enqueueSnackbar (
                  error.message , {
                    variant : "error"  ,
                    autoHideDuration: 3500,
                  });
                });
        })();
      }else {
        enqueueSnackbar (
          "uknown error has occured!" , {
            variant : "error"  ,
            autoHideDuration: 3500,
        });
      }
      console.log( content );
    })();
  }

  function handleLogin (  ){
    if( !email_log.val ){
      setEmail_reg ( {...email_reg , error:true} )
      enqueueSnackbar ( "Email is required" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( email_log.error ){
      enqueueSnackbar ( "Enter Valid Email" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
      return;
    }
    if( !pass3.valid ){
      enqueueSnackbar ( "Enter Valid Password" , {
          variant : "error"  ,
          autoHideDuration: 2500,
      });
    }
    (async ()=> {
      await Firebase.auth()
        .signInWithEmailAndPassword ( email_log.val , pass3.val )
          .then( (signIn)=> {
            enqueueSnackbar (
              "Log In Successful!" , {
                variant : "success"  ,
                autoHideDuration: 3500,
              }
            );
            //sessionStorage.setItem('User', JSON.stringify ( Firebase.auth().currentUser ) );
            props.history.push("/dashboard")
          }).catch ( error=>{
            enqueueSnackbar (
              error.message , {
                variant : "error"  ,
                autoHideDuration: 3500,
              });
            });
    })();
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
                required
                className={clsx({
                  [classes.inputError]: email_log.error,
                  [classes.input]: !email_log.error,
                  [classes.inputValid]: email_log.valid,
                })}
                error={email_log.error}
                label={email_log.error ? "Invalid Email" : "Your Email"}
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
                className={clsx({
                  [classes.inputError]: pass3.error,
                  [classes.input]: !pass3.error,
                  [classes.inputValid]: pass3.valid,
                })}
                required
                label="Password"
                variant="outlined"
                id="mui-theme-provider-outlined-input"
                fullWidth={true}
                type={visiblePass.showPassword3 ? 'text' : 'password'}
                style={{paddingTop:'12px'}}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handlePass3}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword3}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {visiblePass.showPassword3 ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
            <CardActions >
              <Button color='secondary' size="small" onClick={handleLogin} style={{margin:'0 auto'}}>
                  Let's Go
                </Button>
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
                  <TextField
                    className={clsx({
                      [classes.inputError]: fName.error,
                      [classes.input]: !fName.error,
                      [classes.inputValid]: fName.valid,
                    })}
                    required
                    error={fName.error}
                    label={fName.error ? "First Name" : "First Name"}
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handlefName}
                  />
                  <TextField
                    className={clsx({
                      [classes.inputError]: sName.error,
                      [classes.input]: !sName.error,
                      [classes.inputValid]: sName.valid,
                    })}
                    required
                    error={sName.error}
                    label="Second Name"
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handlesName}
                  />
                  <TextField
                    className={clsx({
                      [classes.inputError]: email_reg.error,
                      [classes.input]: !email_reg.error,
                      [classes.inputValid]: email_reg.valid,
                    })}
                    required
                    error={email_reg.error}
                    label= {email_reg.error ? "Invalid Email" : "Enter Email" }
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    type="email"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleEmailChange_reg}
                  />
                  <TextField
                    className={clsx({
                      [classes.inputError]: pass.error,
                      [classes.input]: !pass.error,
                      [classes.inputValid]: pass.valid,
                    })}
                    onPaste={disablePaste}
                    required
                    error={pass.error}
                    label={pass.label}
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    type={visiblePass.showPassword0 ? 'text' : 'password'}
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
                            {visiblePass.showPassword0 ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    onPaste={disablePaste}
                    className={clsx({
                      [classes.inputError]: pass2.error,
                      [classes.input]: !pass2.error,
                      [classes.inputValid]: pass2.valid,
                    })}
                    required
                    error={pass2.error}
                    label={pass2.error ? "Doesn't match!" : "Confirm Password"}
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    type={visiblePass.showPassword ? 'text' : 'password'}
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
                            {visiblePass.showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <hr/>
                  <Typography style={{paddingLeft:'4px'}}>
                    billing details
                  </Typography>
                  <TextField
                    label="credit card"
                    variant="outlined"
                    id="mui-theme-provider-outlined-input"
                    style={{padding:'2px'}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <TextField
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
                <Button color='secondary' size="small" onClick={handleRegister} style={{margin:'0 auto'}}>
                  Let's Go
                </Button>
              </CardActions>
          </Card>
      </div>
  );
}

export default withSnackbar ( SimpleCard );
//we@we.we
