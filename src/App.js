import React, { Component } from 'react';
import AppBar from './appBar'
import NestedGrid from './demo'

class App extends Component {
  state = { characters: [ { name: "relax" , job: "boss you too much" , image: "static/live-from-space.jpg" , market: "UK/London"} ] };
  componentDidMount ( ) {
    fetch ( "/datum" )
      .then ( result => result.json ( ) )
        .then ( result => {
          this.setState ( {
            characters: [ ...this.state.characters , ...result ]
          } )
      } );
    }
  render ( ) {
    return (
      <div>
        <AppBar />
        <hr />
        <NestedGrid elements={ this.state.characters }
        />
      </div>
    );
 }
}

export default App;
