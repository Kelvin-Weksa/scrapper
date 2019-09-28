import React from 'react';
import { makeStyles, } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { withRouter , } from 'react-router-dom';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import Button from '@material-ui/core/Button';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Input from './textInput';
import SaveIcon from '@material-ui/icons/Save';
import Firebase from './firebase';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { withSnackbar , useSnackbar } from 'notistack';
import { blue } from '@material-ui/core/colors';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import DoneAllOutlinedIcon from '@material-ui/icons/DoneAllOutlined';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import SectionDesktop from './sectionDesktop';

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

function validateEmail(email) {// eslint-disable-next-line
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateName(name) {// eslint-disable-next-line
  var re = /[^\w\s]/g;
  return ! re.test(name);
}

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    transition : "all 1000ms cubic-bezier(0.34, 1.61, 0.7, 1)",
    opacity: 0,
    position: 'relative',
    top: '-7vh'
  },
  grow: {
    flexGrow: 1,
  },
  appBar: {
    boxShadow: `0 0 5px ${theme.palette.secondary.light}` ,
  },
  button:{
    margin: 'auto',
    //top: '-6vh',
    boxShadow: `0 0 4px`,
  },
  buttonFire:{
    margin: 'auto',
    //width: '35%',
    boxShadow: `0 0 4px`,
  },
  outer:{
    position : "relative" ,
    overflow:'visible',
    //height:'103%'
  },
  inner:{
    width: '90%',
    height: theme.mixins.toolbar.minHeight*1.3,
    position: 'relative',
    top: -(theme.mixins.toolbar.minHeight*1.3/3),
    backgroundColor: theme.palette.primary.main,
    margin: 'auto',
    boxShadow: `0 0 4px`,
    display: 'flex',
    alignItems:'center',
    justifyContent:'center'
  },
  outer_card: {
    position : "relative" ,
    overflow:  "visible" ,
    display:"flex",
    flexDirection: 'column',
    justifyContent:'center',
    //transform: `scale(1,0.9)` ,
  },
  inner_card: {
    position : "relative" ,
    borderRadius: "3px",
    margin:'auto',
    top: "-8vh",
    zIndex:`${theme.zIndex.mobileStepper + 1}` ,
    boxShadow: `0 0 11px ${theme.palette.primary.main}`,
    transform: `scale(0.9)` ,
  },
  typography:{
    color:'white',
    alignItems:'center',
    padding:'8px',
    ...theme.typography.h6,
    fontWeight:300,
    textAlign:'center',
  },
  avatar: {
    backgroundColor: blue[45],
    color: blue[600],
    display:'flex',
    justifyContent:'center',
    overflow:'visible',
  },
  billboard:{
    textAlign: 'center',
    position: 'relative',
    top: '-6vh',
    ...theme.typography.h4
  }
}));

