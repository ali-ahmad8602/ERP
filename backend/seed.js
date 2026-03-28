/**
 * Seed script for InvoiceMate ERP
 * Creates realistic data: users, departments, boards, cards, activities, notifications
 *
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User         = require('./models/User');
const Department   = require('./models/Department');
const Board        = require('./models/Board');
const Card         = require('./models/Card');
const Activity     = require('./models/Activity');
const Notification = require('./models/Notification');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Wipe existing data
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Board.deleteMany({}),
    Card.deleteMany({}),
    Activity.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ─── Users ──────────────────────────────────────────────────────────────────
  const hashedPw = await bcrypt.hash('Password1!', 12);

  const users = await User.insertMany([
    { name: 'Hamza Anjum',   email: 'hamza@invoicemate.com',  password: hashedPw, orgRole: 'super_admin' },
    { name: 'Sarah Chen',    email: 'sarah@invoicemate.com',  password: hashedPw, orgRole: 'org_admin' },
    { name: 'Marcus Webb',   email: 'marcus@invoicemate.com', password: hashedPw, orgRole: 'top_management' },
    { name: 'Priya Patel',   email: 'priya@invoicemate.com',  password: hashedPw, orgRole: 'user' },
    { name: 'James Liu',     email: 'james@invoicemate.com',  password: hashedPw, orgRole: 'user' },
    { name: 'Amina Okafor',  email: 'amina@invoicemate.com',  password: hashedPw, orgRole: 'user' },
    { name: 'Daniel Park',   email: 'daniel@invoicemate.com', password: hashedPw, orgRole: 'user' },
    { name: 'Riya Sharma',   email: 'riya@invoicemate.com',   password: hashedPw, orgRole: 'user' },
  ]);
  const [hamza, sarah, marcus, priya, james, amina, daniel, riya] = users;
  console.log(`Created ${users.length} users`);

  // ─── Departments ────────────────────────────────────────────────────────────
  const depts = await Department.insertMany([
    {
      name: 'Credit Operations', slug: 'credit-operations',
      description: 'Manages credit applications, risk scoring and facility disbursements',
      icon: '💳', color: '#0EA5E9',
      heads: [sarah._id], members: [sarah._id, priya._id, james._id, amina._id],
      order: 0,
    },
    {
      name: 'Invoice Processing', slug: 'invoice-processing',
      description: 'Handles inbound invoices from submission through verification to payment',
      icon: '📄', color: '#10B981',
      heads: [priya._id], members: [priya._id, daniel._id, riya._id],
      order: 1,
    },
    {
      name: 'Risk & Compliance', slug: 'risk-compliance',
      description: 'Enterprise risk management, regulatory audits and compliance tracking',
      icon: '🛡️', color: '#F59E0B',
      heads: [amina._id], members: [amina._id, marcus._id, james._id],
      order: 2,
    },
    {
      name: 'Treasury', slug: 'treasury',
      description: 'Cash management, fund transfers and liquidity planning',
      icon: '🏦', color: '#8B5CF6',
      heads: [daniel._id], members: [daniel._id, sarah._id],
      order: 3,
    },
    {
      name: 'Client Relations', slug: 'client-relations',
      description: 'Client onboarding, relationship management and retention',
      icon: '🤝', color: '#EC4899',
      heads: [riya._id], members: [riya._id, marcus._id, priya._id],
      order: 4,
    },
  ]);
  const [creditDept, invoiceDept, riskDept, treasuryDept, clientDept] = depts;
  console.log(`Created ${depts.length} departments`);

  // Update users with department memberships
  async function addDeptToUser(user, dept, role) {
    await User.findByIdAndUpdate(user._id, {
      $push: { departments: { department: dept._id, role } }
    });
  }
  await addDeptToUser(sarah,  creditDept,  'dept_head');
  await addDeptToUser(priya,  creditDept,  'member');
  await addDeptToUser(james,  creditDept,  'member');
  await addDeptToUser(amina,  creditDept,  'member');
  await addDeptToUser(priya,  invoiceDept, 'dept_head');
  await addDeptToUser(daniel, invoiceDept, 'member');
  await addDeptToUser(riya,   invoiceDept, 'member');
  await addDeptToUser(amina,  riskDept,    'dept_head');
  await addDeptToUser(marcus, riskDept,    'member');
  await addDeptToUser(james,  riskDept,    'member');
  await addDeptToUser(daniel, treasuryDept,'dept_head');
  await addDeptToUser(sarah,  treasuryDept,'member');
  await addDeptToUser(riya,   clientDept,  'dept_head');
  await addDeptToUser(marcus, clientDept,  'member');
  await addDeptToUser(priya,  clientDept,  'member');

  // ─── Boards ─────────────────────────────────────────────────────────────────
  function makeCols() {
    return [
      { name: 'Ideas',       order: 0, isDefault: true, color: '#6B7280' },
      { name: 'Backlog',     order: 1, isDefault: true, color: '#2A2A2A' },
      { name: 'In Progress', order: 2, isDefault: true, color: '#0EA5E9' },
      { name: 'In Review',   order: 3, isDefault: true, color: '#F59E0B' },
      { name: 'Done',        order: 4, isDefault: true, color: '#10B981' },
    ];
  }

  const boardDefs = [
    { name: 'Credit Review',       description: 'Track credit applications through the approval pipeline',     department: creditDept._id,  createdBy: sarah._id  },
    { name: 'Invoice Processing',  description: 'Manage incoming invoices from submission to payment',          department: invoiceDept._id, createdBy: priya._id  },
    { name: 'Loan Pipeline',       description: 'End-to-end loan application tracking and disbursement',        department: creditDept._id,  createdBy: sarah._id  },
    { name: 'Risk Assessment',     description: 'Evaluate and monitor risk profiles for active clients',        department: riskDept._id,    createdBy: amina._id  },
    { name: 'Client Onboarding',   description: 'New client setup, KYC verification and account activation',    department: clientDept._id,  createdBy: riya._id   },
    { name: 'Compliance Tracker',  description: 'Regulatory compliance tasks and audit preparation',            department: riskDept._id,    createdBy: amina._id  },
  ];

  const boards = [];
  for (const def of boardDefs) {
    const b = await Board.create({ ...def, columns: makeCols() });
    boards.push(b);
  }
  const [creditBoard, invoiceBoard, loanBoard, riskBoard, clientBoard, complianceBoard] = boards;
  console.log(`Created ${boards.length} boards`);

  // Give board_owner permissions
  async function addBoardPerm(user, board, role) {
    await User.findByIdAndUpdate(user._id, {
      $push: { boardPermissions: { board: board._id, role } }
    });
  }
  await addBoardPerm(sarah, creditBoard, 'board_owner');
  await addBoardPerm(sarah, loanBoard, 'board_owner');
  await addBoardPerm(priya, invoiceBoard, 'board_owner');
  await addBoardPerm(amina, riskBoard, 'board_owner');
  await addBoardPerm(amina, complianceBoard, 'board_owner');
  await addBoardPerm(riya,  clientBoard, 'board_owner');

  // ─── Cards ──────────────────────────────────────────────────────────────────
  function col(board, name) {
    return board.columns.find(c => c.name === name)?._id;
  }

  const now = new Date();
  function daysAgo(d) { return new Date(now - d * 86400000); }
  function daysFromNow(d) { return new Date(now.getTime() + d * 86400000); }

  const cardDefs = [
    // Credit Review board
    { title: 'Meridian Corp — $500K Credit Line', description: 'New credit line application. Requires full financial review and collateral assessment before committee approval.', board: creditBoard._id, column: col(creditBoard, 'Backlog'), assignees: [sarah._id], priority: 'high', dueDate: daysFromNow(5), labels: ['new-client'], createdBy: sarah._id, order: 0 },
    { title: 'Apex Holdings — Credit Increase', description: 'Request to increase existing credit facility from $200K to $350K. Client has strong 18-month payment history.', board: creditBoard._id, column: col(creditBoard, 'Backlog'), assignees: [marcus._id], priority: 'medium', dueDate: daysFromNow(7), labels: ['existing-client'], createdBy: marcus._id, order: 1 },
    { title: 'NovaFin LLC — Revolving Facility', description: 'Revolving credit facility application. Pending Q4 financial documentation from client.', board: creditBoard._id, column: col(creditBoard, 'Ideas'), assignees: [priya._id], priority: 'low', dueDate: daysFromNow(14), labels: [], createdBy: priya._id, order: 0 },
    { title: 'TechNova Inc — Trade Finance', description: 'Trade finance credit review. All documentation received. Analyst review in progress with risk team.', board: creditBoard._id, column: col(creditBoard, 'In Progress'), assignees: [james._id], priority: 'high', dueDate: daysFromNow(2), labels: ['trade-finance'], createdBy: james._id, order: 0 },
    { title: 'Global Trade Co — $1.2M Facility', description: 'Large facility request requiring committee approval. Preliminary risk score: B+.', board: creditBoard._id, column: col(creditBoard, 'In Review'), assignees: [amina._id], priority: 'urgent', dueDate: daysFromNow(1), labels: ['high-value', 'compliance'], isComplianceTagged: true, createdBy: amina._id, order: 0 },
    { title: 'Stellar Industries — Equipment Finance', description: 'Equipment financing approved. $750K at 4.2% over 36 months. Awaiting client signatures.', board: creditBoard._id, column: col(creditBoard, 'Done'), assignees: [daniel._id], priority: 'medium', dueDate: daysAgo(2), labels: ['equipment'], createdBy: daniel._id, order: 0 },
    { title: 'BluePeak Ventures — Working Capital', description: 'Working capital line approved for $300K. Standard terms. Client notified.', board: creditBoard._id, column: col(creditBoard, 'Done'), assignees: [sarah._id], priority: 'low', dueDate: daysAgo(5), labels: [], createdBy: sarah._id, order: 1 },
    { title: 'Pinnacle Group — Invoice Factoring', description: 'Invoice factoring fully disbursed. All documentation filed. Account active.', board: creditBoard._id, column: col(creditBoard, 'Done'), assignees: [priya._id], priority: 'medium', dueDate: daysAgo(8), labels: ['factoring'], createdBy: priya._id, order: 2 },

    // Invoice Processing board
    { title: 'Invoice #INV-2024-0847 — Meridian Corp', description: 'Quarterly invoice bundle for Meridian Corp. Amount: $245,000. Verification in progress.', board: invoiceBoard._id, column: col(invoiceBoard, 'In Review'), assignees: [priya._id], priority: 'high', dueDate: daysFromNow(3), labels: ['Q1-2026'], createdBy: priya._id, order: 0 },
    { title: 'Invoice #INV-2024-0846 — Apex Holdings', description: 'Monthly retainer invoice. Amount: $128,750. Awaiting manager approval.', board: invoiceBoard._id, column: col(invoiceBoard, 'In Progress'), assignees: [daniel._id], priority: 'medium', dueDate: daysFromNow(5), labels: [], createdBy: daniel._id, order: 0 },
    { title: 'Invoice #INV-2024-0845 — Stellar Industries', description: 'Equipment lease invoice bundle. Amount: $2,400,000. Compliance review required.', board: invoiceBoard._id, column: col(invoiceBoard, 'Backlog'), assignees: [riya._id], priority: 'urgent', dueDate: daysFromNow(1), labels: ['compliance'], isComplianceTagged: true, createdBy: riya._id, order: 0 },
    { title: 'Invoice #INV-2024-0844 — TechNova Inc', description: 'Technology services invoice. Amount: $87,300. Approved and scheduled for payment.', board: invoiceBoard._id, column: col(invoiceBoard, 'Done'), assignees: [priya._id], priority: 'low', dueDate: daysAgo(1), labels: [], createdBy: priya._id, order: 0 },
    { title: 'Invoice #INV-2024-0843 — NovaFin LLC', description: 'Rejected — missing supporting documentation. Returned to vendor.', board: invoiceBoard._id, column: col(invoiceBoard, 'Ideas'), assignees: [daniel._id], priority: 'medium', dueDate: daysAgo(2), labels: ['rejected'], createdBy: daniel._id, order: 0 },
    { title: 'Invoice #INV-2024-0842 — Global Trade Co', description: 'International trade invoice. Amount: $175,600. Currency conversion applied.', board: invoiceBoard._id, column: col(invoiceBoard, 'Done'), assignees: [riya._id], priority: 'medium', dueDate: daysAgo(3), labels: ['international'], createdBy: riya._id, order: 1 },

    // Loan Pipeline
    { title: 'Stellar Industries — $2.4M Facility', description: 'New loan application for manufacturing expansion. Due diligence underway.', board: loanBoard._id, column: col(loanBoard, 'In Progress'), assignees: [sarah._id, james._id], priority: 'high', dueDate: daysFromNow(10), labels: ['expansion'], createdBy: sarah._id, order: 0 },
    { title: 'BluePeak Ventures — Bridge Loan', description: 'Short-term bridge financing for acquisition. $800K over 12 months.', board: loanBoard._id, column: col(loanBoard, 'In Review'), assignees: [sarah._id], priority: 'urgent', dueDate: daysFromNow(3), labels: ['bridge'], createdBy: sarah._id, order: 0 },
    { title: 'Pinnacle Group — Term Loan Renewal', description: 'Annual renewal of $1.5M term loan. Existing client, clean track record.', board: loanBoard._id, column: col(loanBoard, 'Backlog'), assignees: [james._id], priority: 'medium', dueDate: daysFromNow(20), labels: ['renewal'], createdBy: james._id, order: 0 },
    { title: 'Acme Corp — Disbursement Complete', description: 'Loan disbursed. $600K working capital at 5.1% APR.', board: loanBoard._id, column: col(loanBoard, 'Done'), assignees: [sarah._id], priority: 'low', dueDate: daysAgo(4), labels: [], createdBy: sarah._id, order: 0 },

    // Risk Assessment
    { title: 'Q1 Portfolio Risk Review', description: 'Quarterly review of all active credit portfolios. Identify deteriorating accounts.', board: riskBoard._id, column: col(riskBoard, 'In Progress'), assignees: [amina._id, marcus._id], priority: 'high', dueDate: daysFromNow(7), labels: ['quarterly'], createdBy: amina._id, order: 0 },
    { title: 'Apex Holdings — Risk Score Update', description: 'Update risk profile after credit increase request. Current score: B+.', board: riskBoard._id, column: col(riskBoard, 'In Progress'), assignees: [james._id], priority: 'medium', dueDate: daysFromNow(4), labels: [], createdBy: amina._id, order: 1 },
    { title: 'AML Screening — New Clients (March)', description: 'Anti-money laundering screening for 12 new client applications this month.', board: riskBoard._id, column: col(riskBoard, 'Backlog'), assignees: [amina._id], priority: 'urgent', dueDate: daysFromNow(2), labels: ['AML', 'compliance'], isComplianceTagged: true, createdBy: amina._id, order: 0 },

    // Client Onboarding
    { title: 'Orion Dynamics — KYC Verification', description: 'New enterprise client. KYC documents submitted, verification in progress.', board: clientBoard._id, column: col(clientBoard, 'In Progress'), assignees: [riya._id], priority: 'high', dueDate: daysFromNow(3), labels: ['enterprise'], createdBy: riya._id, order: 0 },
    { title: 'Zenith Partners — Account Setup', description: 'Account creation and system access provisioning for new client.', board: clientBoard._id, column: col(clientBoard, 'Backlog'), assignees: [riya._id, priya._id], priority: 'medium', dueDate: daysFromNow(6), labels: [], createdBy: riya._id, order: 0 },
    { title: 'NovaStar Inc — Onboarding Complete', description: 'Client fully onboarded. All documents verified, accounts active.', board: clientBoard._id, column: col(clientBoard, 'Done'), assignees: [riya._id], priority: 'low', dueDate: daysAgo(3), labels: [], createdBy: riya._id, order: 0 },

    // Compliance Tracker
    { title: 'Annual Regulatory Filing — FCA', description: 'Prepare and submit annual regulatory filing to Financial Conduct Authority.', board: complianceBoard._id, column: col(complianceBoard, 'In Progress'), assignees: [amina._id], priority: 'urgent', dueDate: daysFromNow(5), labels: ['regulatory', 'FCA'], isComplianceTagged: true, createdBy: amina._id, order: 0 },
    { title: 'Internal Audit — Q1 2026', description: 'Internal compliance audit covering credit operations and invoice processing.', board: complianceBoard._id, column: col(complianceBoard, 'Backlog'), assignees: [amina._id, marcus._id], priority: 'high', dueDate: daysFromNow(15), labels: ['audit'], isComplianceTagged: true, createdBy: amina._id, order: 0 },
    { title: 'Data Privacy Review', description: 'Review data handling practices against GDPR requirements. Update privacy notices.', board: complianceBoard._id, column: col(complianceBoard, 'In Review'), assignees: [james._id], priority: 'medium', dueDate: daysFromNow(8), labels: ['GDPR'], isComplianceTagged: true, createdBy: james._id, order: 0 },
    { title: 'KYC Policy Update — Completed', description: 'Updated KYC policy documents approved by board. Distributed to all departments.', board: complianceBoard._id, column: col(complianceBoard, 'Done'), assignees: [amina._id], priority: 'medium', dueDate: daysAgo(6), labels: ['policy'], isComplianceTagged: true, createdBy: amina._id, order: 0 },
  ];

  const cards = await Card.insertMany(cardDefs);
  console.log(`Created ${cards.length} cards`);

  // ─── Activities ─────────────────────────────────────────────────────────────
  const activityDefs = [
    { user: sarah._id, action: 'card_approved', entityType: 'card', entityId: cards[5]._id, entityTitle: 'Stellar Industries — Equipment Finance', department: creditDept._id, board: creditBoard._id, detail: 'Approved $750K equipment financing facility', createdAt: daysAgo(0.5) },
    { user: marcus._id, action: 'card_moved', entityType: 'card', entityId: cards[4]._id, entityTitle: 'Global Trade Co — $1.2M Facility', department: creditDept._id, board: creditBoard._id, detail: 'Moved from In Progress to In Review', createdAt: daysAgo(0.7) },
    { user: priya._id, action: 'comment_added', entityType: 'card', entityId: cards[8]._id, entityTitle: 'Invoice #INV-2024-0847 — Meridian Corp', department: invoiceDept._id, board: invoiceBoard._id, detail: 'Added notes on payment verification status', createdAt: daysAgo(1) },
    { user: james._id, action: 'card_created', entityType: 'card', entityId: cards[14]._id, entityTitle: 'Stellar Industries — $2.4M Facility', department: creditDept._id, board: loanBoard._id, detail: 'Created new loan application card', createdAt: daysAgo(1.5) },
    { user: amina._id, action: 'card_rejected', entityType: 'card', entityId: cards[12]._id, entityTitle: 'Invoice #INV-2024-0843 — NovaFin LLC', department: invoiceDept._id, board: invoiceBoard._id, detail: 'Rejected due to missing supporting documentation', createdAt: daysAgo(2) },
    { user: daniel._id, action: 'member_added', entityType: 'department', entityId: clientDept._id, entityTitle: 'Client Relations', department: clientDept._id, detail: 'Added Riya Sharma as department member', createdAt: daysAgo(3) },
    { user: riya._id, action: 'board_created', entityType: 'board', entityId: clientBoard._id, entityTitle: 'Client Onboarding', department: clientDept._id, board: clientBoard._id, detail: 'Created Client Onboarding board', createdAt: daysAgo(4) },
    { user: sarah._id, action: 'card_moved', entityType: 'card', entityId: cards[6]._id, entityTitle: 'BluePeak Ventures — Working Capital', department: creditDept._id, board: creditBoard._id, detail: 'Moved to Done — approved $300K facility', createdAt: daysAgo(5) },
    { user: amina._id, action: 'card_created', entityType: 'card', entityId: cards[25]._id, entityTitle: 'Annual Regulatory Filing — FCA', department: riskDept._id, board: complianceBoard._id, detail: 'Created compliance task for FCA annual filing', createdAt: daysAgo(5.5) },
    { user: priya._id, action: 'card_approved', entityType: 'card', entityId: cards[11]._id, entityTitle: 'Invoice #INV-2024-0844 — TechNova Inc', department: invoiceDept._id, board: invoiceBoard._id, detail: 'Approved for payment — $87,300', createdAt: daysAgo(1.2) },
  ];

  await Activity.insertMany(activityDefs);
  console.log(`Created ${activityDefs.length} activities`);

  // ─── Notifications (for hamza, the super_admin) ─────────────────────────────
  const notifDefs = [
    { recipient: hamza._id, type: 'card_approved', title: 'Invoice Approved', message: 'Invoice #INV-2024-0847 has been approved by Sarah Chen', entityType: 'card', entityId: cards[5]._id, department: creditDept._id, sender: sarah._id, createdAt: daysAgo(0.01) },
    { recipient: hamza._id, type: 'card_moved', title: 'Card Moved to Review', message: 'Global Trade Co — $1.2M Facility moved to "In Review" column', entityType: 'card', entityId: cards[4]._id, department: creditDept._id, sender: marcus._id, createdAt: daysAgo(0.1) },
    { recipient: hamza._id, type: 'comment_added', title: 'New Comment', message: 'Priya Patel commented on "Invoice #INV-2024-0847 — Meridian Corp"', entityType: 'card', entityId: cards[8]._id, department: invoiceDept._id, sender: priya._id, createdAt: daysAgo(0.3) },
    { recipient: hamza._id, type: 'member_added', title: 'New Team Member', message: 'Riya Sharma has been added to Client Relations department', entityType: 'department', entityId: clientDept._id, department: clientDept._id, sender: daniel._id, isRead: true, createdAt: daysAgo(1) },
    { recipient: hamza._id, type: 'card_rejected', title: 'Invoice Rejected', message: 'Invoice #INV-2024-0843 was rejected — missing documentation', entityType: 'card', entityId: cards[12]._id, department: invoiceDept._id, sender: amina._id, isRead: true, createdAt: daysAgo(2) },
    { recipient: hamza._id, type: 'task_assigned', title: 'New Card Created', message: 'Stellar Industries — $2.4M Facility added to Loan Pipeline', entityType: 'card', entityId: cards[14]._id, department: creditDept._id, sender: james._id, isRead: true, createdAt: daysAgo(2.5) },
    { recipient: hamza._id, type: 'card_approved', title: 'Batch Approved', message: '12 invoices from Q3 batch processing approved', entityType: 'card', entityId: cards[11]._id, department: invoiceDept._id, sender: priya._id, isRead: true, createdAt: daysAgo(3) },
    { recipient: hamza._id, type: 'card_moved', title: 'Department Restructured', message: 'Risk Assessment board has been moved to Operations', entityType: 'board', entityId: riskBoard._id, department: riskDept._id, sender: amina._id, isRead: true, createdAt: daysAgo(5) },
    { recipient: hamza._id, type: 'comment_added', title: 'Mention in Comment', message: 'You were mentioned in a comment on "Global Trade Finance Review"', entityType: 'card', entityId: cards[4]._id, department: creditDept._id, sender: james._id, isRead: true, createdAt: daysAgo(6) },
    { recipient: hamza._id, type: 'approval_requested', title: 'Approval Requested', message: 'Annual Regulatory Filing — FCA requires your approval', entityType: 'card', entityId: cards[25]._id, department: riskDept._id, sender: amina._id, createdAt: daysAgo(0.2) },
  ];

  await Notification.insertMany(notifDefs);
  console.log(`Created ${notifDefs.length} notifications`);

  // ─── Login token for quick testing ──────────────────────────────────────────
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: hamza._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  console.log('\n══════════════════════════════════════════════');
  console.log('  SEED COMPLETE');
  console.log('══════════════════════════════════════════════');
  console.log(`  Login: hamza@invoicemate.com / Password1!`);
  console.log(`  JWT:   ${token}`);
  console.log('══════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
