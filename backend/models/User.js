import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Définir le schéma de l'utilisateur avec des validations détaillées
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: props => `${props.value} n'est pas un email valide`
    }
  },
  password: {
    type: String,
    required: [true, 'Mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit faire au moins 2 caractères']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'production'],
      message: '{VALUE} n\'est pas un rôle valide'
    },
    default: 'production'
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: '{VALUE} n\'est pas un statut valide'
    },
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
userSchema.index({ email: 1 }, { unique: true });

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  // Vérifie si le mot de passe a été modifié
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe de manière asynchrone
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // S'assurer que le password est chargé
    if (!this.password) {
      const user = await this.constructor.findById(this._id).select('+password');
      return await bcrypt.compare(candidatePassword, user.password);
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison des mots de passe');
  }
};

// Méthode pour obtenir le prénom
userSchema.virtual('firstName').get(function() {
  return this.name.split(' ')[0];
});

// Nettoyer tous les modèles existants avant de créer un nouveau
mongoose.models = {};

// Créer et exporter le modèle
const User = mongoose.model('User', userSchema);

export default User;