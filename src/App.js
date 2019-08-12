import React, { Component } from 'react';
import AppBar from './appBar'
import NestedGrid from './demo'
//import Progress from './progress'
import Drawer from './persistentDrawer'
//import YouTube from './skeleton.js'

class App extends Component {
  state = {
    characters: [ /*{ name: "relax" , job: "boss you too much" , image: "static/live-from-space.jpg" , market: "UK/London"}*/ ] ,
    loaded: false ,
    sitePage: ""
  };
  componentDidMount ( ) {
    this.fetcher ( "www.3i.com/our-people/" , '1' );
  }

  fetcher = ( site , get ) => {
    this.setState ( { loaded: false , sitePage: site  , characters: [ ] } )
    fetch ( get )
      .then ( result => result.json ( ) )
        .then ( result => {
          this.setState ( {
            characters: [...result ] ,
            loaded: true ,
          } )
      } );
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
