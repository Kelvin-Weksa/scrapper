import React, { Component } from 'react';
import NestedGrid from './demo'
import Listing from './list'
import Drawer from './responsiveDrawer'

const io = require ( 'socket.io-client' );
const socket = io ( );

let Land = Listing[ 1 ];

class App extends Component {
  state = {
    characters: [ ] ,
    loaded: false ,
    sitePage: "" ,
    logo:""
  };
  componentDidMount ( ) {
    this.fetcher ( Land[ 2 ] , Land[ 1 ] , Land[ 3 ] );
    socket.on ( "outgoing data", ( data ) => {
      let set  = new Set( [ ...this.state.characters , ...data ] );
      this.setState ( { characters: [ ...set ] , loaded: true ,  } )
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
      characters: [ /*{ name: "burna boy" , job: "temperature " , image: "static/live-from-space.jpg" , market: "UK/London",
    about:`The easiest way to talk about music is to not talk about music at all. Those mysterious fluctuations of air will forever resist description — so instead, we tend to chat about who made the music, whom they made it for, whom it’s being marketed to and how. Best-case scenario, all of this extramusical talk pushes us right up to the unspeakable sensation of how the mystery actually feels.

Burna Boy seemed to have everyone talking this summer. Surfing waves of hype that felt thick with context and backstory, the 28-year-old Nigerian pop phenom’s newest album, “African Giant,” has sparked smart conversations about how today’s globalized popscape is beginning to obsolesce the idea of a foreign star “crossing over” to American audiences. Before the July splashdown of “African Giant,” Burna had already performed at Coachella, won a trophy at June’s BET Awards and landed a spot on Beyoncé’s recent promotional album for “The Lion King.” There’s no crossing over when the world is already listening.

Burna has been listening, too. He says he grew up on the songs of American rap star DMX, Jamaican dancehall titan Buju Banton and Nigerian icon Fela Kuti, the Afrobeat pioneer whom Burna’s grandfather once managed. “Everyone’s got their hero,” Burna recently told the Associated Press. “For me, that’s my hero.”

`}*/ ],
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
