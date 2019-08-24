import React, { Component } from 'react';
import AppBar from './appBar'
import NestedGrid from './demo'
import Drawer from './persistentDrawer'

const io = require ( 'socket.io-client' );
const socket = io ( );

class App extends Component {
  state = {
    characters: [ ] ,
    loaded: true ,
    sitePage: "" ,
    logo:""
  };
  componentDidMount ( ) {
    this.fetcher ( "3i Group" , '1' , 'https://www.3i.com/images/logo.svg' );
    socket.on ( "outgoing data", ( data ) => {
      this.setState ( { characters: [ ...this.state.characters , ...data ] , loaded: true ,  } )
    } );

    socket.on ( "logs", ( data ) => {
      console.log ( data );
    } );
  }
  fetcher = ( site , get , logo ) => {
    this.setState ( {
      loaded: false ,
      sitePage: site  ,
      logo: logo ,
      characters: [ /*{ name: "burna boy" , job: "temperature " , image: "static/live-from-space.jpg" , market: "UK/London"}*/ ],
    } );
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
      <div style={{backgroundColor:"#D3D3D3"}}>
        <AppBar fetcher={this.fetcher}/>
        <Drawer
          sitePage={this.state.sitePage}
          logo={this.state.logo}
          fetcher={this.fetcher}
          content={<NestedGrid elements={ this.state.characters } loaded={this.state.loaded}/>}
        />
      </div>
    );
 }
}

export default App;
