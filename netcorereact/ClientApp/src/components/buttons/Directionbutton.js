import React, { Component } from 'react';

import socketClass from  '../../classes/socketClass';

class Directionbutton extends Component {


  constructor(props) {
    super(props);
    this.socketConnector = socketClass.get();
  }

  sendDirection(direction) {
      this.socketConnector.send(direction,function(ret) { console.log('Callback '+ret); });
  }


  render() {
    const { direction } = this.props;
    const $this = this;
    let sendDirection = function(){ return $this.sendDirection(direction); };
    return (
      <button onClick={sendDirection}>{direction}</button>
    );
  }
}
export default Directionbutton;