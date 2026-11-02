/**
 * Builds data/scholarships.json — central schemes plus one flagship
 * state scholarship programme per state/UT.
 *
 * Run: npm run scholarships:build
 */
import fs from "node:fs";
import path from "node:path";

const states = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "states.json"), "utf8")).states || [];
const stateById = new Map(states.map((state) => [state.id, state]));

const NSP = "https://scholarships.gov.in/";

const COMMON_DOCUMENTS = [
  "Aadhaar card",
  "Bank passbook (account in the student's name)",
  "Previous year marksheet",
  "Income certificate",
  "Caste / category certificate (if applicable)",
  "Bonafide certificate from the institution",
  "Passport-size photograph",
];

/* Central schemes */
const CENTRAL = [
  {
    id: "nsp-national-scholarship-portal",
    name: "National Scholarship Portal (NSP)",
    provider: "Ministry of Electronics and Information Technology",
    level: ["Class 1–12", "Undergraduate", "Postgraduate"],
    categories: ["SC", "ST", "OBC", "EBC", "Minority", "General", "Girls", "PwD"],
    amount: "Varies by scheme",
    summary:
      "Single window for most centrally sponsored and state scholarship schemes. Students register once and apply to every scheme they are eligible for.",
    eligibility: [
      "Indian citizen studying in a recognised institution",
      "Family income within the limit set by the individual scheme",
      "Aadhaar-linked bank account in the student's own name",
    ],
    process: [
      "Register on the National Scholarship Portal with Aadhaar and mobile number",
      "Complete the student profile and upload documents",
      "Select every scheme you are eligible for and submit",
      "Track institute verification and disbursal status in the dashboard",
    ],
    cycleMonths: [8, 9, 10, 11],
    deadlineText: "Most schemes close between October and December",
    portalUrl: NSP,
    officialUrl: NSP,
  },
  {
    id: "pre-matric-sc-st",
    name: "Pre-Matric Scholarship for SC/ST Students",
    provider: "Ministry of Social Justice and Empowerment",
    level: ["Class 9–10"],
    categories: ["SC", "ST"],
    amount: "Monthly maintenance allowance plus books and stationery grant",
    summary:
      "Support for SC and ST students studying in Classes 9 and 10 so that they continue school instead of dropping out.",
    eligibility: [
      "Student belongs to a Scheduled Caste or Scheduled Tribe",
      "Studying in Class 9 or 10 in a recognised school",
      "Family income within the scheme ceiling",
    ],
    process: [
      "Apply through the National Scholarship Portal",
      "Upload caste certificate, income certificate and bank details",
      "School verifies the application online",
      "Amount is credited directly to the student's bank account",
    ],
    cycleMonths: [7, 8, 9, 10],
    deadlineText: "Usually closes in October",
    portalUrl: NSP,
    officialUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "post-matric-sc",
    name: "Post-Matric Scholarship for SC Students",
    provider: "Ministry of Social Justice and Empowerment",
    level: ["Class 11–12", "Undergraduate", "Postgraduate", "Diploma"],
    categories: ["SC"],
    amount: "Maintenance allowance, non-refundable fees and study tour charges",
    summary:
      "The largest centrally sponsored scholarship for SC students pursuing education after Class 10, covering fees and monthly maintenance.",
    eligibility: [
      "Scheduled Caste student who has passed Class 10",
      "Enrolled in a recognised post-matric course",
      "Family income within the prescribed limit",
    ],
    process: [
      "Register on NSP and select the Post-Matric SC scheme",
      "Upload caste, income and institution certificates",
      "Institution verifies, then the state department approves",
      "Scholarship is disbursed through DBT",
    ],
    cycleMonths: [8, 9, 10, 11, 12],
    deadlineText: "State-wise, generally August to December",
    portalUrl: NSP,
    officialUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "post-matric-obc",
    name: "Post-Matric Scholarship for OBC Students",
    provider: "Ministry of Social Justice and Empowerment",
    level: ["Class 11–12", "Undergraduate", "Postgraduate"],
    categories: ["OBC"],
    amount: "Fee reimbursement and maintenance allowance",
    summary:
      "Financial support for OBC students continuing education after Class 10 in recognised institutions.",
    eligibility: [
      "OBC student who has completed Class 10",
      "Enrolled in a recognised post-matric course",
      "Family income below the scheme ceiling",
    ],
    process: [
      "Apply on the National Scholarship Portal",
      "Attach OBC certificate and income certificate",
      "Institution and state verify the application",
      "Amount is credited via direct benefit transfer",
    ],
    cycleMonths: [8, 9, 10, 11],
    deadlineText: "Usually October to November",
    portalUrl: NSP,
    officialUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "pre-matric-obc-ebc",
    name: "Pre-Matric Scholarship for OBC/EBC Students",
    provider: "Ministry of Social Justice and Empowerment",
    level: ["Class 1–10"],
    categories: ["OBC", "EBC"],
    amount: "Annual ad-hoc grant and maintenance allowance",
    summary: "School-level support for OBC and EBC students to reduce dropout rates before Class 10.",
    eligibility: [
      "OBC or EBC student in a recognised school",
      "Family income within the scheme limit",
      "Regular attendance in the current academic year",
    ],
    process: [
      "Register on NSP",
      "Fill the school and bank details",
      "Submit caste and income certificates",
      "School verification completes the application",
    ],
    cycleMonths: [7, 8, 9, 10],
    deadlineText: "Usually September to October",
    portalUrl: NSP,
    officialUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "pm-yasasvi",
    name: "PM Young Achievers Scholarship Award Scheme (PM YASASVI)",
    provider: "Ministry of Social Justice and Empowerment",
    level: ["Class 9", "Class 11"],
    categories: ["OBC", "EBC", "DNT"],
    amount: "Annual scholarship up to ₹1,25,000 for top-ranked students",
    summary:
      "Merit-based scholarship for OBC, EBC and DNT students entering Class 9 and Class 11 in top schools, awarded through an entrance test.",
    eligibility: [
      "OBC, EBC or DNT student",
      "Studying in Class 9 or Class 11",
      "Family income below ₹2.5 lakh per year",
      "Qualify the YASASVI entrance test",
    ],
    process: [
      "Register for the YASASVI entrance test on the NTA portal",
      "Appear for the test at the allotted centre",
      "Shortlisted students apply on NSP with documents",
      "Scholarship continues subject to academic performance",
    ],
    cycleMonths: [6, 7, 8, 9],
    deadlineText: "Entrance test registration usually June to August",
    portalUrl: "https://yet.nta.ac.in/",
    officialUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "nmms",
    name: "National Means-cum-Merit Scholarship (NMMS)",
    provider: "Ministry of Education",
    level: ["Class 9–12"],
    categories: ["General", "SC", "ST", "OBC"],
    amount: "₹12,000 per year",
    summary:
      "Scholarship for meritorious students from low-income families to continue secondary education after Class 8.",
    eligibility: [
      "Studying in Class 8 and promoted to Class 9",
      "Family income below the prescribed limit",
      "Qualify the state-level NMMS examination",
    ],
    process: [
      "Apply through the state education department when the NMMS notification opens",
      "Appear for the mental ability and scholastic aptitude test",
      "Selected students apply on NSP",
      "Renewal depends on marks and attendance",
    ],
    cycleMonths: [8, 9, 10, 11],
    deadlineText: "State examination usually between August and November",
    portalUrl: NSP,
    officialUrl: "https://www.education.gov.in/",
  },
  {
    id: "csss-central-sector",
    name: "Central Sector Scheme of Scholarship for College and University Students",
    provider: "Ministry of Education",
    level: ["Undergraduate", "Postgraduate"],
    categories: ["General", "SC", "ST", "OBC", "Minority"],
    amount: "₹12,000 per year for UG, ₹20,000 per year for PG",
    summary:
      "Merit scholarship for students in the top 20 percentile of their Class 12 board examination who are pursuing a regular degree.",
    eligibility: [
      "Above the 80th percentile in the Class 12 board examination",
      "Family income below ₹4.5 lakh per year",
      "Pursuing a regular undergraduate or postgraduate course",
    ],
    process: [
      "Apply on the National Scholarship Portal after Class 12 results",
      "Upload board marksheet, income certificate and bank details",
      "Institution verifies the enrolment",
      "Renewal requires passing each year with minimum marks",
    ],
    cycleMonths: [8, 9, 10, 11],
    deadlineText: "Usually October to November",
    portalUrl: NSP,
    officialUrl: "https://www.education.gov.in/",
  },
  {
    id: "inspire-she",
    name: "INSPIRE Scholarship for Higher Education (SHE)",
    provider: "Department of Science and Technology",
    level: ["Undergraduate", "Postgraduate"],
    categories: ["General", "SC", "ST", "OBC"],
    amount: "₹80,000 per year for five years",
    summary:
      "Scholarship for top performers in Class 12 science who choose a career in basic and natural sciences.",
    eligibility: [
      "Top 1% in the Class 12 board examination, or a top rank in JEE Main / NEET",
      "Pursuing BSc, BS or integrated MSc in natural or basic sciences",
      "Age between 17 and 22 years",
    ],
    process: [
      "Apply through the online INSPIRE portal when the call opens",
      "Upload Class 12 marksheet and admission proof",
      "Shortlisting is based on board and entrance exam performance",
      "Scholarship continues with annual progress reports",
    ],
    cycleMonths: [7, 8, 9, 10],
    deadlineText: "Usually July to September",
    portalUrl: "https://www.online-inspire.gov.in/",
    officialUrl: "https://www.dst.gov.in/",
  },
  {
    id: "pragati-aicte-girls",
    name: "AICTE Pragati Scholarship for Girls",
    provider: "All India Council for Technical Education",
    level: ["Diploma", "Undergraduate"],
    categories: ["Girls"],
    amount: "₹50,000 per year",
    summary:
      "Scholarship for girl students admitted to AICTE-approved technical diploma or degree programmes.",
    eligibility: [
      "Girl student admitted to the first year of an AICTE-approved course",
      "Family income below ₹8 lakh per year",
      "Maximum two girls per family",
    ],
    process: [
      "Apply on the National Scholarship Portal under the AICTE scheme",
      "Upload admission proof, income certificate and bank details",
      "Institute verifies the application",
      "Amount is transferred directly to the student",
    ],
    cycleMonths: [9, 10, 11, 12],
    deadlineText: "Usually October to December",
    portalUrl: NSP,
    officialUrl: "https://www.aicte-india.org/",
  },
  {
    id: "saksham-aicte",
    name: "AICTE Saksham Scholarship for Students with Disabilities",
    provider: "All India Council for Technical Education",
    level: ["Diploma", "Undergraduate"],
    categories: ["PwD"],
    amount: "₹50,000 per year",
    summary:
      "Scholarship for students with disabilities pursuing AICTE-approved technical diploma or degree programmes.",
    eligibility: [
      "Disability of 40% or more, certified by a competent authority",
      "Admitted to an AICTE-approved institution",
      "Family income below ₹8 lakh per year",
    ],
    process: [
      "Apply on NSP under the AICTE Saksham scheme",
      "Upload disability certificate, admission proof and income certificate",
      "Institute verifies and forwards the application",
      "Amount is credited through DBT",
    ],
    cycleMonths: [9, 10, 11, 12],
    deadlineText: "Usually October to December",
    portalUrl: NSP,
    officialUrl: "https://www.aicte-india.org/",
  },
  {
    id: "begum-hazrat-mahal",
    name: "Begum Hazrat Mahal National Scholarship for Minority Girls",
    provider: "Maulana Azad Education Foundation",
    level: ["Class 9–12"],
    categories: ["Minority", "Girls"],
    amount: "Up to ₹6,000 per year",
    summary:
      "Scholarship for girl students from minority communities studying in Classes 9 to 12.",
    eligibility: [
      "Girl student from a notified minority community",
      "Studying in Class 9 to 12",
      "Minimum 50% marks in the previous class",
      "Family income below ₹2 lakh per year",
    ],
    process: [
      "Register on the MAEF scholarship portal",
      "Upload marksheet, income certificate and community certificate",
      "School verifies the application",
      "Amount is transferred to the student's bank account",
    ],
    cycleMonths: [8, 9, 10, 11],
    deadlineText: "Usually September to November",
    portalUrl: "https://maef.nic.in/",
    officialUrl: "https://www.minorityaffairs.gov.in/",
  },
  {
    id: "post-matric-minority",
    name: "Post-Matric Scholarship for Minority Students",
    provider: "Ministry of Minority Affairs",
    level: ["Class 11–12", "Undergraduate", "Postgraduate"],
    categories: ["Minority"],
    amount: "Course fee reimbursement and maintenance allowance",
    summary:
      "Support for students from minority communities pursuing education after Class 10.",
    eligibility: [
      "Student from a notified minority community",
      "Passed Class 10 and enrolled in a post-matric course",
      "Family income below ₹2 lakh per year",
      "Minimum 50% marks in the previous examination",
    ],
    process: [
      "Apply on the National Scholarship Portal",
      "Upload community certificate, income certificate and marksheets",
      "Institution verification followed by state approval",
      "Amount is credited via DBT",
    ],
    cycleMonths: [8, 9, 10, 11],
    deadlineText: "Usually October to November",
    portalUrl: NSP,
    officialUrl: "https://www.minorityaffairs.gov.in/",
  },
  {
    id: "top-class-sc",
    name: "Top Class Education Scheme for SC Students",
    provider: "Ministry of Social Justice and Empowerment",
    level: ["Undergraduate", "Postgraduate"],
    categories: ["SC"],
    amount: "Full tuition fee plus living expenses at notified institutions",
    summary:
      "Covers the full cost of study at India's top institutions for SC students who secure admission there.",
    eligibility: [
      "Scheduled Caste student admitted to a notified premier institution",
      "Family income below ₹8 lakh per year",
      "Not receiving any other scholarship for the same course",
    ],
    process: [
      "Apply on the National Scholarship Portal",
      "Upload admission letter, caste certificate and income certificate",
      "Institution verifies and recommends",
      "Fee is released directly to the institution",
    ],
    cycleMonths: [7, 8, 9, 10],
    deadlineText: "Usually August to October",
    portalUrl: NSP,
    officialUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "post-matric-disabilities",
    name: "Post-Matric Scholarship for Students with Disabilities",
    provider: "Department of Empowerment of Persons with Disabilities",
    level: ["Class 11–12", "Undergraduate", "Postgraduate"],
    categories: ["PwD"],
    amount: "Maintenance allowance, book grant and fee reimbursement",
    summary:
      "Scholarship for students with disabilities studying after Class 10, including readers' allowance for visually impaired students.",
    eligibility: [
      "Disability of 40% or more",
      "Studying in Class 11 or above in a recognised institution",
      "Family income within the prescribed limit",
    ],
    process: [
      "Apply on the National Scholarship Portal",
      "Upload disability certificate, income certificate and admission proof",
      "Institution verifies the enrolment",
      "Amount is credited to the student's bank account",
    ],
    cycleMonths: [8, 9, 10, 11],
    deadlineText: "Usually October to November",
    portalUrl: NSP,
    officialUrl: "https://disabilityaffairs.gov.in/",
  },
  {
    id: "padho-pardesh",
    name: "Padho Pardesh Interest Subsidy for Minority Students",
    provider: "Ministry of Minority Affairs",
    level: ["Postgraduate"],
    categories: ["Minority"],
    amount: "Interest subsidy on education loans for overseas study",
    summary:
      "Interest subsidy on education loans taken for postgraduate studies abroad by students from minority communities.",
    eligibility: [
      "Student from a notified minority community",
      "Admitted to a postgraduate course abroad",
      "Education loan from a scheduled bank",
      "Family income below ₹6 lakh per year",
    ],
    process: [
      "Apply through the bank that sanctioned the education loan",
      "Submit community and income certificates",
      "Ministry approves the subsidy for the loan tenure",
      "Interest is credited to the loan account",
    ],
    cycleMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    deadlineText: "Open through the year, processed with the loan",
    portalUrl: "https://www.minorityaffairs.gov.in/",
    officialUrl: "https://www.minorityaffairs.gov.in/",
  },
  {
    id: "national-fellowship-sc",
    name: "National Fellowship for SC Students",
    provider: "Ministry of Social Justice and Empowerment",
    level: ["Research (MPhil/PhD)"],
    categories: ["SC"],
    amount: "Fellowship and contingency grant as per UGC rates",
    summary: "Fellowship for SC students pursuing MPhil or PhD in a recognised university.",
    eligibility: [
      "Scheduled Caste candidate",
      "Registered for MPhil or PhD",
      "Qualified UGC-NET or CSIR-NET",
      "Not receiving any other fellowship",
    ],
    process: [
      "Apply through the UGC fellowship portal when the call opens",
      "Upload caste certificate, NET scorecard and registration proof",
      "Selection is based on merit and available slots",
      "Fellowship is released through the university",
    ],
    cycleMonths: [6, 7, 8, 9],
    deadlineText: "Usually aligned with the UGC-NET cycle",
    portalUrl: "https://www.ugc.gov.in/",
    officialUrl: "https://socialjustice.gov.in/",
  },
  {
    id: "maulana-azad-fellowship",
    name: "Maulana Azad National Fellowship for Minority Students",
    provider: "Ministry of Minority Affairs",
    level: ["Research (MPhil/PhD)"],
    categories: ["Minority"],
    amount: "Fellowship and contingency grant as per UGC rates",
    summary: "Fellowship for students from minority communities pursuing MPhil or PhD.",
    eligibility: [
      "Student from a notified minority community",
      "Registered for MPhil or PhD",
      "Qualified UGC-NET or CSIR-NET",
      "Family income within the prescribed limit",
    ],
    process: [
      "Apply through the UGC portal during the fellowship window",
      "Upload community certificate, NET scorecard and university registration",
      "Merit-based selection",
      "Fellowship is disbursed through the university",
    ],
    cycleMonths: [6, 7, 8, 9],
    deadlineText: "Usually aligned with the UGC-NET cycle",
    portalUrl: "https://www.ugc.gov.in/",
    officialUrl: "https://www.minorityaffairs.gov.in/",
  },
];

