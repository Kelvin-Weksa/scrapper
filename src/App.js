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
    this.fetcher ( "1" );
  }

  fetcher = val => {
    fetch ( val )
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
        <AppBar fetcher={this.fetcher}/>
        <hr />
        {this.state.loaded ? <NestedGrid elements={ this.state.characters } /> : <Progress />}
      </div>
    );
 }
}

export default App;
