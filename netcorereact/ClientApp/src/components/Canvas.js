import React, { Component } from 'react';

export class Canvas extends Component {
  

  constructor(props) {
    super(props);
    this.startPos = 0;

    this.canvas = {
      ctx : null,
      sprite : null,
      dimension: {
        cWidth: 500,
        cHeight: 500,
        sWidth: 74,
        sHeight: 54,
      } 
    };

    this.objs = [
      {
        direction: 1, //0 for, 1 right, 2 down, 3 left
        posX : 10,
        poxY: 10
      }
    ];
    
    

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

    let imgStr = '/images/OfVoM.png';
    let img = document.createElement('IMG');
    img.src = imgStr;
    img.width = 370;
    img.height = 624;

    this.canvas.sprite = img;
  }

  redraw(frame) {
    //console.log('called'+frame);
    
    

    if(this.canvas.sprite && ((frame % 3) === 0)) { 
      let count = (frame / 3);
      let sx = 0;
      let sy = 0;
      let sequence = 0;
      let slideCount = count;
      let canvas = this.canvas;

      //Only if we're drawing clear
      this.canvas.ctx.clearRect(0,0,this.canvas.dimension.cWidth,this.canvas.dimension.cHeight);

      //Loop over count 0 -5
      sequence = Math.floor(count/5);
      if(sequence > 0) {
        slideCount = (count - (sequence * 5));
      } else {
        slideCount = count;
      }

      
      this.objs.forEach(obj => {
          //forward
          sx = obj.direction * canvas.dimension.swidth;
          sy = (slideCount * canvas.dimension.sHeight);
        
          //Where S Source (image), D Destination (cavnas) void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
          canvas.ctx.drawImage(canvas.sprite,sx,sy,canvas.dimension.sHeight,canvas.dimension.sWidth,10,10,canvas.dimension.sHeight,canvas.dimension.sWidth);
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
        <img id='image' src='/images/OfVoM.png' />  
      </div>
    );
    //<img id='image' src='/images/OfVoM.png' /> 
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
        
      </div>
    );
  }
}