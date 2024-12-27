import mongoose from 'mongoose';
import Project from './models/Project.js'; // Assurez-vous que le chemin vers votre modèle est correct

const runCleanup = async () => {
  try {
    // Connectez-vous à MongoDB
    await mongoose.connect('mongodb://localhost:27017/votreNomDeBaseDeDonnées', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Supprimez le champ 'comments' de tous les documents
    const result = await Project.updateMany({}, { $unset: { comments: 1 } });
    console.log('Documents mis à jour :', result.modifiedCount);

    // Fermez la connexion
    await mongoose.disconnect();
  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données :', error);
  }
};

runCleanup();