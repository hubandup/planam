import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_temporaire';

export const auth = async (req, res, next) => {
  try {
    // Vérification de l'existence du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant ou format invalide' });
    }

    const token = authHeader.split(' ')[1];
    
    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Récupération de l'utilisateur
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Compte inactif' });
    }

    // Ajout des informations utilisateur à la requête
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
    }
    next();
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification des droits' });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentification requise' });
      }
      
      // Permet de passer soit un rôle unique soit un tableau de rôles
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Accès refusé - Rôle insuffisant',
          required: allowedRoles,
          current: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('Erreur vérification rôle:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la vérification des droits' });
    }
  };
};

// Nouvelle fonction utilitaire pour les endpoints qui nécessitent plusieurs rôles
export const checkRoles = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentification requise' });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Accès refusé - Rôle insuffisant',
          required: roles,
          current: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('Erreur vérification rôles:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la vérification des droits' });
    }
  };
};