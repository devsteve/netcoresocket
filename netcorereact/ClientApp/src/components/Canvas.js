    import React, { Component } from 'react';
import socketClass from '../classes/socketClass';

export class Canvas extends Component {
  

  constructor(props) {
    super(props);

    //Socket setup
    this.socketConnector = socketClass.get();

    //Canvas Setup
    this.startPos = 0;

    this.canvas = {
      ctx : null,
      dimension: {
        cWidth: 500,
        cHeight: 500
      } 
    };
    this.sprite = {
      src: null,
      dimension: {
        sWidth: 74,
        sHeight: 54,
      }
    }

    this.user = {
      name: "P1",
      avatar: {
        id: 1,
        direction: 0, //0 for, 1 right, 2 down, 3 left
        posX : 10,
        posY: 400
      }
    };

    this.external = {
      users: [{
        name: "P2",
        avatar: {
          id: 2,
          direction: 0, //0 for, 1 right, 2 down, 3 left
          posX : 10,
          posY: 400
        }
      }]
    };
    /*
      {
        direction: 1, //0 for, 1 right, 2 down, 3 left
        posX : 10,
        posY: 500
      },{
        direction: 0, //0 for, 1 right, 2 down, 3 left
        posX : 100,
        posY: 500
      },{
        direction: 2, //0 for, 1 right, 2 down, 3 left
        posX : 0,
        posY: 300
      },{
        direction: 3, //0 for, 1 right, 2 down, 3 left
        posX : 30,
        posY: 0
      }
    ];
    */
    
    

    this.componentHasMounted = false;
    window.requestAnimationFrame(function($this){
      return $this.nextFrame.bind($this);
    }(this));
  }

  nextFrame() {
    if(this.componentHasMounted) {
      this.startPos++;
      if(this.startPos%10 === 0) {
        this.redraw((this.startPos/10));
      }
    }

    window.requestAnimationFrame(function($this){
      return $this.nextFrame.bind($this);
    }(this));
  }
  
  /**
   * Init DOM 
   */
  componentDidMount() {
    this.getContext();
    this.componentHasMounted = true;
  }

  /**
   * Once mounted populate the canvas context
   */
  getContext() {
    this.canvas.ctx = this.refs.canvas.getContext('2d');
    this.canvas.ctx.fillStyle = '#b2b2b2';
    this.canvas.ctx.fillRect(0,0,this.canvas.dimension.cWidth,this.canvas.dimension.cHeight);  

    //let imgStr = '/images/OfVoM.png';
    let imgStr = '/images/grunt.png';
    let img = document.createElement('IMG');
    img.src = imgStr;
    img.width = 370;
    img.height = 624;

    this.sprite.src = img;
  }

  /**
   * Update the objects from the server
   * @param {*} socketRet 
   */
  setObjs(socketRet) {
    
    const $this = this;
    console.log(socketRet);
    if(!socketRet.users) {
      return;
    }
    socketRet.users.forEach((user) => {
      
      //Todo find and update objects
      $this.external.users.push(user);
    });
    console.log($this.external);
/**
    this.objs = [
      {
        direction: 1, //0 for, 1 right, 2 down, 3 left
        posX : 10,
        posY: 500
      },{
        direction: 0, //0 for, 1 right, 2 down, 3 left
        posX : 100,
        posY: 500
      },{
        direction: 2, //0 for, 1 right, 2 down, 3 left
        posX : 0,
        posY: 300
      },{
        direction: 3, //0 for, 1 right, 2 down, 3 left
        posX : 30,
        posY: 0
      }
    ];
    */
  }