/* One flagship state programme per state/UT */
const STATE_SCHEMES = [
  ["andhra-pradesh", "Jagananna Vidya Deevena & Vasathi Deevena", "https://jnanabhumi.ap.gov.in/", "Full fee reimbursement plus hostel allowance", ["Undergraduate", "Diploma"]],
  ["arunachal-pradesh", "Arunachal Pradesh Scholarship Scheme", "", "State scholarship for SC/ST and meritorious students", ["Class 9–12", "Undergraduate"]],
  ["assam", "Assam Post-Matric Scholarship", "https://scholarships.assam.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["bihar", "Bihar Post-Matric Scholarship", "https://pmsonline.bih.nic.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["chhattisgarh", "Chhattisgarh Post-Matric Scholarship", "https://postmatric.cgstate.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["goa", "Goa Scholarship Scheme", "https://scholarships.goa.gov.in/", "Tuition support and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["gujarat", "Gujarat Digital Scholarship", "https://www.digitalgujarat.gov.in/", "Fee assistance for SC/ST/OBC and EWS students", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["haryana", "Haryana Higher Education Scholarship", "https://harchhatravratti.highereduhry.ac.in/", "Tuition fee and maintenance support", ["Undergraduate", "Postgraduate"]],
  ["himachal-pradesh", "HP ePass Scholarship", "https://hpepass.cgg.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["jharkhand", "Jharkhand e-Kalyan Post-Matric Scholarship", "https://ejharkhand.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["karnataka", "Karnataka State Scholarship Portal (SSP)", "https://ssp.postmatric.karnataka.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["kerala", "Kerala DCE Scholarship", "https://www.dcescholarship.kerala.gov.in/", "Fee support and lump-sum grant", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["madhya-pradesh", "MP Post-Matric Scholarship", "https://scholarshipportal.mp.nic.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["maharashtra", "MahaDBT Scholarship", "https://mahadbt.maharashtra.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["manipur", "Manipur Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["meghalaya", "Meghalaya Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["mizoram", "Mizoram Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["nagaland", "Nagaland Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["odisha", "Odisha State Scholarship Portal", "https://scholarship.odisha.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["punjab", "Punjab Post-Matric Scholarship", "https://punjabscholarships.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["rajasthan", "Rajasthan Social Justice Scholarship", "https://sje.rajasthan.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["sikkim", "Sikkim Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["tamil-nadu", "Tamil Nadu Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["telangana", "Telangana ePASS Post-Matric Scholarship", "https://telanganaepass.cgg.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["tripura", "Tripura Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["uttar-pradesh", "UP Scholarship (Pre & Post Matric)", "https://scholarship.up.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 9–12", "Undergraduate", "Postgraduate"]],
  ["uttarakhand", "Uttarakhand Scholarship", "https://scholarship.uk.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 9–12", "Undergraduate", "Postgraduate"]],
  ["west-bengal", "West Bengal SVMCM Scholarship", "https://svmcm.wb.gov.in/", "Monthly stipend and one-time grant", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["andaman-and-nicobar-islands", "A&N Islands Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["chandigarh", "Chandigarh Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["dadra-and-nagar-haveli-and-daman-and-diu", "DNH & DD Scholarship Scheme", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["delhi", "Delhi Post-Matric Scholarship", "https://edistrict.delhigovt.nic.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["jammu-and-kashmir", "J&K Post-Matric Scholarship", "https://jk.gov.in/", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate", "Postgraduate"]],
  ["ladakh", "Ladakh Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["lakshadweep", "Lakshadweep Scholarship Scheme", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
  ["puducherry", "Puducherry Post-Matric Scholarship", "", "Fee reimbursement and maintenance allowance", ["Class 11–12", "Undergraduate"]],
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const scholarships = [];
const seen = new Set();

function add(entry) {
  let slug = entry.slug || slugify(entry.name);
  if (seen.has(slug)) slug = `${slug}-${entry.id}`;
  seen.add(slug);
  scholarships.push({
    id: entry.id,
    slug,
    name: entry.name,
    provider: entry.provider,
    scope: entry.scope,
    stateId: entry.stateId || null,
    stateName: entry.stateName || null,
    level: entry.level,
    categories: entry.categories,
    amount: entry.amount,
    summary: entry.summary,
    eligibility: entry.eligibility,
    benefits: entry.benefits || [],
    documents: entry.documents || COMMON_DOCUMENTS,
    process: entry.process,
    cycleMonths: entry.cycleMonths,
    deadlineText: entry.deadlineText,
    portalUrl: entry.portalUrl,
    officialUrl: entry.officialUrl,
    tags: entry.tags || [],
  });
}

for (const scheme of CENTRAL) {
  add({
    ...scheme,
    scope: "central",
    benefits: scheme.benefits || [scheme.amount],
    tags: [scheme.provider, ...scheme.categories.slice(0, 3)],
  });
}

for (const [stateId, name, portalUrl, amount, level] of STATE_SCHEMES) {
  const state = stateById.get(stateId);
  if (!state) throw new Error(`Unknown stateId "${stateId}" for scholarship "${name}"`);
  const official = portalUrl || state.portal;
  add({
    id: `state-${stateId}`,
    slug: `${stateId}-state-scholarship`,
    name,
    provider: `${state.name} Government`,
    scope: "state",
    stateId,
    stateName: state.name,
    level,
    categories: ["SC", "ST", "OBC", "EBC", "Minority", "General"],
    amount,
    summary: `${name} is the flagship scholarship programme of the ${state.name} government for students studying in ${state.name}.`,
    eligibility: [
      `Domicile of ${state.name}`,
      "Studying in a recognised institution",
      "Family income within the state scheme limit",
      "Category certificate where applicable",
    ],
    benefits: [amount, "Direct benefit transfer to the student's bank account"],
    process: [
      `Open the official ${state.name} scholarship portal`,
      "Register with Aadhaar and mobile number",
      "Complete the student and institution details",
      "Upload documents and submit before the deadline",
      "Track verification and disbursal status online",
    ],
    cycleMonths: [8, 9, 10, 11, 12],
    deadlineText: "State-specific, generally August to December",
    portalUrl: official,
    officialUrl: official,
    tags: [state.name, state.region],
  });
}

scholarships.sort((a, b) => a.name.localeCompare(b.name));

const output = {
  version: 1,
  updated: new Date().toISOString().slice(0, 10),
  note: "Scheme details are indicative summaries. Amounts, income limits and deadlines change every year — always confirm on the official portal.",
  counts: {
    total: scholarships.length,
    central: scholarships.filter((item) => item.scope === "central").length,
    state: scholarships.filter((item) => item.scope === "state").length,
    states: new Set(scholarships.map((item) => item.stateId).filter(Boolean)).size,
  },
  scholarships,
};

const target = path.join(process.cwd(), "data", "scholarships.json");
fs.writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(
  `✓ ${output.counts.total} scholarships written ` +
    `(${output.counts.central} central, ${output.counts.state} state/UT)`,
);
