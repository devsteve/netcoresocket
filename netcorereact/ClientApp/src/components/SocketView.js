import React, { Component } from 'react';
import Directionbutton from './buttons/Directionbutton';

import socketClass from '../classes/socketClass';

export class SocketView extends Component {
  
  constructor(props) {
    super(props);
    this.state = { data: [], loading: false };
    //On async load use 
    //this.setState({ data: [], loading: false });  
    this.socketConnector = socketClass.get();
  }


  changeText(event) {
    console.log("sending: "+event.target.value);
    this.socketConnector.send(event.target.value,function(message) { console.log(message); });
  }

  renderSocket(data) {
    return (
      <div>
          {data}
          <input type="text" onChange={this.changeText.bind(this)} />

          <Directionbutton direction="Up" />

          <Directionbutton direction="Down" />
       </div>
      
    );
  }

  render() {
    let contents = this.state.loading
      ? <p><em>Loading</em></p>
      : this.renderSocket("Nothing");

    return (
      <div>
        <h1>Socket</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
    );
  }
}