  /**
   * Use take a position object and calculate the next obj ani frame and position
   * @param {*} obj 
   * @param {*} count 
   * @param {*} sprite 
   */
  calcObjectMovement(obj,count,sprite) {
     let sx = 0;
     let sy = 0;
      
     let posx = 0;
     let posy = 0;
     
     let sequence = 0;
     let slideCount = count;

     /**
      * Movement scales, pixel amount based on dir
      */
     let horiScale = 6;
     let vertiScale = 5;
     let diagScale = 4;

     //Loop over count 0 - 4 (animation sprite has 4 walking frames)
     sequence = Math.floor(count/4);
     if(sequence > 0) {
       slideCount = (count - (sequence * 4));
     } else {
       slideCount = count;
     }

    //Direction 0 for up. Sy starts at second as first is standing.
     sx = ((obj.direction <= 0) ? 0 : obj.direction - 1) * sprite.dimension.sWidth;
     sy = obj.direction == 0 ? 0 : ((slideCount * sprite.dimension.sHeight) + sprite.dimension.sHeight);

     switch(obj.direction) { 
       case 1:
         posx = obj.posX;
         posy = obj.posY - vertiScale;
       break;
       case 2:
         posx = obj.posX + diagScale;
         posy = obj.posY - diagScale;
       break;  
       case 3:
         posx = obj.posX + horiScale;
         posy = obj.posY;
       break;  
       case 4:
         posx = obj.posX + diagScale;
         posy = obj.posY + diagScale;
       break;  
       case 5:
         posx = obj.posX;
         posy = obj.posY + vertiScale;
       break;  
       case 6:
         posx = obj.posX - diagScale;
         posy = obj.posY + diagScale;
       break;  
       case 7:
         posx = obj.posX - horiScale;
         posy = obj.posY;
       break;  
       case 8:
         posx = obj.posX - diagScale;
         posy = obj.posY - diagScale;
       break;  
       default:
         // stay
         posx = obj.posX;
         posy = obj.posY;
       break;
     }
     obj.posX = posx;
     obj.posY = posy;
     return {
       spriteX : sx,
       spriteY : sy,
       posX : posx,
       posY : posy
     }
  }

  redraw(frame) {
    
    //Divide by amount to slow up animation
    if(this.sprite.src) { 
      const count = frame;
      const canvas = this.canvas;
      const sprite = this.sprite;
      const objectMove = this.calcObjectMovement;

      //Only if we're drawing clear
      this.canvas.ctx.clearRect(0,0,this.canvas.dimension.cWidth,this.canvas.dimension.cHeight);

      let objPos = objectMove(this.user.avatar,count,sprite);
      
      //Where S Source (image), D Destination (cavnas) void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      canvas.ctx.drawImage(sprite.src,objPos.spriteX,objPos.spriteY,sprite.dimension.sWidth,sprite.dimension.sHeight,objPos.posX,objPos.posY,sprite.dimension.sWidth,sprite.dimension.sHeight);
      

      this.external.users.forEach(user => {
          let objPos = objectMove(user.avatar,count,sprite);
          //Where S Source (image), D Destination (cavnas) void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
          canvas.ctx.drawImage(sprite.src,objPos.spriteX,objPos.spriteY,sprite.dimension.sWidth,sprite.dimension.sHeight,objPos.posX,objPos.posY,sprite.dimension.sWidth,sprite.dimension.sHeight);
      });

    }
  }

  /**
   * Create the canvas DOM
   */
  renderCanvas() {
    
    return (
      <div ref="tdiv">
        <canvas ref="canvas" width="500" height="500"/>
      </div>
    );
    //<img id='image' src='/images/OfVoM.png' /> 
  }


  directionInput(direction) {
    this.user.avatar.direction = direction; 
    
    let message = {
      user : this.user
    };
    console.log("sending: "+message);
  //  this.socketConnector.send(message,(message) => { this.setObjs(message);});
  }

    directionInputP2(direction) {
        let $this = this;
        this.external.users.forEach((user) => {
            if (user.name === 'P2') {
                user.avatar.direction = direction;
                let message = {
                    user: user
                };
                console.log("sending p2: " + message);
    //            $this.socketConnector.send(message, (message) => { $this.setObjs(message); });
            }
        });
   }

  renderControls() {
    const $this = this;
      let setSendDirection = (direction) => { return function () { $this.directionInput(direction); }; };
      let setSendDirectionP2 = (direction) => { return function () { $this.directionInputP2(direction); }; };

    return (
      <div>
          <button onClick={setSendDirection(0)}>Stop</button>
          <button onClick={setSendDirection(1)}>NN</button>
          <button onClick={setSendDirection(2)}>NE</button>
            <button onClick={setSendDirection(3)}>E</button>
            <button onClick={setSendDirectionP2(2)}>E</button>
       </div>
      
    );
  }

  /**
   * Load canvas in container
   */
  render() {
    let canvas = this.renderCanvas();
    
    return (
      <div>
        <h1>View</h1>
        {canvas}
        {this.renderControls()}
      </div>
    );
  }
}