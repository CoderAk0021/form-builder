import Form from "../models/Form.js";
import Response from "../models/Response.js";
import sanitize from "mongo-sanitize";
import { verifyGoogleToken } from "../utils/googleAuth.js";
import { getMailStatus, sendSubmissionReceipt } from "../utils/mailer.js";
import { isValidObjectId,getAutoCloseReason, syncFormPublicationState, getClosedMessage } from "../utils/form.utilities.js";



export async function handleGetAllForms(req, res) {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });

    const formIds = forms.map((form) => form._id);
    const responseCounts = await Response.aggregate([
      { $match: { formId: { $in: formIds } } },
      { $group: { _id: "$formId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      responseCounts.map((item) => [String(item._id), Number(item.count) || 0]),
    );

    const countSyncOps = [];
    forms.forEach((form) => {
      const actualCount = countMap.get(String(form._id)) || 0;
      if (Number(form.responseCount || 0) !== actualCount) {
        countSyncOps.push({
          updateOne: {
            filter: { _id: form._id },
            update: { $set: { responseCount: actualCount } },
          },
        });
      }
      form.responseCount = actualCount;
    });

    if (countSyncOps.length > 0) {
      await Form.bulkWrite(countSyncOps);
    }

    await Promise.all(forms.map((form) => syncFormPublicationState(form)));
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function handleGetPublicForm(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid form id" });
    }

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    await syncFormPublicationState(form);
    if (!form.isPublished) {
      const reason = getAutoCloseReason(form);
      return res.status(403).json({ message: getClosedMessage(form, reason) });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function handleGetSingleForm(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid form id" });
    }

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    await syncFormPublicationState(form);
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function handleCreateNewForm(req, res) {
  try {
    const cleanBody = sanitize(req.body);
    const form = new Form(cleanBody);
    const savedForm = await form.save();
    await syncFormPublicationState(savedForm);
    res.status(201).json(savedForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleUpdateForm(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid form id" });
    }

    const cleanBody = sanitize(req.body);
    const form = await Form.findByIdAndUpdate(req.params.id, cleanBody, {
      new: true,
      runValidators: true,
    });
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    await syncFormPublicationState(form);
    res.json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleDeleteForm(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid form id" });
    }

    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    await Response.deleteMany({ formId: req.params.id });
    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function handleGetResponseForAForm(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid form id" });
    }

    const responses = await Response.find({ formId: req.params.id }).sort({
      submittedAt: -1,
    });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function handleSubmitAResponse(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid form id" });
    }

    const form = await Form.findById(req.params.id);
    let verifiedEmail = null;
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    await syncFormPublicationState(form);
    if (!form.isPublished) {
      const reason = getAutoCloseReason(form);
      return res.status(403).json({ message: getClosedMessage(form, reason) });
    }
    if (!req.body.googleToken) {
      return res.status(401).json({ message: "Google Sign In Required" });
    }

    verifiedEmail = await verifyGoogleToken(req.body.googleToken);
    if (!verifiedEmail) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    if (!Array.isArray(req.body.answers)) {
      return res.status(400).json({ message: "Answers must be an array" });
    }

    const exists = await Response.findOne({
      formId: req.params.id,
      respondentEmail: String(verifiedEmail).trim().toLowerCase(),
    });

    if (exists && !form.settings.allowMultipleResponses) {
      return res
        .status(409)
        .json({ message: "You have already submitted this form." });
    }

    const response = new Response({
      formId: req.params.id,
      answers: sanitize(req.body.answers),
      respondentEmail: String(verifiedEmail).trim().toLowerCase(),
    });

    await response.save();
    await Form.updateOne(
      { _id: form._id },
      { $inc: { responseCount: 1 } },
    );

    const refreshedForm = await Form.findById(form._id);
    if (refreshedForm) {
      await syncFormPublicationState(refreshedForm);
      form.responseCount = refreshedForm.responseCount;
      form.isPublished = refreshedForm.isPublished;
    }

    const emailSettings = form.settings?.emailNotification;
    const shouldSendReceipt = Boolean(
      emailSettings?.enabled &&
        verifiedEmail &&
        typeof verifiedEmail === "string" &&
        verifiedEmail.trim(),
    );

    if (shouldSendReceipt) {
      try {
        const receiptResult = await sendSubmissionReceipt({
          to: String(verifiedEmail).trim().toLowerCase(),
          formTitle: form.title,
          submittedAt: response.submittedAt,
          subjectTemplate: emailSettings?.subject,
          messageTemplate: emailSettings?.message,
        });
        if (!receiptResult?.sent) {
          console.warn(
            `Submission receipt skipped for form ${String(form._id)}: ${receiptResult?.reason || "unknown_reason"}`,
          );
        }
      } catch (mailError) {
        console.error("Failed to send submission receipt:", mailError?.message || mailError);
      }
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function handleCheckStatus(req, res) {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid form id" });
    }

    const form = await Form.findById(req.params.id).select(
      "isPublished responseCount settings.responseDeadlineAt settings.maxResponses",
    );
    await syncFormPublicationState(form);
    if (!form || !form.isPublished) {
      return res.json({ submitted: false });
    }

    const cleanQuery = sanitize(req.query);
    const email = String(cleanQuery.email || "").trim().toLowerCase();
    const formID = String(req.params.id);
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const response = await Response.findOne({
      formId: formID,
      respondentEmail: email,
    });
    return res.json({ submitted: !!response });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
}

export async function handleGetMailStatus(req, res) {
  try {
    return res.json(getMailStatus());
  } catch (error) {
    return res.status(500).json({ message: "Failed to read mail configuration status" });
  }
}


