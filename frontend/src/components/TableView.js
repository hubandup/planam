// src/components/TableView.js
import React from 'react';

const TableView = ({ projects, onEdit, onDelete, getDateStyle }) => {
  console.log('Projets dans TableView:', projects); // Debug
  const stepNames = ['crea', 'template', 'r0', 'r1', 'r2', 'bat', 'cf', 'impression', 'livraison'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-50 text-left">Client</th>
            <th className="py-2 px-4 bg-gray-50 text-left">Projet</th>
            <th className="py-2 px-4 bg-gray-50 text-left">Nombre de pages</th>
            {stepNames.map((step) => (
              <th key={step} className="py-2 px-4 bg-gray-50 text-center">{step.toUpperCase()}</th>
            ))}
            <th className="py-2 px-4 bg-gray-50 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project._id} className="border-t">
              <td className="py-2 px-4">{project.clientName || 'N/A'}</td>
              <td className="py-2 px-4">{project.projectName || 'N/A'}</td>
              <td className="py-2 px-4">{typeof project.pageCount === 'number' ? project.pageCount : 'N/A'}</td>
              {stepNames.map((step) => (
                <td
                  key={step}
                  className={`py-2 px-4 text-center ${
                    project.steps?.[step]?.date ? getDateStyle(project.steps[step].date) : 'text-gray-500'
                  }`}
                >
                  {project.steps?.[step]?.date
                    ? new Date(project.steps[step].date).toLocaleDateString()
                    : '-'}
                </td>
              ))}
              <td className="py-2 px-4 text-right">
                <button
                  onClick={() => onEdit(project)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(project._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;