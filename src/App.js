import React, { Component } from 'react';
import NestedGrid from './demo'
import Listing from './list'
import Drawer from './responsiveDrawer'
import Firebase from './firebase'
import { withSnackbar } from 'notistack';
//import './App.css'

const io = require ( 'socket.io-client' );
const socket = io ( );

function msToTime ( duration ) {
  var minutes = parseInt ( ( duration / ( 1000 * 60 ) ) % 60 )
      , hours = parseInt ( ( duration / ( 1000 * 60 * 60 ) ) % 24 );

  hours =  ( hours < 10 ) ? "0" + hours : hours;
  minutes = ( minutes < 10 ) ? "0" + minutes : minutes;
  // eslint-disable-next-line
  return hours + "hrs " + minutes + "mins" ;
}

class App extends Component {
  state = {
    characters: [ ] ,
    loaded: true ,
    sitePage: "" ,
    logo:"" ,
    path: 0 ,
    refresh: null ,
    stale : '' ,
    page : 0 ,
    permitted: [ ],
    permissionsLoaded: false,
    error: null,
    errorInfo: null,
    meter:0,
  };

  componentDidMount = async ( )=> {
    let user = Firebase.auth().currentUser;
    let date = new Date();
    if ( user ){
      await Promise.all([
        Firebase.database().ref  ( "Plans/" + user.uid.toString ( )  )
          .once ( 'value').then ( snapshot=>{
            if (snapshot.exists()) {
              let plan = [];
              snapshot.forEach ( function ( childSnapshot) {
                plan.push(childSnapshot.val());
              });
              if ( plan.length ){
                let set = new Set ();
                plan.forEach((item) => {
                  item.following.forEach((following) => {
                    set.add(following);
                  })
                })
                let Listed = Listing.filter ( companyList => Array.from(set)
                  .some ( permission => companyList.includes( permission ) ) );
                if (plan.some(item=>item.num===9999)) {
                  Listed = Listing;
                }
                this.setState ( {...this.state , permitted: Listed , permissionsLoaded: true} );
                  if ( Listed.length ){
                    let Land = Listed[ 0 ];
                    this.fetcher ( Land[ 2 ] , Land[ 1 ] , Land[ 3 ] );
                  }
                  //console.log ( "DashboardUser__plans_++_" + snapshot.exists() + '_-_' + JSON.stringify ( plan ) );
                }else{
                  //console.log('subscriptions expred!');
                  this.setState ( {...this.state , permissionsLoaded: true} );
                }

              }else {
                console.log('new user!');
                this.setState ( {...this.state , permissionsLoaded: true} );
              }
          } )
        ,
        Firebase.database().ref  ( "metering/" + user.uid.toString ( ) + `/${date.getFullYear()}_${date.getMonth()}_${date.getDate()}` )
          .once ( 'value').then ( snapshot=>{
            if (snapshot.exists()) {
              let meter = snapshot.val();
              this.setState ( {...this.state , meter:meter} );
            }
          } )
      ])
    }

    /*socket.on ( "outgoing data", ( data ) => {
      data.forEach ( ( upload ) => {
        upload.timestamp = new Date ( ).getTime ( );
        Firebase.database().ref ( this.state.path +'/' + upload.name.replace ( /[^\w\s]/gi, '_' ) )
          .set ( upload ,  ( error )=> {
            if ( error ) {
              console.log ( error )
              alert ( 'failed to update FireBase!' );
            } else { // eslint-disable-next-line
              console.log ( 'FireBase updated' + "__" + this.state.path )
            }
          } );
      } );
    } );
    */
    socket.on ( "logs", ( data ) => {
      console.log ( data );
    } );
  }

  fetcher = ( site , get , logo ) => {
    this.setState ( {
      page : 1 ,
      loaded: false ,
      refresh: null,
      sitePage: site  ,
      logo: logo ,
      stale : '' ,
      characters: [ /*{ name: "burna boy" , job: "temperature " , image: "static/live-from-space.jpg" , market: "UK/London"}*/ ],
    } );

    window.scrollTo ( 0 , 0 );
    var Ref = Firebase.database().ref  ( get.toString ( ) );
    Ref.orderByChild ( `name` ).limitToFirst ( 7 ).once ( 'value' , ( snapshot )=> {
      let incoming = [ ];
      console.log ( site + "__" + snapshot.exists() )
      snapshot.forEach ( function ( childSnapshot) {
        incoming.push ( childSnapshot.val ( ) );
      });
      this.meter(incoming.length+this.state.characters.length);
      this.setState ( {
        characters: snapshot.exists ( ) ? [...incoming ] : [ ] ,
        loaded: snapshot.exists() ,
        path:  get ,
        stale: incoming[ 0 ] ? incoming[ 0 ].timestamp ? msToTime ( new Date ( ).getTime ( ) - incoming[ 0 ].timestamp ) : '' : ''  ,
        refresh: () => {
          //Ref.remove ( );
          //socket.emit ( get , site );
          alert (site);
          this.props.enqueueSnackbar("refreshing... " + site , {
            variant : "info" ,
            autoHideDuration: 900,
          });
        } ,
      } );
    });
  }

  paginate = (  ) => {
    let page = this.state.page
    console.log ( page );
    if ( this.state.characters[ this.state.characters.length - 1 ] ){
      let name = this.state.characters[ this.state.characters.length - 1 ].name
      var Ref = Firebase.database ( ).ref ( this.state.path.toString ( ) )
        .orderByChild ( `name` )
          .startAt (  name + "Z" )
            .limitToFirst ( 7 );
      Ref.once ( 'value' , ( snapshot )=> {
        let incoming = [ ]; // eslint-disable-next-line
        console.log ( this.state.path + `--page.${this.state.page}` + "__" + snapshot.exists() )
        snapshot.forEach ( function ( childSnapshot) {
          incoming.push ( childSnapshot.val ( ) );
        });
        console.log ( incoming )
        if ( snapshot.exists ( ) ){
          this.meter(incoming.length+this.state.characters.length);
          this.setState ( {
            characters : [ ...this.state.characters , ...incoming ] ,
            page : this.state.page + 1
          } )
        }else {
          this.setState ( {
            page : 0
          } )
        }
      })
    }
  }

  meter = (n) =>{
    let date = new Date()
    Firebase.database().ref ( "metering/" + Firebase.auth().currentUser.uid.toString ( ) + `/${date.getFullYear()}_${date.getMonth()}_${date.getDate()}` )
      .set ( this.state.meter + n , (error) => {
        if (!error) {
          this.setState({...this.state,meter:this.state.meter + n})
        }else {
          console.log ( error )
          alert ( 'failed to update metering information plan to FireBase!' );
        }
      } )
  }

  componentDidCatch = ( error , errorInfo )=> {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }

  render ( ) {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }else{
      return (
        <div style={{backgroundColor:"#D3D3D3",}}>
          <Drawer
            sitePage={this.state.sitePage}
            refresh={this.state.refresh}
            logo={this.state.logo}
            stale={this.state.stale}
            page={this.state.page}
            permitted={this.state.permitted}
            permissionsLoaded={this.state.permissionsLoaded}
            fetcher={this.fetcher}
            paginate={this.paginate}
            content={<NestedGrid elements={ this.state.characters } loaded={this.state.loaded}/>}
          />
        </div>
      );
    }
 }
}

export default withSnackbar ( App );
