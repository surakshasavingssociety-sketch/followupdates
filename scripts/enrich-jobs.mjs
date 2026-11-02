/**
 * One-off enrichment: adds full notification analysis to the sample jobs so
 * every post carries highlights, dates, posts, eligibility, selection stages,
 * application steps, documents and official links.
 *
 * Run: node scripts/enrich-jobs.mjs
 */
import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "data", "jobs.json");
const jobs = JSON.parse(fs.readFileSync(file, "utf8"));

const DOCS_COMMON = [
  "Recent passport-size photograph (JPG, under 50 KB)",
  "Scanned signature (JPG, under 20 KB)",
  "Class 10 certificate and marksheet",
  "Class 12 certificate and marksheet",
  "Graduation / post-graduation marksheets (as applicable)",
  "Category certificate (SC / ST / OBC / EWS), if applicable",
  "Photo identity proof (Aadhaar, PAN, passport or voter ID)",
];

const analysis = {
  "ssc-cgl-2026-notification": {
    notificationUrl: "https://ssc.gov.in/for-candidates/notices",
    highlights: [
      "Combined Graduate Level Examination 2026 notification released for Group B and Group C posts.",
      "Applications are accepted only online through the SSC portal; no offline form is allowed.",
      "Graduation in any discipline is the minimum qualification for all posts.",
      "Tier 1 is a computer-based objective test; Tier 2 adds section-wise papers and a skill test.",
      "Fee is ₹100 for General and OBC candidates; SC, ST, female and PwD candidates are exempt.",
    ],
    importantDates: [
      { label: "Notification released", date: "2026-10-28" },
      { label: "Application window opens", date: "2026-10-28" },
      { label: "Last date to apply", date: "2026-11-25", note: "Applications close at 11:00 PM" },
      { label: "Last date for fee payment", date: "2026-11-26" },
      { label: "Application correction window", date: "2026-11-29", note: "Usually open for 3–5 days" },
      { label: "Tier 1 exam", date: "2027-03-15", note: "Indicative; confirm on the admit card" },
    ],
    posts: [
      { name: "Assistant Section Officer", vacancies: 3200, qualification: "Graduate", note: "Central Secretariat Service" },
      { name: "Inspector (Central Excise / Preventive Officer)", vacancies: 2100, qualification: "Graduate" },
      { name: "Assistant Enforcement Officer", vacancies: 350, qualification: "Graduate" },
      { name: "Income Tax Inspector", vacancies: 1800, qualification: "Graduate" },
      { name: "Statistical Investigator Grade II", vacancies: 1200, qualification: "Graduate with Statistics" },
      { name: "Upper Division Clerk / Tax Assistant", vacancies: 3350, qualification: "Graduate" },
    ],
    selectionProcess: [
      "Tier 1 computer-based examination (objective, qualifying plus merit)",
      "Tier 2 computer-based examination with section-wise papers",
      "Skill test / typing test for specific posts",
      "Document verification and medical examination where applicable",
    ],
    howToApply: [
      "Open the SSC candidate portal and complete one-time registration if you are a new user.",
      "Log in, select Combined Graduate Level Examination 2026 and fill the application form.",
      "Upload a recent photograph and signature in the prescribed format.",
      "Select the examination centres in order of preference.",
      "Pay the fee online and download the submitted application receipt.",
    ],
    documents: DOCS_COMMON,
    eligibility: [
      "Bachelor's degree in any discipline from a recognised university.",
      "Age between 18 and 32 years as on the cut-off date; relaxation applies for reserved categories.",
      "Candidates must be Indian citizens or hold a valid eligibility certificate as notified.",
      "Working knowledge of computers is required for posts that involve data entry.",
    ],
    officialLinks: [
      { label: "SSC notices and notifications", url: "https://ssc.gov.in/for-candidates/notices" },
      { label: "SSC candidate portal", url: "https://ssc.gov.in/" },
      { label: "Syllabus and exam pattern", url: "https://ssc.gov.in/for-candidates/syllabus" },
    ],
  },

  "upsc-civil-services-2027-notification": {
    notificationUrl: "https://upsc.gov.in/examinations/active-examinations",
    highlights: [
      "Civil Services Examination 2027 covers recruitment to IAS, IPS, IFS and other Group A and B services.",
      "The application window is open for about four weeks on the UPSC online application portal.",
      "Prelims is a screening test; Mains and the personality test decide the final rank.",
      "Candidates can choose an optional subject for the Mains examination.",
      "The number of attempts and age relaxation depend on the category.",
    ],
    importantDates: [
      { label: "Notification released", date: "2027-01-14" },
      { label: "Application window opens", date: "2027-01-14" },
      { label: "Last date to apply", date: "2027-02-03", note: "Apply well before the closing date" },
      { label: "Preliminary examination", date: "2027-05-30" },
      { label: "Mains examination", date: "2027-09-17", note: "Usually runs for five days" },
      { label: "Personality test", date: "2028-01-15", note: "Indicative window" },
    ],
    posts: [
      { name: "Indian Administrative Service (IAS)", vacancies: 180, qualification: "Graduate" },
      { name: "Indian Police Service (IPS)", vacancies: 150, qualification: "Graduate" },
      { name: "Indian Foreign Service (IFS)", vacancies: 35, qualification: "Graduate" },
      { name: "Other central services (Group A and B)", vacancies: 600, qualification: "Graduate" },
    ],
    selectionProcess: [
      "Preliminary examination: two objective papers (General Studies and CSAT)",
      "Mains examination: nine written papers including two optional papers",
      "Personality test / interview conducted at UPSC Bhavan",
      "Final merit list based on Mains and interview marks",
    ],
    howToApply: [
      "Register on the UPSC online application portal with a valid email and mobile number.",
      "Fill the application form, choose your optional subject and exam centres.",
      "Upload a photograph, signature and photo identity document.",
      "Pay the prescribed fee online; female, SC, ST and PwD candidates are exempt.",
      "Submit the form and save the acknowledgement number.",
    ],
    documents: [
      ...DOCS_COMMON,
      "Photo identity card in original for the examination hall",
      "Domicile certificate where a claim is made",
      "EWS certificate valid for the current financial year, if applicable",
    ],
    eligibility: [
      "Bachelor's degree in any discipline from a recognised university.",
      "Age between 21 and 32 years for the General category as on 1 August of the exam year.",
      "Upper age relaxation of 3 years for OBC, 5 years for SC/ST and 10 years for PwD candidates.",
      "Candidates appearing in the final year of graduation may apply provisionally.",
    ],
    officialLinks: [
      { label: "Active UPSC examinations", url: "https://upsc.gov.in/examinations/active-examinations" },
      { label: "UPSC online application", url: "https://upsconline.nic.in/" },
      { label: "Civil Services syllabus", url: "https://upsc.gov.in/examinations/syllabus" },
    ],
  },

  "ibps-po-mt-2026-notification": {
    notificationUrl: "https://www.ibps.in/",
    highlights: [
      "IBPS is recruiting Probationary Officers and Management Trainees for participating public sector banks.",
      "Selection is through Prelims, Mains and an interview conducted by the participating banks.",
      "A valid graduation degree is mandatory; final-year students are not eligible.",
      "The exam is conducted in English and Hindi at centres across India.",
      "Candidates must carry the call letter and a photo identity proof to the exam centre.",
    ],
    importantDates: [
      { label: "Notification released", date: "2026-10-20" },
      { label: "Online registration opens", date: "2026-10-20" },
      { label: "Last date to register", date: "2026-11-10" },
      { label: "Preliminary exam", date: "2026-12-13" },
      { label: "Mains exam", date: "2027-01-24" },
      { label: "Interview", date: "2027-03-01", note: "Indicative window" },
    ],
    posts: [
      { name: "Probationary Officer", vacancies: 4200, qualification: "Graduate" },
      { name: "Management Trainee", vacancies: 1800, qualification: "Graduate" },
    ],
    selectionProcess: [
      "Preliminary examination: English, Quantitative Aptitude and Reasoning (qualifying)",
      "Mains examination: Reasoning, General Awareness, English and Quantitative Aptitude",
      "Interview conducted by the participating banks",
      "Provisional allotment based on the combined score",
    ],
    howToApply: [
      "Open the IBPS application portal and register with your basic details.",
      "Upload a photograph, signature, left thumb impression and handwritten declaration.",
      "Fill the academic and category details exactly as they appear in your certificates.",
      "Choose the exam language and preferred centres.",
      "Pay the fee online and download the completed application form.",
    ],
    documents: DOCS_COMMON,
    eligibility: [
      "Graduation in any discipline from a university recognised by the Government of India.",
      "Age between 20 and 30 years as on the prescribed cut-off date.",
      "Age relaxation of 3 years for OBC and 5 years for SC/ST candidates.",
      "Computer literacy is required for all posts.",
    ],
    officialLinks: [
      { label: "IBPS official website", url: "https://www.ibps.in/" },
      { label: "IBPS candidate portal", url: "https://ibpsonline.ibps.in/" },
    ],
  },

  "rrb-ntpc-2026-notification": {
    notificationUrl: "https://www.rrbapply.gov.in/",
    highlights: [
      "RRB NTPC recruitment covers station master, goods guard, clerk and other non-technical posts.",
      "There are two computer-based tests followed by document verification and a medical test.",
      "Qualification ranges from Class 12 to graduation depending on the post.",
      "Normalised marks are used when the exam is held in multiple shifts.",
      "Candidates can apply to more than one RRB but must choose a single preferred railway zone.",
    ],
    importantDates: [
      { label: "Notification released", date: "2026-10-15" },
      { label: "Online application opens", date: "2026-10-15" },
      { label: "Last date to apply", date: "2026-11-14" },
      { label: "CBT 1", date: "2027-01-10", note: "Indicative; check the admit card" },
      { label: "CBT 2", date: "2027-04-05" },
      { label: "Document verification", date: "2027-06-15" },
    ],
    posts: [
      { name: "Station Master", vacancies: 1100, qualification: "Graduate" },
      { name: "Goods Guard", vacancies: 3200, qualification: "Graduate" },
      { name: "Senior Clerk cum Typist", vacancies: 2200, qualification: "Class 12" },
      { name: "Commercial cum Ticket Clerk", vacancies: 4800, qualification: "Class 12" },
      { name: "Accounts Assistant cum Typist", vacancies: 1200, qualification: "Class 12 with Maths" },
    ],
    selectionProcess: [
      "Computer-based test 1 (screening)",
      "Computer-based test 2 (merit)",
      "Document verification",
      "Medical examination as per the post's medical standard",
    ],
    howToApply: [
      "Create an account on the RRB application portal with your Aadhaar-linked mobile number.",
      "Select the RRB zone you want to apply through and choose the posts in order of preference.",
      "Upload a photograph, signature and SC/ST certificate if applicable.",
      "Pay the fee online; refundable for candidates who appear in CBT 1 as notified.",
      "Download the application form and keep the registration number safe.",
    ],
    documents: DOCS_COMMON,
    eligibility: [
      "Class 12 pass for clerical posts and graduation for station master and goods guard posts.",
      "Age between 18 and 33 years depending on the post; relaxation applies for reserved categories.",
      "Candidates must meet the medical standard prescribed for the chosen post.",
      "Only Indian citizens and a few notified categories are eligible to apply.",
    ],
    officialLinks: [
      { label: "RRB application portal", url: "https://www.rrbapply.gov.in/" },
      { label: "Indian Railways recruitment", url: "https://indianrailways.gov.in/" },
    ],
  },

  "cbse-board-exam-2027-date-sheet": {
    notificationUrl: "https://cbseacademic.nic.in/",
    highlights: [
      "CBSE has published the provisional date sheet for Class 10 and Class 12 board examinations 2027.",
      "Exams begin in February and run through March, with a gap of at least two days between major papers.",
      "Practical examinations are conducted by schools in January before the theory papers.",
      "Students should download the date sheet from the official CBSE academic website.",
      "The date sheet is provisional; any change is notified separately by CBSE.",
    ],
    importantDates: [
      { label: "Date sheet released", date: "2026-12-15" },
      { label: "Practical examinations", date: "2027-01-05" },
      { label: "Theory examinations begin", date: "2027-02-15" },
      { label: "Theory examinations end", date: "2027-03-30" },
      { label: "Result declaration", date: "2027-05-15", note: "Indicative" },
    ],
    posts: [],
    selectionProcess: [
      "Practical / internal assessment conducted by the school",
      "Theory examination as per the published date sheet",
      "Answer script evaluation by CBSE-appointed examiners",
      "Result declaration and re-evaluation window",
    ],
    howToApply: [
      "Download the official date sheet from the CBSE academic website.",
      "Confirm the subject codes with your school and check the exam timing.",
      "Collect the admit card from your school before the practical examinations.",
      "Carry the admit card and a photo identity proof to every examination.",
    ],
    documents: [
      "CBSE admit card",
      "School identity card",
      "Photo identity proof",
      "Transparent geometry box and permitted stationery",
    ],
    eligibility: [
      "Students enrolled in a CBSE-affiliated school for Classes 10 or 12.",
      "Minimum attendance as prescribed by CBSE must be met.",
      "Internal assessment and practical marks must be submitted by the school.",
    ],
    officialLinks: [
      { label: "CBSE academic website", url: "https://cbseacademic.nic.in/" },
      { label: "CBSE date sheet", url: "https://cbseacademic.nic.in/date_sheet.html" },
      { label: "CBSE main website", url: "https://cbse.gov.in/" },
    ],
  },

  "nta-ugc-net-december-2026": {
    notificationUrl: "https://ugcnet.nta.ac.in/",
    highlights: [
      "UGC NET December 2026 is being conducted by NTA for Assistant Professor and Junior Research Fellowship eligibility.",
      "The exam is held in computer-based mode across 83 subjects.",
      "Candidates can appear in two papers: Teaching and Research Aptitude, and the chosen subject.",
      "A valid master's degree with at least 55% marks is required for the General category.",
      "The score is valid for three years for JRF and for the Assistant Professor eligibility period notified by UGC.",
    ],
    importantDates: [
      { label: "Notification released", date: "2026-10-10" },
      { label: "Application window opens", date: "2026-10-10" },
      { label: "Last date to apply", date: "2026-11-05" },
      { label: "Correction window", date: "2026-11-08" },
      { label: "Exam dates", date: "2026-12-05", note: "Held over multiple days" },
      { label: "Result declaration", date: "2027-01-20" },
    ],
    posts: [],
    selectionProcess: [
      "Computer-based test with two papers",
      "Paper 1: Teaching and Research Aptitude (50 questions)",
      "Paper 2: Subject-specific questions (100 questions)",
      "No interview; the score decides JRF and Assistant Professor eligibility",
    ],
    howToApply: [
      "Register on the NTA UGC NET portal with your Aadhaar and mobile number.",
      "Choose the subject and the exam cities in order of preference.",
      "Upload a photograph, signature and category certificate.",
      "Pay the fee online and download the confirmation page.",
    ],
    documents: DOCS_COMMON,
    eligibility: [
      "Master's degree with at least 55% marks (50% for SC, ST, OBC and PwD candidates).",
      "Candidates in the final year of their master's degree may apply provisionally.",
      "No upper age limit for Assistant Professor; JRF has an upper age limit of 30 years.",
      "Ph.D. holders may be exempt from the minimum marks requirement as per UGC rules.",
    ],
    officialLinks: [
      { label: "UGC NET official portal", url: "https://ugcnet.nta.ac.in/" },
      { label: "NTA main website", url: "https://nta.ac.in/" },
      { label: "UGC NET information bulletin", url: "https://ugcnet.nta.ac.in/" },
    ],
  },

  "ssc-chsl-2026-admit-card": {
    notificationUrl: "https://ssc.gov.in/for-candidates/notices",
    highlights: [
      "SSC has released the Tier 1 admit card for the CHSL 2026 examination.",
      "Candidates must download the admit card from the regional SSC website using their registration number.",
      "The exam is computer-based and will be held across multiple shifts.",
      "Carry the admit card and an original photo identity proof to the exam centre.",
      "Report at least 60 minutes before the reporting time printed on the admit card.",
    ],
    importantDates: [
      { label: "Admit card released", date: "2026-10-30" },
      { label: "Tier 1 exam", date: "2026-11-12", note: "Check the shift timing on the admit card" },
      { label: "Exam city intimation", date: "2026-10-25" },
      { label: "Result", date: "2026-12-20", note: "Indicative" },
    ],
    posts: [],
    selectionProcess: [
      "Tier 1 computer-based examination",
      "Tier 2 computer-based examination",
      "Typing test / skill test",
      "Document verification",
    ],
    howToApply: [
      "Open your regional SSC website and log in with the registration number and password.",
      "Download the Tier 1 admit card and take a clear colour printout.",
      "Check the exam centre, shift timing and reporting time carefully.",
      "Read the instructions printed on the admit card before the exam day.",
    ],
    documents: [
      "Printed SSC CHSL Tier 1 admit card",
      "Original photo identity proof (Aadhaar, PAN, passport or voter ID)",
      "Passport-size photograph matching the application",
      "Transparent water bottle and a black ballpoint pen",
    ],
    eligibility: [
      "Class 12 pass from a recognised board for all CHSL posts.",
      "Age between 18 and 27 years depending on the post.",
      "Typing speed of 35 words per minute in English or 30 words per minute in Hindi for LDC posts.",
    ],
    officialLinks: [
      { label: "SSC notices and admit cards", url: "https://ssc.gov.in/for-candidates/notices" },
      { label: "SSC candidate portal", url: "https://ssc.gov.in/" },
    ],
  },

  "upsc-cse-2026-final-result": {
    notificationUrl: "https://upsc.gov.in/examinations/active-examinations",
    highlights: [
      "UPSC has declared the final result of the Civil Services Examination 2026.",
      "The merit list includes candidates recommended for IAS, IPS, IFS and other central services.",
      "Candidates can check their result and marks on the official UPSC website.",
      "Selected candidates will receive appointment letters from the Department of Personnel and Training.",
      "The reserve list is published separately after the main merit list.",
    ],
    importantDates: [
      { label: "Final result declared", date: "2026-10-30" },
      { label: "Marks disclosure", date: "2026-11-15", note: "Available on the UPSC website" },
      { label: "Reserve list", date: "2026-12-10", note: "Indicative" },
      { label: "Appointment letters", date: "2027-01-15", note: "Issued by DoPT" },
    ],
    posts: [],
    selectionProcess: [
      "Preliminary examination",
      "Mains examination",
      "Personality test / interview",
      "Final merit list and service allocation",
    ],
    howToApply: [
      "Open the UPSC website and go to the examination results section.",
      "Search for your roll number in the final result PDF.",
      "Download and save the result PDF for future reference.",
      "Follow the instructions issued by DoPT for the appointment process.",
    ],
    documents: [
      "UPSC final result PDF with your roll number",
      "Photo identity proof",
      "All original certificates submitted during the interview",
    ],
    eligibility: [
      "Candidates who qualified the Mains examination and appeared for the personality test.",
      "Final selection is based on the combined Mains and interview score.",
    ],
    officialLinks: [
      { label: "UPSC results", url: "https://upsc.gov.in/examinations/active-examinations" },
      { label: "UPSC main website", url: "https://upsc.gov.in/" },
    ],
  },

  "aiims-norcet-8-answer-key": {
    notificationUrl: "https://www.aiimsexams.ac.in/",
    highlights: [
      "AIIMS has released the provisional answer key for NORCET 8.",
      "Candidates can raise objections against the answer key within the notified window.",
      "Objections must be supported by a valid reference and the prescribed fee per question.",
      "The final answer key will be published after the objection window closes.",
      "The result and counselling schedule will follow the final answer key.",
    ],
    importantDates: [
      { label: "Provisional answer key released", date: "2026-10-29" },
      { label: "Objection window opens", date: "2026-10-29" },
      { label: "Last date for objections", date: "2026-11-02", note: "Closes at 5:00 PM" },
      { label: "Final answer key", date: "2026-11-10", note: "Indicative" },
      { label: "Result", date: "2026-11-20", note: "Indicative" },
    ],
    posts: [],
    selectionProcess: [
      "Computer-based NORCET examination",
      "Provisional answer key and objection window",
      "Final answer key publication",
      "Merit list and counselling",
    ],
    howToApply: [
      "Log in to the AIIMS examination portal with your registration details.",
      "Open the NORCET 8 provisional answer key and download the PDF.",
      "Compare the responses with the official key and note any disputed questions.",
      "Submit objections online with supporting references before the deadline.",
    ],
    documents: [
      "AIIMS NORCET 8 admit card",
      "Registration number and password",
      "Supporting reference material for objections",
    ],
    eligibility: [
      "BSc Nursing or GNM qualification with valid registration as a nurse.",
      "Candidates must have appeared in the NORCET 8 examination.",
    ],
    officialLinks: [
      { label: "AIIMS examinations portal", url: "https://www.aiimsexams.ac.in/" },
      { label: "NORCET answer key", url: "https://www.aiimsexams.ac.in/" },
    ],
  },

  "delhi-police-constable-2026": {
    notificationUrl: "https://www.delhipolice.gov.in/",
    highlights: [
      "Delhi Police has invited applications for Constable (Executive) recruitment 2026.",
      "Selection includes a computer-based test, physical endurance test and medical examination.",
      "Class 12 pass is the minimum qualification for the post.",
      "Candidates must meet the height, chest and physical standards prescribed for the post.",
      "Applications are accepted only through the official Delhi Police recruitment portal.",
    ],
    importantDates: [
      { label: "Notification released", date: "2026-10-18" },
      { label: "Application window opens", date: "2026-10-18" },
      { label: "Last date to apply", date: "2026-11-16" },
      { label: "Computer-based test", date: "2026-12-20", note: "Indicative" },
      { label: "Physical endurance test", date: "2027-02-10" },
      { label: "Medical examination", date: "2027-04-15" },
    ],
    posts: [
      { name: "Constable (Executive) – Male", vacancies: 2400, qualification: "Class 12" },
      { name: "Constable (Executive) – Female", vacancies: 600, qualification: "Class 12" },
    ],
    selectionProcess: [
      "Computer-based test (objective)",
      "Physical endurance and measurement test",
      "Medical examination",
      "Document verification and final merit list",
    ],
    howToApply: [
      "Open the Delhi Police recruitment portal and register with a valid mobile number.",
      "Fill the application form and upload a photograph and signature.",
      "Select the category and enter the physical measurements correctly.",
      "Pay the fee online and download the application receipt.",
    ],
    documents: DOCS_COMMON,
    eligibility: [
      "Class 12 pass from a recognised board.",
      "Age between 18 and 25 years as on the cut-off date; relaxation applies for reserved categories.",
      "Minimum height of 170 cm for male and 157 cm for female candidates (relaxation as notified).",
      "Candidates must qualify the physical endurance test.",
    ],
    officialLinks: [
      { label: "Delhi Police recruitment", url: "https://www.delhipolice.gov.in/" },
      { label: "Delhi Police main website", url: "https://www.delhipolice.gov.in/" },
    ],
  },

  "bpsc-71st-combined-exam-2026": {
    notificationUrl: "https://www.bpsc.bih.nic.in/",
    highlights: [
      "BPSC has released the notification for the 71st Combined Competitive Examination.",
      "The exam selects candidates for Bihar Administrative Service and other state services.",
      "Selection is through Prelims, Mains and an interview.",
      "Graduation in any discipline is required for all posts.",
      "The application window is open for about three weeks on the BPSC portal.",
    ],
    importantDates: [
      { label: "Notification released", date: "2026-10-12" },
      { label: "Application window opens", date: "2026-10-12" },
      { label: "Last date to apply", date: "2026-11-08" },
      { label: "Preliminary examination", date: "2026-12-22" },
      { label: "Mains examination", date: "2027-04-10" },
      { label: "Interview", date: "2027-07-15" },
    ],
    posts: [
      { name: "Bihar Administrative Service", vacancies: 120, qualification: "Graduate" },
      { name: "Bihar Police Service", vacancies: 80, qualification: "Graduate" },
      { name: "Bihar Finance Service", vacancies: 40, qualification: "Graduate" },
      { name: "Other state services", vacancies: 160, qualification: "Graduate" },
    ],
    selectionProcess: [
      "Preliminary examination (objective)",
      "Mains examination (descriptive)",
      "Interview / personality test",
      "Final merit list",
    ],
    howToApply: [
      "Register on the BPSC online application portal.",
      "Fill the personal, educational and category details.",
      "Upload a photograph, signature and category certificate.",
      "Pay the fee online and download the submitted application.",
    ],
    documents: DOCS_COMMON,
    eligibility: [
      "Bachelor's degree in any discipline from a recognised university.",
      "Age between 20 and 37 years for the General category; relaxation for reserved categories.",
      "Candidates must be domiciled in Bihar for reserved category benefits.",
      "Final-year graduates may apply provisionally as per the notification.",
    ],
    officialLinks: [
      { label: "BPSC official website", url: "https://www.bpsc.bih.nic.in/" },
      { label: "BPSC online application", url: "https://www.bpsc.bih.nic.in/" },
    ],
  },

  "ugc-scholarship-2026": {
    notificationUrl: "https://scholarships.gov.in/",
    highlights: [
      "The UGC scholarship application window is open on the National Scholarship Portal.",
      "Schemes include SC/ST post-matric scholarships, fellowships and minority scholarships.",
      "Students can apply to multiple schemes through a single NSP registration.",
      "Aadhaar-linked bank account in the student's name is mandatory for disbursal.",
      "Institute verification must be completed before the portal closes.",
    ],
    importantDates: [
      { label: "Application window opens", date: "2026-10-01" },
      { label: "Last date for fresh applications", date: "2026-11-30" },
      { label: "Last date for institute verification", date: "2026-12-15" },
      { label: "Disbursal begins", date: "2027-01-15", note: "Direct benefit transfer" },
    ],
    posts: [],
    selectionProcess: [
      "Online application on the National Scholarship Portal",
      "Institute verification of enrolment and documents",
      "State / ministry approval",
      "Direct benefit transfer to the student's bank account",
    ],
    howToApply: [
      "Register on the National Scholarship Portal with Aadhaar and mobile number.",
      "Complete the student profile and upload the required documents.",
      "Select every scheme you are eligible for and submit the application.",
      "Ask your institute to verify the application before the deadline.",
      "Track the status in the NSP dashboard until disbursal.",
    ],
    documents: [
      "Aadhaar card",
      "Bank passbook with the student's name and account number",
      "Previous year marksheet",
      "Income certificate",
      "Caste / category certificate (if applicable)",
      "Bonafide certificate from the institution",
    ],
    eligibility: [
      "Indian citizen studying in a recognised institution.",
      "Family income within the limit set by the specific scheme.",
      "Aadhaar-linked bank account in the student's own name.",
      "Minimum attendance and academic progress as required by the scheme.",
    ],
    officialLinks: [
      { label: "National Scholarship Portal", url: "https://scholarships.gov.in/" },
      { label: "UGC scholarships", url: "https://www.ugc.gov.in/" },
      { label: "Ministry of Education", url: "https://www.education.gov.in/" },
    ],
  },
};

let updated = 0;
for (const job of jobs) {
  const extra = analysis[job.slug];
  if (!extra) continue;
  Object.assign(job, extra);
  job.updatedAt = new Date().toISOString();
  updated += 1;
}

fs.writeFileSync(file, `${JSON.stringify(jobs, null, 2)}\n`, "utf8");
console.log(`✓ Enriched ${updated} jobs with notification analysis`);
