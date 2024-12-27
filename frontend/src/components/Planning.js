import React, { useState, useEffect } from 'react';

const Planning = ({ projects, settings }) => {
  const [timelineDates, setTimelineDates] = useState([]);
  const [rows, setRows] = useState([]);

  // Génération des dates de la timeline
  useEffect(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Commencer au lundi de la semaine actuelle
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + 1); // 1 = Lundi

    // Générer les dates pour 2 mois
    for (let i = 0; i < 60; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      // Ne garder que les jours de semaine (lundi-vendredi)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    setTimelineDates(dates);
  }, []);

  // Obtenir la date la plus proche dans la timeline
  const getNearestTimelineDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return timelineDates.reduce((prev, curr) => {
      return Math.abs(curr - targetDate) < Math.abs(prev - targetDate) ? curr : prev;
    });
  };

  // Calculer la position horizontale d'un projet
  const calculatePosition = (date) => {
    const timelineDate = getNearestTimelineDate(date);
    const dayWidth = 150; // Largeur d'un jour en pixels
    const index = timelineDates.findIndex(d => d.getTime() === timelineDate.getTime());
    return index * dayWidth;
  };

  // Calculer la largeur d'un projet
  const calculateWidth = (startDate, endDate) => {
    const start = getNearestTimelineDate(startDate);
    const end = getNearestTimelineDate(endDate);
    const dayWidth = 150;
    const days = (end - start) / (1000 * 60 * 60 * 24);
    return Math.max(days * dayWidth, 200); // Minimum 200px de largeur
  };

  // Fonction pour formater la date
  const formatDate = (date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Obtenir l'étape actuelle du projet
    const getCurrentStage = (project) => {
      const stages = [
        { name: 'LIVRAISON', date: project.steps.livraison?.date },
        { name: 'IMPRESSION', date: project.steps.impression?.date },
        { name: 'CF', date: project.steps.cf?.date },
        { name: 'BAT', date: project.steps.bat?.date },
        { name: 'R2', date: project.steps.r2?.date },
        { name: 'R1', date: project.steps.r1?.date },
        { name: 'R0', date: project.steps.r0?.date },
        { name: 'TEMPLATE', date: project.steps.template?.date },
        { name: 'CREA', date: project.steps.crea?.date }
      ];

      const now = new Date();
      for (const stage of stages) {
        if (stage.date && new Date(stage.date) >= now) {
          return stage.name;
        }
      }
      return 'CREA';
    };

  // Organiser les projets en lignes
  useEffect(() => {
    if (!projects || !timelineDates.length) return;

    const newRows = [];
    projects.forEach((project) => {
  const projectDates = [
    project.steps?.crea?.date,
    project.steps?.template?.date,
    project.steps?.r0?.date,
    project.steps?.r1?.date,
    project.steps?.r2?.date,
    project.steps?.bat?.date,
    project.steps?.cf?.date,
    project.steps?.impression?.date,
    project.steps?.livraison?.date
  ]
    .filter(Boolean)
    .map((date) => new Date(date));

  if (projectDates.length === 0 || isNaN(new Date(projectDates[0]).getTime())) {
    return; // Ignorer les projets invalides
  }
// trouver la première et dernière date du projet
    const startDate = new Date(Math.min(...projectDates));
    const endDate = new Date(Math.max(...projectDates));

      // Trouver une ligne disponible
      let rowIndex = 0;
      let placed = false;
      
      while (!placed) {
        if (!newRows[rowIndex]) {
          newRows[rowIndex] = [{ ...project, startDate, endDate }];
          placed = true;
        } else {
          const canPlace = newRows[rowIndex].every(existingProject => {
            const existingStart = existingProject.startDate;
            const existingEnd = existingProject.endDate;
            return startDate > existingEnd || endDate < existingStart;
          });

          if (canPlace) {
            newRows[rowIndex].push({ ...project, startDate, endDate });
            placed = true;
          } else {
            rowIndex++;
          }
        }
      }
    });

    setRows(newRows);
  }, [projects, timelineDates]);

  if (!timelineDates.length || !projects || !settings) {
    return <div className="p-6">Chargement du planning...</div>;
  }

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Planning</h2>
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <div className="min-w-full">
          {/* Timeline header */}
          <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
            {timelineDates.map((date, index) => {
              const isToday = date.getTime() === new Date().setHours(0, 0, 0, 0);
              return (
                <div
                  key={date.getTime()}
                  className={`flex-none w-[150px] p-2 text-center border-r border-gray-200 ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-gray-600">
                    {formatDate(date)}
                  </div>
                  {isToday && (
                    <div className="text-xs text-blue-600 font-medium">
                      Aujourd'hui
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Projects rows */}
          <div className="relative">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="relative h-[100px] border-b border-gray-200"
              >
                {row.map(project => {
                  const currentStage = getCurrentStage(project);
                  const backgroundColor = settings.stageColors[currentStage];
                  const left = calculatePosition(project.startDate);
                  const width = calculateWidth(project.startDate, project.endDate);

                  return (
                    <div
                      key={project._id}
                      className="absolute rounded-lg shadow-lg p-3 text-white overflow-hidden hover:opacity-90 transition-opacity"
                      style={{
                        left: `${left}px`,
                        width: `${width}px`,
                        top: '10px',
                        height: '80px',
                        backgroundColor,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <h4 className="text-sm font-bold truncate">
                        {project.projectName}
                      </h4>
                      <p className="text-xs mt-1">
                        Étape : {currentStage}
                      </p>
                      <p className="text-xs mt-1">
                        {project.startDate.toLocaleDateString()} → {project.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;