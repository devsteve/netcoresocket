FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /app


# set up node
ENV NODE_VERSION 10.5.0
ENV NODE_DOWNLOAD_SHA 5d77d2c68c06404028f063dca0947315570ff5e52e46f67f93ef9f6cdcb1b4a8
RUN curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" --output nodejs.tar.gz \
&& echo "$NODE_DOWNLOAD_SHA nodejs.tar.gz" | sha256sum -c - \
&& tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 \
&& rm nodejs.tar.gz \
&& ln -s /usr/local/bin/node /usr/local/bin/nodejs

# copy csproj and restore as distinct layers
COPY *.sln .
COPY netcore-isuzu/*.csproj ./netcore-isuzu/
RUN dotnet restore

# copy everything else and build app
COPY netcore-isuzu/. ./netcore-isuzu/
WORKDIR /app/netcore-isuzu
RUN dotnet publish -c Release -o out


FROM microsoft/dotnet:2.1-aspnetcore-runtime AS runtime
WORKDIR /app
COPY --from=build /app/netcore-isuzu/out ./
ENTRYPOINT ["dotnet", "netcore-isuzu.dll"]

CMD ASPNETCORE_URLS=http://*:$PORT dotnet netcore-isuzu.dll
