import React, { Component } from 'react';
import AppBar from './appBar'
import NestedGrid from './demo'
import Progress from './progress'

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
    this.setState ( { loaded: false , sitePage: site } )
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
        <hr />
        {this.state.loaded ? <NestedGrid elements={ this.state.characters } /> : <Progress sitePage={this.state.sitePage}/>}
      </div>
    );
 }
}

export default App;
