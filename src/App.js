import React, { Component } from 'react';
import AppBar from './appBar'
import NestedGrid from './demo'
//import Progress from './progress'
import Drawer from './persistentDrawer'
//import YouTube from './skeleton.js'
const io = require ( 'socket.io-client' );
const socket = io.connect ( 'https://kelvin-weksa.herokuapp.com' );

class App extends Component {
  state = {
    characters: [ /*{ name: "relax" , job: "boss you too much" , image: "static/live-from-space.jpg" , market: "UK/London"}*/ ] ,
    loaded: false ,
    sitePage: ""
  };
  componentDidMount ( ) {
    this.fetcher ( "www.3i.com/our-people/" , '1' );
    socket.on ( "outgoing data", ( data ) => {
      this.setState ( { characters: [...data ] , loaded: true ,  } )
      //console.log ( "we have Nathan R" );
      //console.log ( data );
    } );
  }

  fetcher = ( site , get ) => {
    this.setState ( { loaded: false , sitePage: site  , characters: [ ] } )
    /*fetch ( get )
      .then ( result => result.json ( ) )
        .then ( result => {
          this.setState ( {
            characters: [...result ] ,
            loaded: true ,
          } )
      } );*/
    socket.emit ( get , site );
  }
  render ( ) {
    return (
      <div>
        <AppBar fetcher={this.fetcher}/>
        <Drawer
          sitePage={this.state.sitePage}
          fetcher={this.fetcher}
          content={<NestedGrid elements={ this.state.characters } loaded={this.state.loaded}/>}
        />
      </div>
    );
 }
}

export default App;
