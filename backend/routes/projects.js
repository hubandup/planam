import express from 'express';
import Project from '../models/Project.js';
import { auth, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.patch('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    const updateData = {
      projectName: req.body.projectName,
      clientName: req.body.clientName,
      pageCount: req.body.pageCount
    };

    // Mise à jour des dates d'étapes si fournies
    if (req.body.steps) {
      Object.keys(req.body.steps).forEach(step => {
        if (project.steps[step] && req.body.steps[step].date) {
          updateData[`steps.${step}.date`] = req.body.steps[step].date;
        }
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('createdBy', 'name email');

    res.json(updatedProject);
  } catch (error) {
    console.error('Erreur mise à jour:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 Requête liste projets:', req.query);

    const match = {};
    const sort = {};

    if (req.query.pageCount) match.pageCount = Number(req.query.pageCount);
    if (req.query.type) match.type = req.query.type;
    if (req.query.search) {
      match.$or = [
        { projectName: { $regex: req.query.search, $options: 'i' } },
        { clientName: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const projects = await Project.find(match)
      .sort(sort)
      .populate('createdBy', 'name email')
      .lean();

    console.log('📊 Projets trouvés:', projects.length);
    res.json(projects);

  } catch (error) {
    console.error('❌ Erreur récupération:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 Création projet:', req.body);

    const projectData = {
      ...req.body,
      pageCount: req.body.pageCount || 0,
      createdBy: req.user._id,
      steps: {
        crea: { status: 'Non démarré', date: null },
        template: { status: 'Non démarré', date: null },
        r0: { status: 'Non démarré', date: null },
        r1: { status: 'Non démarré', date: null },
        r2: { status: 'Non démarré', date: null },
        bat: { status: 'Non démarré', date: null },
        cf: { status: 'Non démarré', date: null },
        impression: { status: 'Non démarré', date: null },
        livraison: { status: 'Non démarré', date: null }
      }
    };

    const project = new Project(projectData);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email');

    console.log('✅ Projet créé:', populatedProject);
    res.status(201).json(populatedProject);

  } catch (error) {
    console.error('❌ Erreur création:', error);
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    console.log('🗑️ Projet supprimé:', project._id);
    res.json({ message: 'Projet supprimé avec succès' });

  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;