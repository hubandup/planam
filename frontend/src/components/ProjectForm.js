import React, { useState, useEffect } from "react";

const DEFAULT_STEPS = {
  crea: { date: "" },
  template: { date: "" },
  r0: { date: "" },
  r1: { date: "" },
  r2: { date: "" },
  bat: { date: "" },
  cf: { date: "" },
  impression: { date: "" },
  livraison: { date: "" },
};

const formatDateForInput = (date) => {
  if (!date) return "";
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ProjectForm = ({ onSubmit, onClose, initialData }) => {
  const [projectData, setProjectData] = useState(() => ({
    projectName: initialData?.projectName || "",
    clientName: initialData?.clientName || "",
    pageCount: initialData?.pageCount || 0,
    steps: { ...DEFAULT_STEPS, ...(initialData?.steps || {}) },
    _id: initialData?._id || null,
  }));

  useEffect(() => {
    if (initialData) {
      setProjectData({
        projectName: initialData.projectName || "",
        clientName: initialData.clientName || "",
        pageCount: initialData.pageCount || 0,
        steps: {
          ...DEFAULT_STEPS,
          ...(initialData.steps || {}),
        },
        _id: initialData._id || null,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: name === "pageCount" ? Number(value) : value,
    }));
  };

  const handleStepChange = (step, value) => {
    setProjectData((prev) => ({
      ...prev,
      steps: {
        ...prev.steps,
        [step]: { date: value },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(projectData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md overflow-auto max-h-[90vh]">
        <h2 className="text-xl mb-4">{initialData ? "Modifier" : "Nouveau"} Projet</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du projet</label>
            <input
              type="text"
              name="projectName"
              value={projectData.projectName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nom du client</label>
            <input
              type="text"
              name="clientName"
              value={projectData.clientName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de pages</label>
            <input
              type="number"
              name="pageCount"
              value={projectData.pageCount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Étapes</h3>
            {Object.keys(DEFAULT_STEPS).map((step) => (
              <div key={step} className="flex items-center gap-2 mb-2">
                <span className="text-sm w-24">{step.toUpperCase()}</span>
                <input
                  type="date"
                  value={formatDateForInput(projectData.steps[step]?.date)}
                  onChange={(e) => handleStepChange(step, e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {initialData ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;