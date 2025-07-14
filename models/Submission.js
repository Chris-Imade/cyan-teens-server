const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formType: {
    type: String,
    required: true,
  },
  formData: {
    type: Object,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Submission', submissionSchema);
