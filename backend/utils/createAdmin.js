import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { fileURLToPath } from 'url';

dotenv.config();

const createAdmin = async () => {
  try {
    // Vérification si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      // Création d'un nouvel admin en utilisant le modèle User
      const adminData = {
        email: 'admin@planam.fr',
        password: 'admin123', // Le middleware pre-save s'occupera du hashage
        name: 'Administrateur',
        role: 'admin',
        status: 'active'
      };

      // Utiliser le modèle User pour créer l'admin
      const admin = new User(adminData);
      await admin.save(); // Ceci déclenchera le middleware pre-save

      console.log('Administrateur créé avec succès');
    } else {
      console.log('Un administrateur existe déjà.');
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error.message);
  }
};

// Pour l'exécution directe du script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => createAdmin())
    .then(() => mongoose.connection.close())
    .catch(console.error);
}

export { createAdmin as createInitialAdmin };