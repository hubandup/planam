import React from 'react';

const GridView = ({ projects = [], onEdit, onDelete }) => {
  console.log('Projets dans GridView:', projects); // Debug

  const getDateStyle = (date) => {
    if (!date) return 'text-gray-500';
    const currentDate = new Date();
    const stepDate = new Date(date);
    const timeDiff = currentDate - stepDate;
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;

    if (timeDiff > twoWeeks) {
      return 'text-gray-500'; // Grisé après deux semaines
    }
    if (timeDiff > 0) {
      return 'text-red-500'; // Rouge si dépassé
    }
    return 'text-gray-800'; // Normal sinon
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project, index) => {
        if (!project || typeof project !== 'object' || !project.steps) {
          return (
            <div key={index} className="bg-red-100 rounded-lg shadow-lg p-4">
              <p className="text-red-500">Erreur : données du projet invalides.</p>
            </div>
          );
        }

        return (
          <div key={project._id || index} className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {project.projectName || 'Nom non spécifié'}
                </h3>
                <p className="text-gray-600">{project.clientName || 'Client inconnu'}</p>
                <p className="text-sm text-gray-500">
                  Pages : {typeof project.pageCount === 'number' ? project.pageCount : 'N/A'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(project)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(project._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(project.steps || {}).map(([step, data]) => (
                <div key={step} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{step.toUpperCase()}</span>
                  <span className={`text-sm ${getDateStyle(data?.date)}`}>
                    {data?.date ? new Date(data.date).toLocaleDateString() : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GridView;