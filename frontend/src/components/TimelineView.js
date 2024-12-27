// src/components/TimelineView.js
import React from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const TimelineView = ({ projects, onEdit, onDelete }) => {
  // Créer un tableau de 60 jours (2 mois)
  const today = new Date();
  const days = Array.from({ length: 60 }, (_, i) => addDays(today, i));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* En-tête avec les dates */}
      <div className="flex border-b mb-4 overflow-x-auto">
        <div className="w-48 flex-shrink-0">Projet</div>
        {days.map((day, index) => (
          <div 
            key={index}
            className="flex-shrink-0 w-8 text-center text-xs"
            style={{
              backgroundColor: day.getDay() === 0 || day.getDay() === 6 
                ? '#f3f4f6' 
                : 'transparent'
            }}
          >
            {format(day, 'dd', { locale: fr })}
            <div className="text-gray-500">
              {format(day, 'MMM', { locale: fr })}
            </div>
          </div>
        ))}
      </div>

      {/* Projets */}
      {projects.map(project => (
        <div key={project._id} className="flex border-b py-2 overflow-x-auto">
          <div className="w-48 flex-shrink-0">
            <div className="font-medium">{project.projectName}</div>
            <div className="text-sm text-gray-500">{project.clientName}</div>
          </div>
          <div className="flex flex-grow relative">
            {Object.entries(project.steps).map(([step, data]) => {
              if (!data.date) return null;
              const date = new Date(data.date);
              const dayIndex = Math.floor((date - today) / (1000 * 60 * 60 * 24));
              if (dayIndex < 0 || dayIndex > 59) return null;

              return (
                <div
                  key={step}
                  className={`absolute px-2 py-1 text-xs rounded ${
                    data.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : data.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  style={{
                    left: `${(dayIndex * 32)}px`,
                    top: '0',
                  }}
                  title={`${step}: ${format(date, 'dd/MM/yyyy')}`}
                >
                  {step}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;