function PaperSheet ( props ) {
  const classes = useStyles();
  //const theme = useTheme ( );
  let root = React.createRef();
  let card = React.createRef ( );
  const [values, setValues] = React.useState({
    email:Firebase.auth().currentUser.email,
    company: '',
    fName:Firebase.auth().currentUser.displayName.split( ' ' )[0],
    sName:Firebase.auth().currentUser.displayName.split( ' ' ).slice ( 1 ).join ( " ") ,
    phone:'',
    job: '',
    showPassword1: false,
    pass1:'',
    passLabel:'password',
    showPassword2: false,
    pass2:'',
    pass2Label:'confirm password',
    pass3:'',
    showPassword3:false,
    fNameValid:validateName,
    sNameValid:validateName,
    companyValid:validateName,
    jobValid:validateName,
    emailValid:validateEmail,
    phoneValid:letter => !isNaN ( letter ),
    pass1Valid:e => ! strongPass ( e )[ 1 ] ,
    pass2Valid:e => false,
  })
  const [open , setOpen] =React.useState (false)
  const { enqueueSnackbar , } = useSnackbar();
  const [saved , setSaved ]= React.useState ( {
    email:Firebase.auth().currentUser.email,
    fName:Firebase.auth().currentUser.displayName.split( ' ' )[0],
    sName:Firebase.auth().currentUser.displayName.split( ' ' ).slice ( 1 ).join ( " ") ,
    company: '',
    job:'',
    phone:'',
    in:false,
  })
  let changed = React.useRef (new Set([]))
  let toGo = React.useRef({})

  React.useEffect ( ( ) => {
    (async ()=> {
        new Promise( async(resolve, reject)=> {
          setTimeout( ()=> {
            try {
              root.current.style.top = '5vh';
              root.current.style.opacity = 1;
            } catch (e) {
              return reject ( e )
            }

          }, 10);
        }).catch ( console.log );

        if (!saved.in) {
          Firebase.database().ref  ( "userData/" + Firebase.auth().currentUser.uid.toString ( )  )
            .once ( 'value' , snapshot=>{
              setTimeout( ()=> {
                var incoming ;
                console.log ( "profile data__exists__" + snapshot.exists() )
                snapshot.forEach ( function ( childSnapshot) {
                  incoming = { ...incoming , [childSnapshot.key]: childSnapshot.val ( ) }
                });
                incoming = { ...incoming , in: true }
                setSaved ( {...saved , ...incoming} );
                setValues({ ...values , ...incoming ,})
              }, 1000);
            } ).catch ( console.log );
        }

    })();
  })

  const handleChange = name => event => {
    if ( name === 'pass1'  ){
      let asses = strongPass ( event.target.value )
      debounce ( setValues({ ...values, pass1: event.target.value , passLabel: asses[0] }) , 300 );
    }else if ( name === 'pass2' ){
      if ( values.pass1 !== event.target.value ){
        debounce ( setValues({ ...values, pass2: event.target.value , pass2Label: `doesn't match` }) , 300 );
      }else{
        debounce ( setValues({ ...values, pass2: event.target.value , pass2Label: 'match', pass2Valid: e=> e===values.pass1 }) , 300 );
      }
    }else{
      debounce ( setValues({ ...values, [name]: event.target.value }) , 300 );
    }
  }

  const handleClickShowPassword2 = () => {
    setValues({ ...values, showPassword2: !values.showPassword2 });
  };

  const handleClickShowPassword1 = () => {
    setValues({ ...values, showPassword1: !values.showPassword1 });
  };

  const handleClickShowPassword3 = () => {
    setValues({ ...values, showPassword3: !values.showPassword3 });
  };

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  function handleFocus (){
    setTimeout( card.current.style.boxShadow = '0 0 11px' , 0 );
  }

  function handleBlur (){
    setTimeout( card.current.style.boxShadow = 'none' , 0 );
  }

  function disablePaste ( e ) {
    e.preventDefault ( );
    enqueueSnackbar ( "paste disabled!" , {
        variant : "warning"  ,
        autoHideDuration: 2500,
    });
  }

  function handleUpdate ( ){
    if ( values.fName ){
      if ( validateName ( values.fName )  ){
        if ( values.fName.trim() !== saved.fName.trim() ){
          changed.current.add ( `first name: '${values.fName}'` )
          toGo.current = { ...toGo.current , fName:values.fName }
        }
      }else {
        return enqueueSnackbar ( "special characters not allowed" , {
          variant : "error"  ,
          autoHideDuration: 2500,
        });
      }
    }

    if (values.sName) {
      if ( validateName ( values.sName )  ){
        if ( values.sName !== saved.sName ){
          changed.current.add ( `last name: '${values.sName}'` )
          toGo.current = { ...toGo.current , sName:values.sName }
        }
      }else {
        return enqueueSnackbar ( "special characters not allowed" , {
          variant : "error"  ,
          autoHideDuration: 2500,
        });
      }
    }

    if (values.email) {
      if ( validateEmail ( values.email )  ){
        if ( values.email !== saved.email ){
          changed.current.add ( `email: '${values.email}'` )
          toGo.current = { ...toGo.current , email:values.email }
        }
      }else {
        return enqueueSnackbar ( "email is invalid" , {
          variant : "error"  ,
          autoHideDuration: 2500,
        });
      }
    }

    if (values.job) {
      if ( validateName ( values.job )  ){
        if ( values.job !== saved.job ){
          changed.current.add ( `job: '${values.job}'` )
          toGo.current = { ...toGo.current , job:values.job }
        }
      }else{
        return enqueueSnackbar ( "special characters not allowed" , {
          variant : "error"  ,
          autoHideDuration: 2500,
        });
      }
    }

    if (values.company) {
      if ( validateName ( values.company )  ){
        if ( values.company !== saved.company ){
          changed.current.add ( `company: '${values.company}'` )
          toGo.current = { ...toGo.current , company:values.company }
        }
      }else {
        return enqueueSnackbar ( "special characters not allowed for Company" , {
          variant : "error"  ,
          autoHideDuration: 2500,
        });
      }
    }

    if (values.phone) {
      if ( !isNaN ( values.phone )  ){
        if ( values.phone !== saved.phone ){
          changed.current.add ( `phone: '${values.phone}'` )
          toGo.current = { ...toGo.current , phone:values.phone }
        }
      }else {
        return enqueueSnackbar ( "only digits allowed for phoneNumber" , {
          variant : "error"  ,
          autoHideDuration: 2500,
        });
      }

    }

    if (values.pass1) {
      if ( !strongPass ( values.pass2 )[1]  ){
        if (values.pass2 === values.pass1) {
          changed.current.add ( `password: '${values.pass1}'` )
          toGo.current = { ...toGo.current , pass1:values.pass1 }
        }else {
          return enqueueSnackbar ( `password doesn't match` , {
            variant : "error"  ,
            autoHideDuration: 2500,
          });
        }
      }else {
        return enqueueSnackbar ( "weak password" , {
          variant : "error"  ,
          autoHideDuration: 2500,
        });
      }
    }
    //
    if ( changed.current.size ){
      setOpen ( true )
    }else{
      return enqueueSnackbar ( "nothing to update..." , {
        variant : "warning"  ,
        autoHideDuration: 2500,
      });
    }
  }

  function handleConfirm ( ){
    var user = Firebase.auth().currentUser;
    (async ()=> {
      await Firebase.auth()
        .signInWithEmailAndPassword ( user.email , values.pass3 )
          .then( (signIn)=> {
            enqueueSnackbar (
              "re-authenticated" , {
                variant : "success"  ,
                autoHideDuration: 2500,
              }
            );

            let upload = { ...saved , ...toGo.current }

            Firebase.database().ref ( 'userData/' + user.uid.toString ( ) )
              .set ( {...upload , pass1 : ''} ,  ( error )=> {
                if ( error ) {
                  console.log ( error )
                  alert ( 'failed to update userData/ FireBase!' );
                } else {
                    enqueueSnackbar (
                      'FireBase userData/ updated--' , {
                        variant : "success"  ,
                        autoHideDuration: 2500,
                      }
                    );
                }
              } );

              if ( toGo.current.hasOwnProperty('fName') || toGo.current.hasOwnProperty('sName') ){
                Firebase.auth().currentUser.updateProfile({
                  displayName: upload.fName + "  " + upload.sName,
                }).then(function() {
                  enqueueSnackbar (
                    'FireBase profile Name updated--' , {
                      variant : "success"  ,
                      autoHideDuration: 2500,
                    }
                  );
                }).catch(function(error) {
                  enqueueSnackbar (
                    'An error occured while updating profile Name!' , {
                      variant : "error"  ,
                      autoHideDuration: 2500,
                    }
                  );
                });
              }

              if ( toGo.current.hasOwnProperty('email') ){
                Firebase.auth().currentUser.updateEmail(upload.email)
                  .then(function() {
                    enqueueSnackbar (
                      'FireBase profile email updated--' , {
                        variant : "success"  ,
                        autoHideDuration: 2500,
                      }
                    );
                  }).catch(function(error) {
                    enqueueSnackbar (
                      'An error occured while updating profile emeil!' , {
                        variant : "error"  ,
                        autoHideDuration: 2500,
                      }
                    );
                  });
              }

              if ( toGo.current.hasOwnProperty('pass1') ){
                Firebase.auth().currentUser.updatePassword(upload.pass1)
                  .then(function() {
                    enqueueSnackbar (
                      'FireBase profile password updated--' , {
                        variant : "success"  ,
                        autoHideDuration: 2500,
                      }
                    );
                  })
                    .catch(function(error) {
                      enqueueSnackbar (
                        'An error occured while updating profile password!' , {
                          variant : "error"  ,
                          autoHideDuration: 2500,
                        }
                      );
                });
              }

          }).catch ( error=>{
            enqueueSnackbar (
              error.message , {
                variant : "wrong password"  ,
                autoHideDuration: 2500,
              });
            });
    })();
    setOpen ( false )
  }

  return (
    <div>
      <Toolbar>
        <div className={classes.grow} />
        <SectionDesktop/>
      </Toolbar>
    <div className={classes.root} ref={root}>
      <Grid container spacing={3} style={{justifyContent:'flex-end'}}>
        <Grid item xs={8} >
          <Paper className={classes.outer} ref={card}>
            <Paper className={classes.inner}>
              <Typography className={classes.typography}>
                Edit Profile
              </Typography>
            </Paper>
            <Grid container spacing={3}>
              <Grid item xs={6} component='form' style={{display:'flex',alignItems:'flex-end', flexDirection:'column'}}>
                <Input
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  label="first name"
                  validate={values.fNameValid}
                  value={values.fName}
                  onChange={handleChange('fName')}
                />
                <Input
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  label="email adress"
                  validate={values.emailValid}
                  value={values.email}
                  onChange={handleChange('email')}
                />
                <Input
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  label="company"
                  validate={values.companyValid}
                  onChange={handleChange('company')}
                  value={values.company}
                />
                <Input
                  autoComplete="on"
                  onPaste={disablePaste}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  label={values.passLabel}
                  validate={values.pass1Valid}
                  onChange={handleChange('pass1')}
                  value={values.pass1}
                  type={values.showPassword1 ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword1}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {values.showPassword1 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} component='form' style={{display:'flex',alignItems:'flex-start', flexDirection:'column'}}>
                <Input
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  label="last name"
                  validate={values.sNameValid}
                  value={values.sName}
                  onChange={handleChange('sName')}
                />
                <Input
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  label="phoneNumber"
                  validate={values.phoneValid}
                  value={values.phone}
                  onChange={handleChange('phone')}
                />
                <Input
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  label="job"
                  validate={values.jobValid}
                  value={values.job}
                  onChange={handleChange('job')}
                />
                <Input
                  autoComplete="on"
                  onPaste={disablePaste}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  label={values.pass2Label}
                  validate={values.pass2Valid}
                  value={values.pass2}
                  onChange={handleChange('pass2')}
                  type={values.showPassword2 ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword2}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {values.showPassword2 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Button variant="contained" color="secondary" className={classes.buttonFire} onClick={handleUpdate}>
                save details
                <SaveIcon className={classes.rightIcon} />
              </Button>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Grid container spacing={2}
            style={{
              display:'flex',
              justifyContent:'center',
              alignItems:'flex-end',
              position:'relative',
              top :'3vh',
          }}>
            <Grid item>
              <Paper className={classes.outer_card}>
                <CardMedia
                  component='img'
                  alt="KW"
                  height="300"
                  image="static/person.png"
                  className={classes.inner_card}
                />
                <Typography className={classes.billboard}>
                  {values.fName + " " + values.sName}
                </Typography>
                <div style={{display:"flex",justifyContent:'space-evenly',position:'relative',top:'-4vh'}}>
                  <Button color="primary">
                    Upload profile picture
                  </Button>
                  <Button color="primary">
                    remove profile picture
                  </Button>
                </div>
                <Button variant="contained" color="secondary" className={classes.button} onClick={()=>{props.history.push ( '/pricing' )}}>
                  Subscription
                  <AccountBalanceIcon className={classes.rightIcon} />
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
    <Dialog onClose={()=>setOpen(false)} open={open} className={classes.avatar}>
      <DialogContent style={{display:'flex', flexDirection:'column',alignItems:'center'}}>
        <List>
          {Array.from ( changed.current )
          .map(email => (
            <ListItem >
              <EditOutlinedIcon color="secondary"/>
              <ListItemText primary={email} />
            </ListItem>
          ))}
        </List>
        <form>
          <Input
            autoComplete="on"
            onPaste={disablePaste}
            label="password!"
            validate={e => ! strongPass ( e )[ 1 ]}
            onChange={handleChange('pass3')}
            value={values.pass3}
            type={values.showPassword3 ? 'text' : 'password'}
            InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword3}
                  onMouseDown={handleMouseDownPassword}
                >
                  {values.showPassword3 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          />
        </form>
        <Button variant="contained" color="secondary" onClick={handleConfirm} style={{margin:'auto', width:'70%'}}>
          Confirm
          <DoneAllOutlinedIcon className={classes.rightIcon} />
        </Button>
      </DialogContent>
    </Dialog>
    </div>
  );
}

export default withRouter ( withSnackbar ( PaperSheet ) )
