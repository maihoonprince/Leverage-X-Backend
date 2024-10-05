// index.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/authRoutes.js');
const plansRouter = require('./Routes/plansRouter');
const stockRoutes = require('./Routes/stockRoutes.js');
const userRoutes = require('./Routes/userRoutes.js');
const watchList1Routes = require('./Routes/watchList1Routes.js');
const watchList2Routes = require('./Routes/watchList2Routes.js');
const pnlRoute = require('./Routes/pnlRoute.js');

require('dotenv').config();
require('./Models/db'); // Ensure database connection
const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Route Definitions
app.use('/auth', AuthRouter);
app.use('/api/plans', plansRouter);
app.use('/api/stocks', stockRoutes);
app.use('/api/users', userRoutes); // Route for user-related actions like balance, stocks
app.use('/api/watchlist1', watchList1Routes);
app.use('/api/watchlist2', watchList2Routes);
app.use('/api', pnlRoute);

// Server start frontend
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
