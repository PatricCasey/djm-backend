const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const usersRoutes = require('./routes/users.routes');
const callRoutes = require('./routes/call.routes');
const paymentRoutes = require('./routes/payment.routes');
const incomeRoutes = require('./routes/income.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/income', incomeRoutes);

app.use(errorHandler);

module.exports = app;
