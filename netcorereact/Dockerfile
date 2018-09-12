FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.sln .
COPY netcorereact/*.csproj ./netcorereact/
RUN dotnet restore

# copy everything else and build app
COPY netcorereact/. ./netcorereact/
WORKDIR /app/netcorereact
RUN dotnet publish -c Release -o out


FROM microsoft/dotnet:2.1-aspnetcore-runtime AS runtime
WORKDIR /app
COPY --from=build /app/netcorereact/out ./
ENTRYPOINT ["dotnet", "netcorereact.dll"]
