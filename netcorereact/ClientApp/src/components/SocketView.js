import React, { Component } from 'react';

export class SocketView extends Component {
  
  constructor(props) {
    super(props);
    this.state = { data: [], loading: false };
    //On async load use 
    //this.setState({ data: [], loading: false });  

    let scheme = document.location.protocol === "https:" ? "wss" : "ws";
    let port = document.location.port ? (":" + document.location.port) : "";
    let connectionUrl = scheme+"://" + document.location.hostname + port + "/ws" ;

    this.socket = new WebSocket(connectionUrl);

    SocketView.connect(this.socket);
  }


  changeText(event) {
    console.log("sending: "+event.target.value);
    this.socket.send(event.target.value);
  }

  renderSocket(data) {
    return (
      <div>
          {data}
          <input type="text" onChange={this.changeText.bind(this)} />
      </div>
      
    );
  }

        
  static connect(socket) {

   
      socket.onopen = function (event) {
        console.log('Connection opened');
      };
      socket.onclose = function (event) {
        console.log(event.code);
        console.log(event.reason);
      };
     // socket.onerror = updateState;
     socket.onmessage = function (event) {
        console.log("Return "+event.data);  
        console.log(event.data);
      };

     
  };

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
