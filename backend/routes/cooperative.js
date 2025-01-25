const express = require('express');
const router = express.Router();
const Cooperative = require('../models/Cooperative');

router.post('/', async (req, res) => {
  const { name, description, address, contributionFee, dueDate } = req.body;

  try {
    const cooperative = new Cooperative({
      name,
      description,
      address,
      contributionFee,
      dueDate,
    });
    await cooperative.save();

    res.status(201).json({ message: 'Cooperative created successfully', cooperative });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit a cooperative
router.put('/:cooperativeId', async (req, res) => {
  const { cooperativeId } = req.params;
  const { name, description, address, contributionFee, dueDate } = req.body;

  try {
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }

    if (name) cooperative.name = name;
    if (description) cooperative.description = description;
    if (address) cooperative.address = address;
    if (contributionFee) cooperative.contributionFee = contributionFee;
    if (dueDate) cooperative.dueDate = dueDate;

    await cooperative.save();

    res.status(200).json({ message: 'Cooperative updated successfully', cooperative });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a cooperative
router.delete('/:cooperativeId', async (req, res) => {
  const { cooperativeId } = req.params;

  try {
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }

    await cooperative.remove();

    res.status(200).json({ message: 'Cooperative deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a member to a cooperative
router.post('/:cooperativeId/members', async (req, res) => {
  const { cooperativeId } = req.params;
  const { userId } = req.body;

  try {
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }

    await cooperative.addMember(userId);
    res.status(200).json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove a member from a cooperative
router.delete('/:cooperativeId/members', async (req, res) => {
  const { cooperativeId } = req.params;
  const { userId } = req.body;

  try {
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }

    await cooperative.removeMember(userId);
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:cooperativeId/loans", async (req, res) => {
  const { cooperativeId } = req.params;
  const { userId, walletId, amount, description } = req.body;

  try {
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    await cooperative.requestLoan(userId, walletId, amount, description);

    res.status(200).json({ message: "Loan request submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve a loan
router.post("/:cooperativeId/loans/:loanId/approve", async (req, res) => {
  const { cooperativeId, loanId } = req.params;

  try {
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    await cooperative.approveLoan(loanId);

    res.status(200).json({ message: "Loan approved and is now in PROCESS" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject a loan
router.post("/:cooperativeId/loans/:loanId/reject", async (req, res) => {
  const { cooperativeId, loanId } = req.params;

  try {
    const cooperative = await Cooperative.findById(cooperativeId);
    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    await cooperative.rejectLoan(loanId);

    res.status(200).json({ message: "Loan rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all loans
router.get("/:cooperativeId/loans", async (req, res) => {
  const { cooperativeId } = req.params;

  try {
    const cooperative = await Cooperative.findById(cooperativeId).populate("loans.userId loans.walletId");
    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    res.status(200).json(cooperative.loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/:userId/cooperatives', async (req, res) => {
  const { userId } = req.params;

  try {
    const cooperatives = await Cooperative.find({ members: userId });
    res.status(200).json(cooperatives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
