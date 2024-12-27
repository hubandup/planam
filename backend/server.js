// backend/server.js
import User from './models/User.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import authRoutes from './routes/auth.js';
import { createInitialAdmin } from './utils/createAdmin.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import settingsRoutes from './routes/settings.js';

// Configuration des variables d'environnement
dotenv.config();

// Configuration ES Modules dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/planam';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware de sécurité et de parsing
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? ['https://planam.fr'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.disable('x-powered-by');

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/settings', settingsRoutes);

// Servir les fichiers statiques de React
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Middleware de gestion des erreurs pour les routes API
app.use('/api', (err, req, res, next) => {
  console.error('Erreur serveur:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path
  });
  const statusCode = err.status || 500;
  res.status(statusCode).json({ 
    message: 'Une erreur est survenue',
    ...(NODE_ENV === 'development' && { 
      details: err.message,
      stack: err.stack 
    })
  });
});

// Route catch-all pour React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Fonction de connexion à MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true
    });
    
    console.log('🔗 Connexion à MongoDB réussie');
    
    // Création de l'admin initial
    await createInitialAdmin();
    
    // Démarrage du serveur
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
        🚀 Serveur démarré
        📍 Port: ${PORT}
        📁 Environnement: ${NODE_ENV}
        🗃️ Base de données: Connectée
      `);
    });
  } catch (err) {
    console.error('❌ Échec de connexion à MongoDB:', err);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse non gérée:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Exception non capturée:', error);
  process.exit(1);
});

// Connexion à la base de données
connectToDatabase();

export default app;