const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Response = require('../models/Response');
const { verifyGoogleToken } = require('../utils/googleAuth.ts');

// Get all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single form
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new form
router.post('/', async (req, res) => {
  try {
    const form = new Form(req.body);
    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a form
router.put('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a form
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    // Also delete all responses for this form
    await Response.deleteMany({ formId: req.params.id });
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get responses for a form
router.get('/:id/responses', async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.id })
      .sort({ submittedAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Submit a response
router.post('/:id/responses', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    let verifiedEmail = null;
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    if (!form.isPublished) {
      return res.status(403).json({ message: 'Form is not published' });
    }
    if (form.settings.limitOneResponse) {
 
      if (!req.body.googleToken) {
        return res.status(401).json({ message: 'Google Sign-In is required.' });
      }
              
        verifiedEmail = await verifyGoogleToken(req.body.googleToken);
      
      const exists = await Response.findOne({ formId: req.params.id, respondentEmail: verifiedEmail });
      if (exists) {
        return res.status(409).json({ message: 'You have already submitted this form.' });
      }
    }

    const response = new Response({
      formId: req.params.id,
      answers: req.body.answers,
      respondentEmail: verifiedEmail,
    });

    await response.save();

    // Increment response count
    form.responseCount += 1;
    await form.save();

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// router.post('/:id/responses', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { answers, googleToken } = req.body; // <--- Expect Token, not just Email

//     const form = await Form.findById(id);
//     if (!form) return res.status(404).json({ message: 'Form not found' });

//     let verifiedEmail = null;

//     // === SECURE VERIFICATION CHECK ===
//     if (form.settings.limitOneResponse) {
      
//       if (!googleToken) {
//         return res.status(401).json({ message: 'Google Sign-In is required.' });
//       }

//       // 1. Verify token with Google (Secure Step)
//       verifiedEmail = await verifyGoogleToken(googleToken);

//       if (!verifiedEmail) {
//         return res.status(403).json({ message: 'Invalid or expired Google token.' });
//       }

//       // 2. Database Duplicate Check
//       const existingResponse = await Response.findOne({
//         formId: id,
//         respondentEmail: verifiedEmail
//       });

//       if (existingResponse) {
//         return res.status(409).json({ message: 'You have already submitted this form.' });
//       }
//     }
//     // ================================

//     // Prepare answers
//     const formattedAnswers = Object.entries(answers).map(([key, value]) => ({
//       questionId: key,
//       value
//     }));

//     // Save Response
//     const newResponse = new Response({
//       formId: id,
//       respondentEmail: verifiedEmail, // We store the email we extracted from the secure token
//       answers: formattedAnswers
//     });

//     await newResponse.save();
    
//     // Update counts
//     form.responseCount = (form.responseCount || 0) + 1;
//     await form.save();

//     res.status(201).json({ message: 'Response submitted successfully' });

//   } catch (error) {
//     console.error('Submission Error:', error);
//     res.status(500).json({ message: 'Failed to submit response' });
//   }
// });

module.exports = router;
