import dotenv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import chalk from 'chalk';
import boxen from 'boxen';
import { typeDefs, resolvers } from './data/schema';

import { isDev } from './helpers';

// To able to use environment variables
dotenv.config();

// Define the server and GraphQL type definitions and resolvers
const server = new ApolloServer({ typeDefs, resolvers });

// Define the app
const app = express();
// Define the port
const port = process.env.PORT || 4000;

// Healthcheck of the server. You can use this endpoint
// to check whether your server is up or not.
app.use('/healthcheck', (req, res) => res.sendStatus(200));

// Allow request from any origin. Avoids CORS issues when using the `--host` flag.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Accept');
  next();
});

// Apply middleware
server.applyMiddleware({ app });

// Info box options
const boxOptions = {
  padding: 1,
  margin: 1,
  borderStyle: 'round',
  borderColor: 'gray',
};

// Listening message definition
const listenMessage = (p = port) =>
  chalk.gray(
    `
  🚀 GraphQL server is ready. Type rs + enter
  at any time to restart the server

  ${chalk.blue.bold('Healthcheck')} → ${chalk.blue(`http://localhost:${p}/healthcheck`)}

  ${chalk.blue.bold('GraphQL')} → ${chalk.blue(`http://localhost:${p}${server.graphqlPath}`)} 
`,
  );
// Listen the server on specified port and print some informations
app.listen({ port }, () => console.log(boxen(listenMessage(), boxOptions)));

/**
  Catch and handle any error occurring in the server process
*/
let newPort = port;

process.on('uncaughtException', (error) => {
  if (error.errno === 'EADDRINUSE') {
    newPort += 1;
    const message = `
  Cannot bind to the port ${error.port}.
    
  ${chalk.green(`New port is ${newPort}`)}

    ${listenMessage(newPort)}
    `;

    app.listen(newPort);

    console.log(boxen(chalk.red(message), boxOptions));
  } else {
    console.log('Some error occurred', error);
  }
});
