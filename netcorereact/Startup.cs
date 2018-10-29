using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using System.Collections.Generic;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using netcorereact.containers;

namespace netcorereact
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            
            var webSocketOptions = new WebSocketOptions()
            {
                KeepAliveInterval = TimeSpan.FromSeconds(120),
                ReceiveBufferSize = 4 * 1024
            };
            app.UseWebSockets(webSocketOptions);

            app.Use(async (context, next) =>
            {
                if (context.Request.Path == "/ws")
                {
                    if (context.WebSockets.IsWebSocketRequest)
                    {
                        Console.WriteLine("Received Is WebSocket");
                        WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();

                        await Echo(context, webSocket);
                    }
                    else
                    {
                        Console.WriteLine("400'd");
                        context.Response.StatusCode = 400;
                    }
                }
                else
                {
                    await next();
                }

            });



            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                } 
            });
        }

        private String DecompileMessages(ArraySegment<byte> message) {
              var bufferToString = Encoding.UTF8.GetString(message);
                //todo see objects
              var messageObject = JsonConvert.DeserializeObject<PositionTracker>(bufferToString);
              return bufferToString;  
        }

        private async Task Echo(HttpContext context, WebSocket webSocket)
        {
            var pt = new PositionTracker();

            Console.WriteLine("Received 3");
            var buffer = new byte[1024 * 4];
            var messages = new List<byte>();
            string currentMessageKey = null;
          //  WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            //While Open
            //while (!result.CloseStatus.HasValue) { 
                //Do while we don't have the end of a message
            try {    
                var (response, message) = await ReceiveFullMessage(webSocket,CancellationToken.None);

                var bufferToString = Encoding.UTF8.GetString(message.ToArray());
                Console.WriteLine(bufferToString);
                var messageObject = JsonConvert.DeserializeObject<PositionTracker>(bufferToString);


                if(!String.IsNullOrEmpty(messageObject.key) && messageObject.key != currentMessageKey){
                    Console.WriteLine("Writing and sending");
                    currentMessageKey = messageObject.key; 

                    var returnMessage = new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(bufferToString),
                                                                  offset: 0, 
                                                                  count: response.Count);

                    await webSocket.SendAsync(returnMessage, response.MessageType, response.EndOfMessage, CancellationToken.None);
                }
            } finally {
                await webSocket.CloseAsync(WebSocketCloseStatus.EndpointUnavailable, "Closing", CancellationToken.None);
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
            while (!response.EndOfMessage);
            Console.WriteLine("end of message");    
            return (response, message);
        }
    }

}

