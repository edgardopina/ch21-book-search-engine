const express = require('express');
const path = require('path');

const { ApolloServer } = require('apollo-server-express'); //* import Apollo server
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');

//! const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

//* create a new Apollo server and pass in the schema data
const startServer = async () => {
   const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: authMiddleware,
   });
   await server.start(); //* START the Apollo server
   server.applyMiddleware({ app });
   //* log where the GQL API can be tested
   console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

startServer(); //* INITIALIZE the Apollo server

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//* if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
   app.use(express.static(path.join(__dirname, '../client/build')));
}

//! app.use(routes);

//* create a wildcard GET route for the server. If we make a GET request to any location on the server that doesn't
//* have an explicit route defined, respond with the production-ready React frontend code.
app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
db.once('open', () => {
   app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
   });
});
