// backend/init-user.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/planam');
    console.log('Connecté à MongoDB');

    // Définition du schéma utilisateur
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      role: String
    });

    // Création du modèle
    const User = mongoose.model('User', userSchema);

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'admin@planam.com' });
    if (existingUser) {
      console.log('Suppression de l\'utilisateur existant');
      await User.deleteOne({ email: 'admin@planam.com' });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    console.log('Mot de passe hashé créé');

    // Création du nouvel utilisateur
    const newUser = new User({
      email: 'admin@planam.com',
      password: hashedPassword,
      name: 'Administrateur',
      role: 'admin'
    });

    // Sauvegarde de l'utilisateur
    await newUser.save();
    console.log('Nouvel utilisateur créé avec succès');
    console.log('Email:', newUser.email);
    console.log('Role:', newUser.role);

    // Vérification
    const savedUser = await User.findOne({ email: 'admin@planam.com' });
    if (savedUser) {
      console.log('Utilisateur vérifié dans la base de données');
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    // Fermeture de la connexion
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
  }
}

createAdmin();