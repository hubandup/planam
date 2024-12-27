// models/Settings.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  executionRate: {
    type: Number,
    default: 8
  },
  creationRate: {
    type: Number,
    default: 2
  },
  stageColors: {
    type: Map,
    of: String,
    default: {
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
  }
}, {
  timestamps: true
});

if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;