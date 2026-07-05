import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';



// Importar rutas usando path

import actorRoutes from './routes/actorRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import tallerRoutes from './routes/tallerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { verifyToken } from './middleware/auth.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.disable('x-powered-by');
app.use(cors({
  origin: ['https://eco-museo-api.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://historias-v2-api.vercel.app',
    'https://ecomuseomarioeddy.netlify.app',
  ], // Ensure this is the exact origin of your frontend
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true // This is the critical part
}));

app.options('*', cors());


// Configura el límite para las peticiones JSON
app.use(express.json({ limit: '5mb' })); // Asegúrate de que este límite sea suficiente

// Configura el límite para las peticiones URL-encoded (si las usas)
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/users', userRoutes);
app.use('/actors', verifyToken, actorRoutes);
app.use('/authors', verifyToken, authorRoutes);
app.use('/histories', verifyToken, historyRoutes);
app.use('/tallers', verifyToken, tallerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.name === 'AxiosError') {
    return res.status(500).json({
      success: false,
      error: 'Network error occurred',
      message: 'Please check the server connection'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    message: err.message || 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: err.message || 'Internal Server Error',
    message: err.message || 'Something went wrong!' 
  });
});
//solo para pruebas
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Export the app
export default app;