module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Inclure les fichiers React dans src/
    './public/index.html',        // Inclure le fichier HTML principal
  ],
  theme: {
    extend: {}, // Ajouter des personnalisations ici si nécessaire
  },
  plugins: [], // Ajouter des plugins Tailwind CSS si nécessaires
};