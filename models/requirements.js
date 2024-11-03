const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients'
    },
    professionalId: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    budget: {
        type: String,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    timeline: {
        type: String,
        required: true
    },
    offerStatus: {
        type: String,
        enum: ['pending', 'accepted','declined'],
        default: 'pending'
    }
});

const requirementModel = mongoose.model("requirements", schema);
module.exports = requirementModel;
