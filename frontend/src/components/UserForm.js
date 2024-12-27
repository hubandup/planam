import React, { useState } from 'react';
import { X } from 'lucide-react';

const UserForm = ({ onClose, onSubmit, editingUser }) => {
  const [userData, setUserData] = useState(
    editingUser || {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'production',
    }
  );
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userData.email || !userData.firstName || !userData.lastName) {
      setError('Tous les champs obligatoires doivent être remplis.');
      return;
    }
    setError('');
    onSubmit(userData);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-labelledby="user-form-title"
      aria-describedby="user-form-description"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 id="user-form-title" className="text-xl font-bold">
            {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fermer le formulaire"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              className="w-full p-2 border rounded"
              value={userData.firstName}
              onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              className="w-full p-2 border rounded"
              value={userData.lastName}
              onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border rounded"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              required
            />
          </div>

          {!editingUser && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-2 border rounded"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              Rôle
            </label>
            <select
              id="role"
              className="w-full p-2 border rounded"
              value={userData.role}
              onChange={(e) => setUserData({ ...userData, role: e.target.value })}
              required
            >
              <option value="production">Production</option>
              <option value="commerce">Commerce</option>
              <option value="administrateur">Administrateur</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              aria-label="Annuler la création ou modification de l'utilisateur"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              aria-label={editingUser ? 'Modifier utilisateur' : 'Créer utilisateur'}
            >
              {editingUser ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;