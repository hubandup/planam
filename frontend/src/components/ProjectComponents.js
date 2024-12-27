import React, { useState } from 'react';
import { X, Edit, Trash, Grid, Table } from 'lucide-react';

// Composant ProjectForm
export const ProjectForm = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    clientName: '',
    projectName: '',
    type: 'Brochure',
    status: 'En attente',
    steps: {
      crea: { date: '', status: 'pending' },
      template: { date: '', status: 'pending' },
      r0: { date: '', status: 'pending' },
      r1: { date: '', status: 'pending' },
      r2: { date: '', status: 'pending' },
      bat: { date: '', status: 'pending' },
      cf: { date: '', status: 'pending' },
      impression: { date: '', status: 'pending' },
      livraison: { date: '', status: 'pending' }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate the form data before submitting
    const isValid = formData.clientName.trim() && formData.projectName.trim();
    if (isValid) {
      onSubmit(formData);
    } else {
      // Optional: Add error handling or validation feedback
      alert('Veuillez remplir tous les champs obligatoires');
    }
  };

  const handleStepChange = (step, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [step]: {
          ...prev.steps[step],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {initialData ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="clientName" className="block text-gray-700 text-sm font-bold mb-2">
                Client
              </label>
              <input
                id="clientName"
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="w-full p-2 border rounded"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="projectName" className="block text-gray-700 text-sm font-bold mb-2">
                Nom du projet
              </label>
              <input
                id="projectName"
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                className="w-full p-2 border rounded"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="projectType" className="block text-gray-700 text-sm font-bold mb-2">
                Type
              </label>
              <select
                id="projectType"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="Brochure">Brochure</option>
                <option value="Flyer">Flyer</option>
                <option value="Catalogue">Catalogue</option>
              </select>
            </div>

            <div>
              <label htmlFor="projectStatus" className="block text-gray-700 text-sm font-bold mb-2">
                Statut
              </label>
              <select
                id="projectStatus"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4">Étapes</h3>
          <div className="space-y-4">
            {Object.entries(formData.steps).map(([step, data]) => (
              <div key={step} className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    htmlFor={`date-${step}`} 
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Date {step.toUpperCase()}
                  </label>
                  <input
                    id={`date-${step}`}
                    type="date"
                    value={data.date}
                    onChange={(e) => handleStepChange(step, 'date', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label 
                    htmlFor={`status-${step}`} 
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Statut {step.toUpperCase()}
                  </label>
                  <select
                    id={`status-${step}`}
                    value={data.status}
                    onChange={(e) => handleStepChange(step, 'status', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="pending">En attente</option>
                    <option value="in-progress">En cours</option>
                    <option value="completed">Terminé</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {initialData ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant GridView
export const GridView = ({ projects, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map(project => (
        <div key={project._id} className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{project.projectName}</h3>
              <p className="text-gray-600">{project.clientName}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(project)}
                className="text-blue-500 hover:text-blue-700"
                aria-label="Modifier le projet"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(project._id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Supprimer le projet"
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(project.steps).map(([step, data]) => (
              <div key={step} className="flex justify-between items-center">
                <span className="text-sm font-medium">{step.toUpperCase()}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {data.date ? new Date(data.date).toLocaleDateString('fr-FR') : '-'}
                  </span>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(data.status)}`}
                  >
                    {data.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant TableView
export const TableView = ({ projects, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-50 text-left">Client</th>
            <th className="py-2 px-4 bg-gray-50 text-left">Projet</th>
            <th className="py-2 px-4 bg-gray-50 text-left">Type</th>
            <th className="py-2 px-4 bg-gray-50 text-left">Statut</th>
            <th className="py-2 px-4 bg-gray-50 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project._id} className="border-t">
              <td className="py-2 px-4">{project.clientName}</td>
              <td className="py-2 px-4">{project.projectName}</td>
              <td className="py-2 px-4">{project.type}</td>
              <td className="py-2 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </td>
              <td className="py-2 px-4 text-right">
                <button
                  onClick={() => onEdit(project)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  aria-label="Modifier le projet"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(project._id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Supprimer le projet"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};