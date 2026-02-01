     	const mongoose = require('mongoose');
     	
     	const QuestionOptionSchema = new mongoose.Schema({
     	  id: String,
     	  label: String,
     	  value: String,
     	});
     	
     	const QuestionSchema = new mongoose.Schema({
    	  id: { type: String, required: true },
    	  type: { 
    	    type: String, 
          required: true,
    	    enum: ['short_text', 'long_text', 'multiple_choice', 'checkbox', 'dropdown', 'rating', 'date', 'email', 'number', 'file_upload']
    	  },
    	  title: { type: String, required: true },
    	  description: String,
    	  required: { type: Boolean, default: false },
    	  options: [QuestionOptionSchema],
    	  placeholder: String,
    	  maxLength: Number,
    	  minRating: Number,
    	  maxRating: Number,
    	  allowMultiple: Boolean,
    	  acceptFileTypes: String,
    	  maxFileSize: Number,
    	});
    	
    	const FormThemeSchema = new mongoose.Schema({
    	  primaryColor: { type: String, default: '#7c3aed' },
    	  backgroundColor: { type: String, default: '#ffffff' },
    	  fontFamily: { type: String, default: 'Inter' },
    	});
    	
    	const FormSettingsSchema = new mongoose.Schema({
    	  allowMultipleResponses: { type: Boolean, default: false },
    	  requireLogin: { type: Boolean, default: false },
    	  showProgressBar: { type: Boolean, default: true },
    	  confirmationMessage: { type: String, default: 'Thank you for your response!' },
    	  redirectUrl: String,
    	  theme: FormThemeSchema,
    	});
    	
    	const FormSchema = new mongoose.Schema({
    	  title: { type: String, required: true, default: 'Untitled Form' },
    	  description: { type: String, default: '' },
    	  createdAt: { type: Date, default: Date.now },
    	  updatedAt: { type: Date, default: Date.now },
    	  questions: [QuestionSchema],
    	  settings: FormSettingsSchema,
    	  isPublished: { type: Boolean, default: false },
    	  responseCount: { type: Number, default: 0 },
    	});
    	
    	FormSchema.pre('save', function(next) {
    	  this.updatedAt = Date.now();
    	  next();
    	});
    	
    	module.exports = mongoose.model('Form', FormSchema);
    
