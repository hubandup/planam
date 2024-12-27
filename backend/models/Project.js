import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  date: { type: Date },
  status: { 
    type: String,
    enum: ['Non démarré', 'En cours', 'Terminé', 'En pause'],
    default: 'Non démarré'
  }
});

const projectSchema = new mongoose.Schema({
  clientName: { 
    type: String, 
    required: true,
    trim: true
  },
  projectName: { 
    type: String, 
    required: true,
    trim: true 
  },
  type: { type: String },
  status: { 
    type: String, 
    default: 'En cours',
    enum: ['En cours', 'Terminé', 'En pause', 'Annulé']
  },
  pageCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  steps: {
    crea: stepSchema,
    template: stepSchema,
    r0: stepSchema,
    r1: stepSchema,
    r2: stepSchema,
    bat: stepSchema,
    cf: stepSchema,
    impression: stepSchema,
    livraison: stepSchema
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

const Project = mongoose.model('Project', projectSchema);

export default Project;