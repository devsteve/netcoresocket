/**
 * Reusable class to handle single socket sonnection with server
 */
class socketClass {
    
    static _instance;

    /**
     * Useage socketClass.get() not new Socketclass, to avoid multiple socket connections
     * Singleton pattern
     */
    static get() {
      if(!socketClass._instance) {
        socketClass._instance = new socketClass();
      } 
      return socketClass._instance;
    }

    /**
     * Should be private, do not instate externally
     */
    constructor() {  
      this.socket = this._setSocket();

      this._messageQueue = [];
      this._messageCount = 0;
    }

    _setSocket() { 
      console.log('setting socket');
      let scheme = document.location.protocol === "https:" ? "wss" : "ws";
      let port = document.location.port ? (":" + document.location.port) : "";
      
      let connectionUrl = scheme+"://" + document.location.hostname + port + "/ws" ;
      let socket = new WebSocket(connectionUrl);
      this.connect(socket);
      return socket;
    }

    /**
     * Internal message to manage event queue
     * Todo: Reducer?
     */
    _addQueue(key,callback) {
      this._messageQueue.push({
        key: key,
        callback: callback
      });
    }

    /**
     * Take in a string key and return message and run the callback stored by that key in the message queue
     * 
     * @param {*} key 
     * @param {*} message 
     */
    _runMessage(key,message) {
      //Define message queue format (array);
      let initStackable = [];  
      //Check for key and pop it off the message queue, order may change so reduce
      this._messageQueue = this._messageQueue.reduce((stackable,element) => {
          if(element.key === key) {
            element.callback(message);
          } else {
            stackable.push(element);
          }
          return stackable;
      },initStackable);
    }

    /*
    * Send to server.
    * Response handled in onmessage 
    */
    send(message,callback) {
      //Increment count then generate unique key
      this._messageCount++;
      const key = this._messageCount+'_'+Date.now();
      
      this._addQueue(key,callback);
      let sendObj = {
        message: message,
        key: key
      };

      console.log(sendObj);
      console.log(JSON.stringify(sendObj));

      //Renew is closed
      if(!this.socket) {
        this.socket = this._setSocket();
        
        this.socket.onopen = function() {
          this.socket.send(JSON.stringify(sendObj));  
        }.bind(this);
      } else {
        this.socket.send(JSON.stringify(sendObj));
      }
    }

    connect(socket) {
  
        const $this = this;

        socket.onopen = function (event) {
          console.log('Connection opened');
        };
        socket.onclose = function (event) {
          console.log(event.code);
          console.log(event.reason);
          //Null the socket
          $this.socket = null; 
        };
        socket.onerror = function(error) {
            console.log(error);
        };
        

        socket.onmessage = function (event) {
          console.log("Return "+event.data);  
          let retObj = JSON.parse(event.data);
          
          if(retObj.key !== undefined) { 
            $this._runMessage(retObj.key,retObj.message);
          }
        };
    };
};
export default socketClass;