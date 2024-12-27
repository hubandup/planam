import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, X, Trash, Edit2, AlertCircle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'production'
  });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  // Réinitialiser les messages après 3 secondes
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.users.getAll();
      setUsers(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs : ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault(); // Empêche le rechargement de la page
  e.stopPropagation(); // Empêche de remonter l'événement au parent
  setLoading(true);
  setError('');

  try {
    if (editingUser) {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      await api.users.update(editingUser._id, updateData);
      setSuccessMessage('Utilisateur modifié avec succès');
    } else {
      if (!formData.password) throw new Error('Le mot de passe est requis pour un nouvel utilisateur');
      await api.users.create(formData);
      setSuccessMessage('Utilisateur créé avec succès');
    }
    await loadUsers();
    resetForm();
  } catch (err) {
    setError('Erreur : ' + (err.message || 'Une erreur est survenue'));
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    setLoading(true);
    try {
      await api.users.delete(userId);
      setSuccessMessage('Utilisateur supprimé avec succès');
      await loadUsers();
    } catch (err) {
      setError('Erreur lors de la suppression : ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'production',
      password: ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setShowForm(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'production'
    });
    setError('');
  };

  const roles = {
    production: 'Production',
    commerce: 'Commerce',
    admin: 'Administrateur'
  };

  if (loading && !users.length) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      {error && (
        <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!editingUser}
                  disabled={loading}
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  {Object.entries(roles).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Chargement...' : editingUser ? 'Modifier' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left">Nom</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Rôle</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{roles[user.role]}</td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    disabled={loading}
                    aria-label="Modifier"
                  >
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    disabled={loading}
                    aria-label="Supprimer"
                  >
                    <Trash className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;