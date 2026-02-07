const express = require("express");
const router = express.Router();
const Form = require("../models/Form");
const Response = require("../models/Response");
const { verifyGoogleToken } = require("../utils/googleAuth.ts");

// Get all forms
router.get("/", async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single form
router.get("/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new form
router.post("/", async (req, res) => {
  try {
    const form = new Form(req.body);
    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a form
router.put("/:id", async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a form
router.delete("/:id", async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    // Also delete all responses for this form
    await Response.deleteMany({ formId: req.params.id });
    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get responses for a form
router.get("/:id/responses", async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.id }).sort({
      submittedAt: -1,
    });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Submit a response
router.post("/:id/responses", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    let verifiedEmail = null;
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    if (!form.isPublished) {
      return res.status(403).json({ message: "Form is not published" });
    }
    if (!req.body.googleToken)
      return res.status(200).json({ message: "Google Sign In Required" });
    
    verifiedEmail = await verifyGoogleToken(req.body.googleToken);

    const exists = await Response.findOne({
      formId: req.params.id,
      respondentEmail: verifiedEmail,
    });

    if (exists && !form.settings.allowMultipleResponses) {
      return res
        .status(409)
        .json({ message: "You have already submitted this form." });
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

router.get("/:id/check-status", async (req, res) => {
  try {
    const email = req.query.email;
    const formID = req.params.id;

    const response = await Response.find({
      formId: formID,
      respondentEmail: email,
    });
    if (!response.length) {
      return res.json({ submitted: false });
    }
    return res.json({ submitted: true });
  } catch (error) {}
});

module.exports = router;
