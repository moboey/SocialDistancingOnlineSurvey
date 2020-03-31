# Online Survey

This application hosts an online survey on the effectiveness of Social Distancing to present the spread of Coronavirus disease.
The application consists of a client front end developed in React framework and a Backend developed using serverless framework, with infrastructure defined for AWS and DynamoDB used as persistent storage

# Backend code structure
The request from API gateway is processed by codes in the src/lambda folder. Business logic codes are placed in the src/businesslogic folder. Persistence logic is stored in the src/datalayer folder. Models can be found in the src/model folder.
Infrastructure configurations can be found in the serverless.yml file. 

# Deploying the application
## Backend

Please ensure you have aws sdk, serverless framework installed on your development environment. 
To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless Online Survey application.
 