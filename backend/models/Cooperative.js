const mongoose = require("mongoose");

const cooperativeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  address: { type: String, required: true },
  contributionFee: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  memberCount: { type: Number, default: 0 },
  loans: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
      amount: { type: Number, required: true },
      status: { type: String, enum: ["PROCESS", "SUCCESS", "REJECTED"], default: "PROCESS" },
      description: { type: String },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

cooperativeSchema.methods.addMember = async function (userId) {
  if (this.members.includes(userId)) {
    throw new Error("User is already a member of this cooperative");
  }

  this.members.push(userId);
  this.memberCount = this.members.length;

  const User = mongoose.model("User");
  const user = await User.findById(userId);
  if (user) {
    if (!user.cooperativeGroups.includes(this._id)) {
      user.cooperativeGroups.push(this._id);
      await user.save();
    }
  }

  await this.save();
};

cooperativeSchema.methods.removeMember = async function (userId) {
  const memberIndex = this.members.indexOf(userId);
  if (memberIndex === -1) {
    throw new Error("User is not a member of this cooperative");
  }

  this.members.splice(memberIndex, 1);
  this.memberCount = this.members.length;

  const User = mongoose.model("User");
  const user = await User.findById(userId);
  if (user) {
    const coopIndex = user.cooperativeGroups.indexOf(this._id);
    if (coopIndex !== -1) {
      user.cooperativeGroups.splice(coopIndex, 1);
      await user.save();
    }
  }

  await this.save();
};

cooperativeSchema.methods.requestLoan = async function (userId, walletId, amount, description) {
  if (amount <= 0) {
    throw new Error("Loan amount must be greater than zero");
  }

  if (!this.members.includes(userId)) {
    throw new Error("User must be a member of the cooperative to request a loan");
  }

  this.loans.push({
    userId,
    walletId,
    amount,
    description,
    status: "PROCESS",
  });
  await this.save();
};

cooperativeSchema.methods.approveLoan = async function (loanId) {
  const loan = this.loans.id(loanId);
  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "PROCESS") {
    throw new Error("Loan is already processed");
  }

  loan.status = "PROCESS";
  loan.updatedAt = Date.now();

  setTimeout(async () => {
    loan.status = "SUCCESS";
    loan.updatedAt = Date.now();

    const Wallet = mongoose.model("Wallet");
    const wallet = await Wallet.findById(loan.walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    wallet.balance += loan.amount;
    await wallet.save();

    await this.save();
  }, 5000);

  await this.save();
};

cooperativeSchema.methods.rejectLoan = async function (loanId) {
  const loan = this.loans.id(loanId);
  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "PROCESS") {
    throw new Error("Loan is already processed");
  }

  loan.status = "REJECTED";
  loan.updatedAt = Date.now();
  await this.save();
};

module.exports = mongoose.model("Cooperative", cooperativeSchema);
