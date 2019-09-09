import React, { Component } from 'react';
import NestedGrid from './demo'
import Listing from './list'
import Drawer from './responsiveDrawer'
import Firebase from './firebase'
import { SnackbarProvider , withSnackbar } from 'notistack';

const io = require ( 'socket.io-client' );
const socket = io ( );

let Land = Listing[ 1 ];

class App extends Component {
  state = {
    characters: [ ] ,
    loaded: true ,
    sitePage: "" ,
    logo:"" ,
    path: 0 ,
    refresh: null ,
  };

  componentDidMount = ( )=> {
    this.fetcher ( Land[ 2 ] , Land[ 1 ] , Land[ 3 ] );
    socket.on ( "outgoing data", ( data ) => {
      //let set  = new Set( [ ...this.state.characters , ...data ] );
      data.forEach ( ( upload ) => {
        Firebase.database().ref ( this.state.path +'/' + upload.name.replace ( /[^\w\s]/gi, '' ) )
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

    socket.on ( "logs", ( data ) => {
      console.log ( data );
    } );
  }

  fetcher = ( site , get , logo ) => {
    this.setState ( {
      loaded: false ,
      refresh: null,
      sitePage: site  ,
      logo: logo ,
      characters: [ /*{ name: "burna boy" , job: "temperature " , image: "static/live-from-space.jpg" , market: "UK/London"}*/ ],
    } );

    var leadsRef = Firebase.database().ref  ( get.toString ( ) );
    leadsRef.once ( 'value' , ( snapshot )=> {
      let incoming = [ ];
      console.log ( site + "__" + snapshot.exists() )
      snapshot.forEach ( function ( childSnapshot) {
        incoming.push ( childSnapshot.val ( ) );
      });
      this.setState ( {
        characters: snapshot.exists ( ) ? [...incoming ] : [ ] ,
        loaded: snapshot.exists() ,
        path:  get ,
        refresh: () => {
          socket.emit ( get , site );
          this.props.enqueueSnackbar("refreshing... " + site , {
            variant : "info" ,
            autoHideDuration: 900,
          });
        } ,
      } );
    });
  }

  render ( ) {
    return (
      <div style={{backgroundColor:"#D3D3D3"}}>
        <Drawer
          sitePage={this.state.sitePage}
          refresh={this.state.refresh}
          logo={this.state.logo}
          fetcher={this.fetcher}
          content={<NestedGrid elements={ this.state.characters } loaded={this.state.loaded}/>}
        />

      </div>
    );
 }
}

let App1 =  withSnackbar ( App );
export default function IntegrationNotistack (  ) {
  return (
    <SnackbarProvider maxSnack={2} preventDuplicate>
      <App1/>
    </SnackbarProvider>
  );
}
