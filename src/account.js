import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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
import Footer from './footer';
import Notifications from './user_notification';
import clsx from 'clsx';
import {useScrollPosition} from './use-scroll-position'

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

function validateEmail(email) {// eslint-disable-next-line
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateName(name) {// eslint-disable-next-line
  var re = /[^\w\s]/g;
  return ! re.test(name);
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
    width:'65vw'
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
  },
  paper1: {
    padding: theme.spacing(1.5, 1),
    transition : "all 300ms cubic-bezier(0.34, 1.61, 0.7, 1)",
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

function PaperSheet ( props ) {
  const classes = useStyles();
  const theme = useTheme ( );
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
              root.current.style.top = '0vh';
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
              }, 10);
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

  const [row, setRow] = React.useState ([false,true,true])
  let row1 = React.createRef();
  let row2 = React.createRef();
  let row3 = React.createRef();
  let guide = React.createRef();

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
            //console.log(row_positions);
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
        <div style={{display:"flex"}}>
          <Grid item  style={{flex:'0 1 5%',alignSelf:'flex-start',}}>
            <div style={{display:'flex',justifyContent:"center"}}>
              <div style={{position:'fixed',top:'30vh'}} ref={guide}>
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
          <Grid container spacing={3}
            style={{
              display:'flex',
              flexFlow:'column nowrap',
              alignItems:'center',
              justifyContent:'flex-end',
            }}>
            <Grid item  ref={row1}>
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
            <div style={{height:theme.mixins.toolbar.minHeight}}/>
            <Grid item ref={row2}>
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
            <div style={{height:theme.mixins.toolbar.minHeight}}/>
            <Grid item style={{width:'70vw'}} ref={row3}>
              <Paper className={classes.paper1}>
                {React.useMemo(()=><Notifications/>,[])}
              </Paper>
            </Grid>
            <div style={{height:theme.mixins.toolbar.minHeight}}/>
          </Grid>
        </div>
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
      <Footer/>
    </div>
  );
}

export default withRouter ( withSnackbar ( PaperSheet ) )
