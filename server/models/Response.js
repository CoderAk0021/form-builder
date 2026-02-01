     	const mongoose = require('mongoose');
     	
     	const AnswerSchema = new mongoose.Schema({
     	  questionId: { type: String, required: true },
     	  value: mongoose.Schema.Types.Mixed,
     	});
     	
     	const RespondentSchema = new mongoose.Schema({
     	  name: String,
    	  email: String,
    	});
    	
    	const ResponseSchema = new mongoose.Schema({
    	  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
    	  submittedAt: { type: Date, default: Date.now },
   	  answers: [AnswerSchema],
    	  respondent: RespondentSchema,
   	});
    	
    	module.exports = mongoose.model('Response', ResponseSchema);
    
