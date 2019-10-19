// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import Firebase from './firebase';
import { withSnackbar , useSnackbar } from 'notistack';
import Typography from '@material-ui/core/Typography';

window.detectBrowser = function () {
  // Opera 8.0+

  //var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';
  // Safari 3.0+ "[object HTMLElementConstructor]"
  //var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof (safari) !== 'undefined' && safari.pushNotification));
  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/false || !!document.documentMode;
  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia;
  // Chrome 1 - 71
  var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  // Blink engine detection
  //var isBlink = (isChrome || isOpera) && !!window.CSS;

  var output = '';
    if (isFirefox) {
      output += 'Firefox: ';
    }
    if (isChrome) {
      output += 'isChrome: ';
    }
    if (true) {
      output += 'isIE: ';
    }
    if (isEdge) {
      output += "isEdge: " ;
    }
  return output;
}

window.mobileAndTabletcheck = function() {
  var check = false;
  // eslint-disable-next-line
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

window.mobilecheck = function() {
  var check = false;
  // eslint-disable-next-line
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};



function AuthedUser ( props ) {
  const [ user, setUser ] = React.useState( Firebase.auth().currentUser );
  const [ redirect, setRedirect ] = React.useState( false );
  const { enqueueSnackbar , } = useSnackbar();
  React.useEffect( () => {
    Firebase.auth().onAuthStateChanged ( user => {
      if ( user ){
        //sessionStorage.setItem ( 'User' , JSON.stringify ( user ) );
        let date = new Date()
        enqueueSnackbar ( "Signed in as " + user.displayName , {
            variant : "info"  ,
            autoHideDuration: 2500,
        });

        (async()=> {
          await Promise.all([
            Firebase.database().ref  ( "Plans/" + user.uid.toString ( )  )
              .once ( 'value').then ( snapshot=>{
                if (snapshot.exists ()) {
                  let incoming = {};
                  snapshot.forEach ( function ( childSnapshot) {
                    incoming[childSnapshot.key] = childSnapshot.val();
                  });
                  if (incoming.endDate === 0) {
                    enqueueSnackbar (
                      "renew your subscription" , {
                        variant : "info"  ,
                        autoHideDuration: 4500,
                      }
                    );
                  }
                }else{
                  enqueueSnackbar (
                    "create a new subscription" , {
                      variant : "info"  ,
                      autoHideDuration: 4500,
                    }
                  );
                }
            } )
            ,
            new Promise(function(resolve, reject) {
              try {
                let device = "Desktop"
                if (window.mobileAndTabletcheck()) {
                  device="Tablet"
                  if (window.mobilecheck()) {
                    device="Mobile"
                  }
                }
                Firebase.database().ref  ( "devices/" + Firebase.auth().currentUser.uid.toString ( ) + `/${date.getFullYear()}_${date.getMonth()}_${date.getDate()}` )
                  .once ( 'value').then ( snapshot=>{
                    if (true) {
                      let device_ = snapshot.val() || [];
                      if (!device_.some(item=>item===device)){
                        Firebase.database().ref ( "devices/" + Firebase.auth().currentUser.uid.toString ( ) + `/${date.getFullYear()}_${date.getMonth()}_${date.getDate()}` )
                          .set ( [...device_, device] , (error) => {
                            if (!error) {

                            }else {
                              console.log ( error )
                              alert ( 'failed to update device information plan to FireBase!' );
                            }
                          } )
                      }
                    }
                } )
                return resolve()
              } catch (e) {
                return reject(e)
              }
            })
            ,
            Firebase.database().ref  ( "userData/" + user.uid  + "/isAdmin" )
              .once ( 'value').then ( snapshot=>{
                if (snapshot.exists ()) {
                  sessionStorage.setItem('isAdmin', snapshot.val());
                }
            } )
          ])
        })();
      }else {
        setRedirect ( true )
        setUser ( user )
        enqueueSnackbar ( "you have to log in first..." , {
            variant : "error"  ,
            autoHideDuration: 2500,
        });
      }
      setUser ( user )
    });
    return () => {
    };
  });
  return [ user , redirect ];
}

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { enqueueSnackbar , closeSnackbar } = useSnackbar();
  let key = React.useRef ()

  const user = AuthedUser();
  if ( ! user[ 0 ] ){
    key.current =
      enqueueSnackbar ( "waiting for FireBase" , {
        variant : "warning"  ,
        persist: true,
      })
  }else {
    closeSnackbar ( key.current );
  }
  if ( user[ 1 ] ){
    closeSnackbar ( key.current );
  }

  return (
    <Route
      {...rest}
      render={props =>
        user[ 0 ] ? (
          <Component {...props} />
        ) : (
          user[ 1 ] ? (
            <Redirect to={{ pathname: '/', state: { from: props.location } }} />
          ):(
            <Typography
              style={{
                background : `linear-gradient( rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4) ), url(static/pexels.jpeg)` ,
                height:'100vh',
                width:'100vw' ,
                backgroundSize: 'cover',
              }}
            />
          )
        )
      }
    />
  )
}

export default withSnackbar ( PrivateRoute );
