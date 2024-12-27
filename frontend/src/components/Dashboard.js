// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Printer, FileText, Check, Truck, Search, 
  Plus, Bell, X, Table, Grid, ArrowUpDown, LogOut 
} from 'lucide-react';
import ProjectForm from './ProjectForm';
import GridView from './GridView';
import TableView from './TableView';
import { api } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [editingProject, setEditingProject] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateRange: 'all'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get('/projects');
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des projets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await api.post('/projects', projectData);
      setProjects([...projects, newProject]);
      setShowForm(false);
    } catch (err) {
      setError('Erreur lors de la création: ' + err.message);
    }
  };

  const handleUpdateStatus = async (projectId, step, newStatus) => {
    try {
      const updatedProject = await api.patch(`/projects/${projectId}`, {
        [`steps.${step}.status`]: newStatus
      });
      setProjects(projects.map(p => 
        p._id === updatedProject._id ? updatedProject : p
      ));
    } catch (err) {
      setError('Erreur lors de la mise à jour: ' + err.message);
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      const updatedProject = await api.patch(`/projects/${projectData._id}`, projectData);
      setProjects(projects.map(p => 
        p._id === updatedProject._id ? updatedProject : p
      ));
      setEditingProject(null);
    } catch (err) {
      setError('Erreur lors de la modification: ' + err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      setError('Erreur lors de la suppression: ' + err.message);
    }
  };

  const handleReorderProjects = (draggedId, targetId) => {
    const reorderedProjects = [...projects];
    const draggedIndex = projects.findIndex(p => p._id === draggedId);
    const targetIndex = projects.findIndex(p => p._id === targetId);
    
    const [draggedProject] = reorderedProjects.splice(draggedIndex, 1);
    reorderedProjects.splice(targetIndex, 0, draggedProject);
    
    setProjects(reorderedProjects);
  };

  const filteredProjects = projects.filter(project => {
    const searchMatch = !filters.search || 
      project.projectName.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.clientName.toLowerCase().includes(filters.search.toLowerCase());
      
    const typeMatch = !filters.type || project.type === filters.type;
    const statusMatch = !filters.status || project.status === filters.status;
    
    return searchMatch && typeMatch && statusMatch;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="PlanAM" className="h-8 w-auto" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">PlanAM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user.firstName} {user.lastName}
              </span>
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <div className="flex border rounded-lg bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                <Table className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">Tous les types</option>
              <option value="Brochure">Brochure</option>
              <option value="Flyer">Flyer</option>
              <option value="Catalogue">Catalogue</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {viewMode === 'grid' ? (
          <GridView
            projects={filteredProjects}
            onUpdateStatus={handleUpdateStatus}
            onReorder={handleReorderProjects}
            onEdit={setEditingProject}
            onDelete={handleDeleteProject}
          />
        ) : (
          <TableView
            projects={filteredProjects}
            onUpdateStatus={handleUpdateStatus}
            onEdit={setEditingProject}
            onDelete={handleDeleteProject}
          />
        )}

        {(showForm || editingProject) && (
          <ProjectForm
            onClose={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
            onSubmit={editingProject ? handleEditProject : handleCreateProject}
            initialData={editingProject}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;