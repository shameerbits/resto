const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const menuRoutes = require('./routes/menuRoutes');
const { errorResponse } = require('./utils/apiResponse');

const app = express();

app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api', menuRoutes);

app.use((req, res) => {
  return errorResponse(res, 'Route not found', 404);
});

app.use((err, req, res, next) => {
  console.error(err);
  return errorResponse(res, 'Internal server error', 500);
});

module.exports = app;
