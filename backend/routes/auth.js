// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_temporaire';

// Route de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('👉 Tentative de connexion pour:', { email });
    
    // Validation des données d'entrée
    if (!email || !password) {
      console.log('❌ Données manquantes:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    
    // Recherche de l'utilisateur avec le mot de passe
    console.log('🔍 Recherche de l\'utilisateur dans la base de données...');
    const user = await User.findOne({ email }).select('+password');
    console.log('👤 Utilisateur trouvé:', !!user);
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour l\'email:', email);
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    // Vérification du mot de passe
    console.log('🔐 Vérification du mot de passe...');
    const isValidPassword = await user.comparePassword(password);
    console.log('🔑 Mot de passe valide:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Mot de passe invalide pour l\'utilisateur:', email);
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    // Vérification du statut de l'utilisateur
    console.log('📊 Vérification du statut utilisateur:', user.status);
    if (user.status !== 'active') {
      console.log('❌ Compte inactif pour l\'utilisateur:', email);
      return res.status(403).json({ message: 'Compte inactif' });
    }
    
    // Génération du token
    console.log('🎫 Génération du token JWT...');
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log('✅ Token généré avec succès');
    
    // Réponse sécurisée
    console.log('🚀 Envoi de la réponse de connexion réussie');
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Erreur détaillée de connexion:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    res.status(500).json({
      message: 'Erreur lors de la connexion',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
});

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Validation des données d'entrée
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    // Vérification de l'existence de l'utilisateur
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Création du nouvel utilisateur
    const user = new User({
      email,
      password, // Le middleware de hashage s'occupera du hachage
      name,
      role: role || 'production',
      status: 'active'
    });
    
    // Sauvegarde de l'utilisateur
    await user.save();
    
    // Génération du token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Réponse sécurisée
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'inscription',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Route de vérification du token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    
    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Recherche de l'utilisateur
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérification du statut de l'utilisateur
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Compte inactif' });
    }
    
    // Réponse sécurisée
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    
    console.error('Erreur de vérification:', error);
    res.status(500).json({
      message: 'Erreur lors de la vérification du token',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;