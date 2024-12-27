// routes/settings.js
import express from 'express';
import Settings from '../models/Settings.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 GET Settings - Token:', req.headers.authorization ? 'Présent' : 'Absent');
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        executionRate: 8,
        creationRate: 2,
        stageColors: {
          CREA: '#FF4444',
          TEMPLATE: '#FF8C00',
          R0: '#FFD700',
          R1: '#32CD32',
          R2: '#20B2AA',
          BAT: '#4169E1',
          CF: '#8A2BE2',
          IMPRESSION: '#FF1493',
          LIVRAISON: '#2F4F4F'
        }
      });
    }
    console.log('✅ Settings trouvés:', settings);
    res.json(settings);
  } catch (error) {
    console.error('❌ Erreur GET settings:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    console.log('📝 PUT Settings - Body:', req.body);
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.executionRate = req.body.executionRate;
    settings.creationRate = req.body.creationRate;
    settings.stageColors = req.body.stageColors;

    await settings.save();
    console.log('✅ Settings mis à jour:', settings);
    res.json(settings);
  } catch (error) {
    console.error('❌ Erreur PUT settings:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;