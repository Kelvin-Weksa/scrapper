import React, { Component } from 'react';
import AppBar from './appBar'
import NestedGrid from './demo'
import Progress from './progress'

class App extends Component {
  state = {
    characters: [ /*{ name: "relax" , job: "boss you too much" , image: "static/live-from-space.jpg" , market: "UK/London"}*/ ] ,
    loaded: false ,
  };
  componentDidMount ( ) {
    fetch ( "/1" )
      .then ( result => result.json ( ) )
        .then ( result => {
          this.setState ( {
            characters: [ ...this.state.characters , ...result ] ,
            loaded: true ,
          } )
      } );
    }
  render ( ) {
    return (
      <div>
        <AppBar />
        <hr />
        {this.state.loaded ? <NestedGrid elements={ this.state.characters } /> : <Progress />}
      </div>
    );
 }
}

export default App;
