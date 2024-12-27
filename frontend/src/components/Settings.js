import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download } from 'lucide-react';

const STAGES = {
  CREA: 'Création',
  TEMPLATE: 'Template',
  R0: 'R0',
  R1: 'R1',
  R2: 'R2',
  BAT: 'BAT',
  CF: 'CF',
  IMPRESSION: 'Impression',
  LIVRAISON: 'Livraison',
};

const DEFAULT_COLORS = {
  CREA: '#FF4444',
  TEMPLATE: '#FF8C00',
  R0: '#FFD700',
  R1: '#32CD32',
  R2: '#20B2AA',
  BAT: '#4169E1',
  CF: '#8A2BE2',
  IMPRESSION: '#FF1493',
  LIVRAISON: '#2F4F4F',
};

const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
      isActive
        ? 'bg-white text-blue-600 border-t border-x border-gray-200'
        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

const Settings = ({
  onSubmit,
  initialSettings = {},
  projects = [],
  users = [],
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState('calculs');
  const [settings, setSettings] = useState({
    executionRate: initialSettings?.executionRate || 8,
    creationRate: initialSettings?.creationRate || 2,
    stageColors: {
      ...DEFAULT_COLORS,
      ...initialSettings?.stageColors,
    },
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialSettings?.stageColors) {
      setSettings((prev) => ({
        ...prev,
        stageColors: { ...DEFAULT_COLORS, ...initialSettings.stageColors },
      }));
    }
  }, [initialSettings]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getProjectStatus = (project) => {
    if (!project?.steps) return 'CREA';

    for (const [stage, { date }] of Object.entries(project.steps).reverse()) {
      if (date && new Date(date) <= new Date()) {
        return stage.toUpperCase();
      }
    }
    return 'CREA';
  };

  const getStepStatus = (project, step) => {
    if (!project?.steps?.[step]?.date) return '-';
    return new Date(project.steps[step].date) <= new Date() ? '✓' : 'En attente';
  };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (onSubmit) {
        try {
          console.log('Envoi des paramètres:', settings); // Log des données envoyées
          onSubmit(settings);
          setSuccessMessage('Paramètres sauvegardés avec succès');
          setError('');
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
          console.error('Erreur sauvegarde:', err); // Log des erreurs
          setError('Erreur lors de la sauvegarde des paramètres');
          setSuccessMessage('');
        }
      }
    };

  const createPDFDoc = () => {
    const doc = new jsPDF();
    doc.setProperties({
      title: 'Rapport de projets',
      subject: 'Export des projets',
      creator: currentUser?.name || 'Utilisateur',
    });
    return doc;
  };

  const addProjectToDoc = (doc, project, startNewPage = false) => {
    if (startNewPage) doc.addPage();

    let y = 20;

    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text(`Projet : ${project.projectName}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text(`Pages : ${project.pageCount || 0}`, 20, y);
    doc.text(`Statut : ${getProjectStatus(project)}`, 120, y);
    y += 10;

    const tableData = Object.entries(STAGES).map(([key]) => [
      STAGES[key],
      formatDate(project.steps?.[key.toLowerCase()]?.date),
      getStepStatus(project, key.toLowerCase()),
    ]);

    doc.autoTable({
      startY: y + 5,
      head: [['Étape', 'Date prévue', 'Statut']],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { halign: 'center' },
      },
    });

    return doc;
  };

  const addPageNumbers = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128);
      doc.text(
        `Page ${i}/${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' },
      );
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
        20,
        doc.internal.pageSize.getHeight() - 10,
      );
    }
  };

  const handleExportProject = (project) => {
    const doc = createPDFDoc();
    addProjectToDoc(doc, project);
    addPageNumbers(doc);
    doc.save(`projet-${project.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  const handleExportAllProjects = () => {
    if (!projects.length) {
      alert('Aucun projet à exporter');
      return;
    }

    const doc = createPDFDoc();
    projects.forEach((project, index) => {
      addProjectToDoc(doc, project, index > 0);
    });
    addPageNumbers(doc);
    doc.save('tous-les-projets.pdf');
  };

  const CalculsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Paramètres de calcul</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {['executionRate', 'creationRate'].map((rate) => (
          <div key={rate}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {rate === 'executionRate' ? "Taux d'exécution" : 'Taux de création'} (pages/jour)
            </label>
            <input
              type="number"
              min="1"
              step="0.5"
              value={settings[rate]}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  [rate]: Number(e.target.value),
                })
              }
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const DesignTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Couleurs des étapes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(STAGES).map(([key, label]) => (
          <div key={key} className="bg-gray-50 p-3 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.stageColors[key]}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    stageColors: {
                      ...settings.stageColors,
                      [key]: e.target.value,
                    },
                  })
                }
                className="h-8 w-16 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{settings.stageColors[key]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ExportTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Export des projets</h3>

      <button
        onClick={handleExportAllProjects}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
      >
        <Download className="w-5 h-5 mr-2" />
        Exporter tous les projets en PDF
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-700">Export individuel</h4>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {projects.length ? (
            projects.map((project) => (
              <div
                key={project._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <span className="text-sm text-gray-700">{project.projectName}</span>
                <button
                  onClick={() => handleExportProject(project)}
                  className="bg-gray-100 text-gray-700 py-1 px-3 rounded hover:bg-gray-200 transition-colors duration-200 flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">Aucun projet disponible</div>
          )}
        </div>
      </div>
    </div>
  );

return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Réglages</h2>

        {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
      
      <div className="flex space-x-2 mb-4">
        <TabButton isActive={activeTab === 'calculs'} onClick={() => setActiveTab('calculs')}>
          Calculs
        </TabButton>
        <TabButton isActive={activeTab === 'design'} onClick={() => setActiveTab('design')}>
          Design
        </TabButton>
        {currentUser?.role === 'admin' && (
          <TabButton isActive={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            Utilisateurs
          </TabButton>
        )}
        <TabButton isActive={activeTab === 'export'} onClick={() => setActiveTab('export')}>
          Export
        </TabButton>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200">
        {activeTab === 'calculs' && <CalculsTab />}
        {activeTab === 'design' && <DesignTab />}
        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <UserManagement
            users={users}
            onCreateUser={onCreateUser}
            onUpdateUser={onUpdateUser}
            onDeleteUser={onDeleteUser}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'export' && <ExportTab />}

        {(activeTab === 'calculs' || activeTab === 'design') && (
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors duration-200"
            >
              Sauvegarder
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;