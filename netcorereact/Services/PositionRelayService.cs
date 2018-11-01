using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using System.Collections.Generic;
using Newtonsoft.Json;
using netcorereact.containers;


namespace netcorereact.services
{
  /**
   ** TODO Create as sigleton service instead of static methods
   **/  
  public static class PositionRelayServices
  {
      
    public static async Task addContext(HttpContext context) {
        WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await Echo(context, webSocket);
    }

    private static String DecompileMessages(ArraySegment<byte> message) {
          var bufferToString = Encoding.UTF8.GetString(message);
            //todo see objects
          var messageObject = JsonConvert.DeserializeObject<PositionTracker>(bufferToString);
          return bufferToString;  
    }

    private static async Task Echo(HttpContext context, WebSocket webSocket)
    {
        var pt = new PositionTracker();
        
        var buffer = new byte[1024 * 4];
        var messages = new List<byte>();
        string currentMessageKey = null;
      //  WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
        //While Open
        //while (!result.CloseStatus.HasValue) { 
            //Do while we don't have the end of a message
        try {    
            var (response, message) = await ReceiveFullMessage(webSocket,CancellationToken.None);
            Console.WriteLine("Did Receive");

            var bufferToString = Encoding.UTF8.GetString(message.ToArray());
            
            Console.WriteLine(bufferToString);
            var messageObject = JsonConvert.DeserializeObject<PositionTracker>(bufferToString);


            if(!String.IsNullOrEmpty(messageObject.key) && messageObject.key != currentMessageKey){
                Console.WriteLine("Writing and sending");
                currentMessageKey = messageObject.key; 

                var returnMessage = new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(bufferToString),
                                                              offset: 0, 
                                                              count: response.Count);

                Console.WriteLine(webSocket.GetHashCode());
                await webSocket.SendAsync(returnMessage, response.MessageType, response.EndOfMessage, CancellationToken.None);
            }
        } catch (WebSocketException ex) {
            Console.WriteLine("Failed to receive");
            Console.WriteLine(ex.Message);    
        } finally {
            try {
                Console.WriteLine("Close Finally"); 
                //await webSocket.CloseAsync(WebSocketCloseStatus.EndpointUnavailable, "Closing", CancellationToken.None);   
            } catch (WebSocketException ex) {
                 Console.WriteLine("Close exception");
                 Console.WriteLine(ex.Message);
            }
        }
    }


    static async Task<(WebSocketReceiveResult, List<byte>)> ReceiveFullMessage(WebSocket socket, CancellationToken cancelToken)
    {
        WebSocketReceiveResult response;
        var message = new List<byte>();
  
        var buffer = new byte[4096];
        do
        {
            response = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), cancelToken);
            message.AddRange(new ArraySegment<byte>(buffer, 0, response.Count));
        }
        while (response.MessageType != WebSocketMessageType.Close && !response.EndOfMessage && !response.CloseStatus.HasValue);
        
        return (response, message);
    }
  }
}

