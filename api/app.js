import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes.js';
import adminRoutes from './adminroutes.js';
import storeRoutes from './storeroutes.js';
import updateRoutes from './updatestoreroutes.js';
import menuRoutes from './menuroutes.js';
import pubStoreRoutes from './pubstoreroutes.js';
import kitchenRoutes from './kitchenroutes.js';
import checkEmailRoutes from './checkEmailRoutes.js';
import orderSeqRoutes from './orderseqroutes.js';
import connectToDatabase from './db/connection.js';


// Load environment variables
dotenv.config();

// Create the Express app.
const app = express();

// Connect to MongoDB
connectToDatabase();

// Enable All CORS Requests
app.use(cors());

// Setup request body JSON parsing.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup morgan which gives us HTTP request logging.
app.use(morgan('dev'));

// Setup a friendly greeting for the root route.
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API Authentication with Express project!',
  });
});

// Add routes.
app.use('/api', routes);
app.use('/admin', adminRoutes); // Include admin routes
app.use('/menu', menuRoutes); // Include menu routes
app.use('/api', storeRoutes); // Include store routes
app.use('/api', updateRoutes); // Include store routes
app.use('/api', pubStoreRoutes); // Cart Pub view routes
app.use('/api', kitchenRoutes); // Kitchen view routes
app.use('/api', checkEmailRoutes); // Include store routes
app.use('/api', orderSeqRoutes); // Include store routes


// Handle 404 errors for unknown routes.
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// Global error handler.
app.use((err, req, res, next) => {
  console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Set the port.
const port = process.env.PORT || 5000;

// Start listening on the port.
app.listen(port, () => {
  console.log(`Express server is listening on port ${port}`);
});
