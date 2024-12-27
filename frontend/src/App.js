import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import logo from './img/logo.png';
import api from './services/api';
import Login from './components/Login';
import GridView from './components/GridView';
import TableView from './components/TableView';
import ProjectForm from './components/ProjectForm';
import Planning from './components/Planning';
import Settings from './components/Settings';
import {
  Menu,
  X,
  Plus,
  LayoutDashboard,
  LogOut,
  Grid,
  Table,
  Calendar,
  Settings as SettingsIcon,
} from 'lucide-react';

// Composant de mise en page principale
const Layout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center h-16 px-4">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <button onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center ml-auto">
            <span className="mr-4 text-gray-600">{user?.name}</span>
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out md:translate-x-0 md:static`}
        >
          <div className="flex justify-between items-center h-16 px-4 bg-gray-900">
            <span className="text-xl font-bold">PlanAM</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center w-full px-4 py-3 hover:bg-gray-700"
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Projets
            </button>
            <button
              onClick={() => navigate('/planning')}
              className="flex items-center w-full px-4 py-3 hover:bg-gray-700"
            >
              <Calendar className="h-5 w-5 mr-3" />
              Planning
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center w-full px-4 py-3 hover:bg-gray-700"
            >
              <SettingsIcon className="h-5 w-5 mr-3" />
              Réglages
            </button>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

const Dashboard = ({ projects, onEdit, onDelete, onNewProject, getDateStyle }) => {
  const [dashboardView, setDashboardView] = useState('grid');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setDashboardView('grid')}
            className={`px-3 py-2 rounded ${
              dashboardView === 'grid' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setDashboardView('table')}
            className={`px-3 py-2 rounded ${
              dashboardView === 'table' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            <Table className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowProjectForm(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Projet
        </button>
      </div>

      {dashboardView === 'grid' ? (
        <GridView
          projects={projects}
          onEdit={(project) => {
            setEditingProject(project);
            setShowProjectForm(true);
          }}
          onDelete={onDelete}
          getDateStyle={getDateStyle}
        />
      ) : (
        <TableView
          projects={projects}
          onEdit={(project) => {
            setEditingProject(project);
            setShowProjectForm(true);
          }}
          onDelete={onDelete}
          getDateStyle={getDateStyle}
        />
      )}

      {showProjectForm && (
        <ProjectForm
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
          onSubmit={editingProject ? onEdit : onNewProject}
          initialData={editingProject}
        />
      )}
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    executionRate: 8,
    creationRate: 2,
    stageColors: {}
  });

  const loadProjects = async () => {
    try {
      const data = await api.projects.getAll();
      setProjects(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des projets');
    }
  };

  // Charger les données initiales (user et settings)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Charger l'utilisateur depuis le localStorage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Charger les paramètres seulement si l'utilisateur est connecté
          const settingsData = await api.settings.get();
          console.log('Paramètres initiaux chargés:', settingsData);
          if (settingsData) {
            setSettings(settingsData);
            console.log('État settings mis à jour:', settingsData);
          }
        }
      } catch (err) {
        console.error('Erreur chargement initial:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Charger les projets quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setUsers([]);
    }
  }, [user]);

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await api.projects.create(projectData);
      setProjects((prev) => [...prev, newProject]);
      setError('');
    } catch (err) {
      setError('Erreur lors de la création du projet');
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      console.log('Données de mise à jour:', projectData);
      const updatedProject = await api.projects.update(projectData._id, projectData);
      setProjects(prev => prev.map(p => p._id === projectData._id ? updatedProject : p));
      setError('');
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      setError('Erreur lors de la modification du projet');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    try {
      await api.projects.delete(projectId);
      loadProjects();
    } catch (err) {
      setError('Erreur lors de la suppression du projet');
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setProjects([]);
    setUsers([]);
  };

  const handleSettingsUpdate = async (newSettings) => {
    try {
      console.log('Envoi mise à jour settings:', newSettings);
      const updatedSettings = await api.settings.update(newSettings);
      console.log('Réponse settings:', updatedSettings);
      
      setSettings(prevSettings => ({
        ...prevSettings,
        ...updatedSettings
      }));
      
      return updatedSettings;
    } catch (error) {
      console.error('Erreur mise à jour paramètres:', error);
      throw error;
    }
  };

  const getDateStyle = (date) => {
    if (!date) return 'text-gray-500';
    const parsedDate = new Date(date);
    const now = new Date();
    const twoWeeksAgo = new Date(now.setDate(now.getDate() - 14));

    return parsedDate < new Date()
      ? parsedDate > twoWeeksAgo
        ? 'text-red-500'
        : 'text-gray-500'
      : 'text-gray-700';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={(userData) => setUser(userData)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  projects={projects}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onNewProject={handleCreateProject}
                  getDateStyle={getDateStyle}
                />
              }
            />
            <Route 
              path="/planning" 
              element={<Planning projects={projects} settings={settings} />} 
            />
            <Route
              path="/settings"
              element={
                <Settings
                  onSubmit={handleSettingsUpdate}
                  initialSettings={settings}
                  projects={projects}
                  users={users}
                  currentUser={user}
                  onCreateUser={api.users.create}
                  onUpdateUser={api.users.update}
                  onDeleteUser={api.users.delete}
                />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </div>
  );
};

export default App;