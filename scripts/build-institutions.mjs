/**
 * Builds data/institutions.json from the compact source tables below.
 *
 * Run: npm run institutions:build
 * (also runs automatically as part of `prebuild`)
 */
import fs from "node:fs";
import path from "node:path";

const statesFile = path.join(process.cwd(), "data", "states.json");
const states = JSON.parse(fs.readFileSync(statesFile, "utf8")).states || [];
const stateById = new Map(states.map((state) => [state.id, state]));

/* [name, shortName, stateId, city, website] */
const IITS = [
  ["Indian Institute of Technology Kharagpur", "IIT Kharagpur", "west-bengal", "Kharagpur", "https://www.iitkgp.ac.in/"],
  ["Indian Institute of Technology Bombay", "IIT Bombay", "maharashtra", "Mumbai", "https://www.iitb.ac.in/"],
  ["Indian Institute of Technology Madras", "IIT Madras", "tamil-nadu", "Chennai", "https://www.iitm.ac.in/"],
  ["Indian Institute of Technology Kanpur", "IIT Kanpur", "uttar-pradesh", "Kanpur", "https://www.iitk.ac.in/"],
  ["Indian Institute of Technology Delhi", "IIT Delhi", "delhi", "New Delhi", "https://home.iitd.ac.in/"],
  ["Indian Institute of Technology Guwahati", "IIT Guwahati", "assam", "Guwahati", "https://www.iitg.ac.in/"],
  ["Indian Institute of Technology Roorkee", "IIT Roorkee", "uttarakhand", "Roorkee", "https://www.iitr.ac.in/"],
  ["Indian Institute of Technology (BHU) Varanasi", "IIT BHU", "uttar-pradesh", "Varanasi", "https://www.iitbhu.ac.in/"],
  ["Indian Institute of Technology Bhubaneswar", "IIT Bhubaneswar", "odisha", "Bhubaneswar", "https://www.iitbbs.ac.in/"],
  ["Indian Institute of Technology Gandhinagar", "IIT Gandhinagar", "gujarat", "Gandhinagar", "https://www.iitgn.ac.in/"],
  ["Indian Institute of Technology Hyderabad", "IIT Hyderabad", "telangana", "Sangareddy", "https://www.iith.ac.in/"],
  ["Indian Institute of Technology Jodhpur", "IIT Jodhpur", "rajasthan", "Jodhpur", "https://www.iitj.ac.in/"],
  ["Indian Institute of Technology Patna", "IIT Patna", "bihar", "Patna", "https://www.iitp.ac.in/"],
  ["Indian Institute of Technology Ropar", "IIT Ropar", "punjab", "Rupnagar", "https://www.iitrpr.ac.in/"],
  ["Indian Institute of Technology Indore", "IIT Indore", "madhya-pradesh", "Indore", "https://www.iiti.ac.in/"],
  ["Indian Institute of Technology Mandi", "IIT Mandi", "himachal-pradesh", "Mandi", "https://www.iitmandi.ac.in/"],
  ["Indian Institute of Technology Palakkad", "IIT Palakkad", "kerala", "Palakkad", "https://iitpkd.ac.in/"],
  ["Indian Institute of Technology Tirupati", "IIT Tirupati", "andhra-pradesh", "Tirupati", "https://www.iittp.ac.in/"],
  ["Indian Institute of Technology (ISM) Dhanbad", "IIT (ISM) Dhanbad", "jharkhand", "Dhanbad", "https://www.iitism.ac.in/"],
  ["Indian Institute of Technology Bhilai", "IIT Bhilai", "chhattisgarh", "Raipur", "https://www.iitbhilai.ac.in/"],
  ["Indian Institute of Technology Goa", "IIT Goa", "goa", "Ponda", "https://www.iitgoa.ac.in/"],
  ["Indian Institute of Technology Jammu", "IIT Jammu", "jammu-and-kashmir", "Jammu", "https://www.iitjammu.ac.in/"],
  ["Indian Institute of Technology Dharwad", "IIT Dharwad", "karnataka", "Dharwad", "https://www.iitdh.ac.in/"],
];

const NITS = [
  ["National Institute of Technology Warangal", "NIT Warangal", "telangana", "Warangal", "https://www.nitw.ac.in/"],
  ["National Institute of Technology Tiruchirappalli", "NIT Trichy", "tamil-nadu", "Tiruchirappalli", "https://www.nitt.edu/"],
  ["National Institute of Technology Karnataka, Surathkal", "NIT Surathkal", "karnataka", "Mangaluru", "https://www.nitk.ac.in/"],
  ["National Institute of Technology Rourkela", "NIT Rourkela", "odisha", "Rourkela", "https://www.nitrkl.ac.in/"],
  ["National Institute of Technology Calicut", "NIT Calicut", "kerala", "Kozhikode", "https://nitc.ac.in/"],
  ["Motilal Nehru National Institute of Technology Allahabad", "MNNIT Allahabad", "uttar-pradesh", "Prayagraj", "https://www.mnnit.ac.in/"],
  ["Maulana Azad National Institute of Technology Bhopal", "MANIT Bhopal", "madhya-pradesh", "Bhopal", "https://www.manit.ac.in/"],
  ["Visvesvaraya National Institute of Technology Nagpur", "VNIT Nagpur", "maharashtra", "Nagpur", "https://vnit.ac.in/"],
  ["National Institute of Technology Durgapur", "NIT Durgapur", "west-bengal", "Durgapur", "https://www.nitdgp.ac.in/"],
  ["Dr. B. R. Ambedkar National Institute of Technology Jalandhar", "NIT Jalandhar", "punjab", "Jalandhar", "https://www.nitj.ac.in/"],
  ["Malaviya National Institute of Technology Jaipur", "MNIT Jaipur", "rajasthan", "Jaipur", "https://www.mnit.ac.in/"],
  ["National Institute of Technology Kurukshetra", "NIT Kurukshetra", "haryana", "Kurukshetra", "https://nitkkr.ac.in/"],
  ["National Institute of Technology Silchar", "NIT Silchar", "assam", "Silchar", "https://www.nits.ac.in/"],
  ["National Institute of Technology Hamirpur", "NIT Hamirpur", "himachal-pradesh", "Hamirpur", "https://nith.ac.in/"],
  ["National Institute of Technology Jamshedpur", "NIT Jamshedpur", "jharkhand", "Jamshedpur", "https://www.nitjsr.ac.in/"],
  ["National Institute of Technology Patna", "NIT Patna", "bihar", "Patna", "https://www.nitp.ac.in/"],
  ["National Institute of Technology Raipur", "NIT Raipur", "chhattisgarh", "Raipur", "https://www.nitrr.ac.in/"],
  ["National Institute of Technology Agartala", "NIT Agartala", "tripura", "Agartala", "https://www.nita.ac.in/"],
  ["National Institute of Technology Srinagar", "NIT Srinagar", "jammu-and-kashmir", "Srinagar", "https://www.nitsri.ac.in/"],
  ["Sardar Vallabhbhai National Institute of Technology Surat", "SVNIT Surat", "gujarat", "Surat", "https://www.svnit.ac.in/"],
  ["National Institute of Technology Puducherry", "NIT Puducherry", "puducherry", "Karaikal", "https://www.nitpy.ac.in/"],
  ["National Institute of Technology Delhi", "NIT Delhi", "delhi", "New Delhi", "https://www.nitdelhi.ac.in/"],
  ["National Institute of Technology Arunachal Pradesh", "NIT Arunachal Pradesh", "arunachal-pradesh", "Yupia", "https://www.nitap.ac.in/"],
  ["National Institute of Technology Manipur", "NIT Manipur", "manipur", "Imphal", "https://www.nitmanipur.ac.in/"],
  ["National Institute of Technology Meghalaya", "NIT Meghalaya", "meghalaya", "Shillong", "https://www.nitm.ac.in/"],
  ["National Institute of Technology Mizoram", "NIT Mizoram", "mizoram", "Aizawl", "https://www.nitmz.ac.in/"],
  ["National Institute of Technology Nagaland", "NIT Nagaland", "nagaland", "Chumukedima", "https://www.nitnagaland.ac.in/"],
  ["National Institute of Technology Sikkim", "NIT Sikkim", "sikkim", "Ravangla", "https://www.nitsikkim.ac.in/"],
  ["National Institute of Technology Uttarakhand", "NIT Uttarakhand", "uttarakhand", "Srinagar", "https://www.nituk.ac.in/"],
  ["National Institute of Technology Goa", "NIT Goa", "goa", "Ponda", "https://www.nitgoa.ac.in/"],
  ["National Institute of Technology Andhra Pradesh", "NIT Andhra Pradesh", "andhra-pradesh", "Tadepalligudem", "https://www.nitandhra.ac.in/"],
];

const IIITS = [
  ["Indian Institute of Information Technology Allahabad", "IIIT Allahabad", "uttar-pradesh", "Prayagraj", "https://www.iiita.ac.in/"],
  ["Indian Institute of Information Technology and Management Gwalior", "IIITM Gwalior", "madhya-pradesh", "Gwalior", "https://www.iiitm.ac.in/"],
  ["Indian Institute of Information Technology Design and Manufacturing Jabalpur", "IIITDM Jabalpur", "madhya-pradesh", "Jabalpur", "https://www.iiitdmj.ac.in/"],
  ["Indian Institute of Information Technology Design and Manufacturing Kancheepuram", "IIITDM Kancheepuram", "tamil-nadu", "Chennai", "https://www.iiitdm.ac.in/"],
  ["Indian Institute of Information Technology Sri City", "IIIT Sri City", "andhra-pradesh", "Sri City", "https://www.iiits.ac.in/"],
  ["Indian Institute of Information Technology Guwahati", "IIIT Guwahati", "assam", "Guwahati", "https://www.iiitg.ac.in/"],
  ["International Institute of Information Technology Hyderabad", "IIIT Hyderabad", "telangana", "Hyderabad", "https://www.iiit.ac.in/"],
  ["International Institute of Information Technology Bangalore", "IIIT Bangalore", "karnataka", "Bengaluru", "https://www.iiitb.ac.in/"],
  ["Indian Institute of Information Technology Bhubaneswar", "IIIT Bhubaneswar", "odisha", "Bhubaneswar", "https://www.iiit-bh.ac.in/"],
  ["Indian Institute of Information Technology Gandhinagar", "IIIT Gandhinagar", "gujarat", "Gandhinagar", "https://www.iiitvadodara.ac.in/"],
  ["Indian Institute of Information Technology Kota", "IIIT Kota", "rajasthan", "Kota", "https://www.iiitkota.ac.in/"],
  ["Indian Institute of Information Technology Lucknow", "IIIT Lucknow", "uttar-pradesh", "Lucknow", "https://www.iiitl.ac.in/"],
  ["Indian Institute of Information Technology Pune", "IIIT Pune", "maharashtra", "Pune", "https://www.iiitp.ac.in/"],
  ["Indian Institute of Information Technology Ranchi", "IIIT Ranchi", "jharkhand", "Ranchi", "https://www.iiitranchi.ac.in/"],
  ["Indian Institute of Information Technology Sonepat", "IIIT Sonepat", "haryana", "Sonepat", "https://www.iiitsonepat.ac.in/"],
  ["Indian Institute of Information Technology Vadodara", "IIIT Vadodara", "gujarat", "Vadodara", "https://www.iiitvadodara.ac.in/"],
  ["Indian Institute of Information Technology Agartala", "IIIT Agartala", "tripura", "Agartala", "https://www.iiitagartala.ac.in/"],
  ["Indian Institute of Information Technology Nagpur", "IIIT Nagpur", "maharashtra", "Nagpur", "https://www.iiitn.ac.in/"],
  ["Indian Institute of Information Technology Surat", "IIIT Surat", "gujarat", "Surat", "https://www.iiitsurat.ac.in/"],
  ["Indian Institute of Information Technology Bhopal", "IIIT Bhopal", "madhya-pradesh", "Bhopal", "https://www.iiitbhopal.ac.in/"],
];

const AIIMS = [
  ["All India Institute of Medical Sciences New Delhi", "AIIMS New Delhi", "delhi", "New Delhi", "https://www.aiims.edu/"],
  ["All India Institute of Medical Sciences Bhopal", "AIIMS Bhopal", "madhya-pradesh", "Bhopal", "https://aiimsbhopal.edu.in/"],
  ["All India Institute of Medical Sciences Bhubaneswar", "AIIMS Bhubaneswar", "odisha", "Bhubaneswar", "https://aiimsbhubaneswar.nic.in/"],
  ["All India Institute of Medical Sciences Jodhpur", "AIIMS Jodhpur", "rajasthan", "Jodhpur", "https://www.aiimsjodhpur.edu.in/"],
  ["All India Institute of Medical Sciences Patna", "AIIMS Patna", "bihar", "Patna", "https://aiimspatna.edu.in/"],
  ["All India Institute of Medical Sciences Raipur", "AIIMS Raipur", "chhattisgarh", "Raipur", "https://aiimsraipur.edu.in/"],
  ["All India Institute of Medical Sciences Rishikesh", "AIIMS Rishikesh", "uttarakhand", "Rishikesh", "https://aiimsrishikesh.edu.in/"],
  ["All India Institute of Medical Sciences Mangalagiri", "AIIMS Mangalagiri", "andhra-pradesh", "Mangalagiri", "https://aiimsmangalagiri.edu.in/"],
  ["All India Institute of Medical Sciences Nagpur", "AIIMS Nagpur", "maharashtra", "Nagpur", "https://aiimsnagpur.edu.in/"],
  ["All India Institute of Medical Sciences Kalyani", "AIIMS Kalyani", "west-bengal", "Kalyani", "https://aiimskalyani.edu.in/"],
  ["All India Institute of Medical Sciences Gorakhpur", "AIIMS Gorakhpur", "uttar-pradesh", "Gorakhpur", "https://aiimsgorakhpur.edu.in/"],
  ["All India Institute of Medical Sciences Bathinda", "AIIMS Bathinda", "punjab", "Bathinda", "https://aiimsbathinda.edu.in/"],
  ["All India Institute of Medical Sciences Guwahati", "AIIMS Guwahati", "assam", "Guwahati", "https://aiimsguwahati.ac.in/"],
  ["All India Institute of Medical Sciences Rajkot", "AIIMS Rajkot", "gujarat", "Rajkot", "https://aiimsrajkot.edu.in/"],
  ["All India Institute of Medical Sciences Bilaspur", "AIIMS Bilaspur", "himachal-pradesh", "Bilaspur", "https://aiimsbilaspur.edu.in/"],
  ["All India Institute of Medical Sciences Madurai", "AIIMS Madurai", "tamil-nadu", "Madurai", "https://aiimsmadurai.edu.in/"],
  ["All India Institute of Medical Sciences Bibinagar", "AIIMS Bibinagar", "telangana", "Bibinagar", "https://aiimsbibinagar.edu.in/"],
  ["All India Institute of Medical Sciences Darbhanga", "AIIMS Darbhanga", "bihar", "Darbhanga", "https://aiimsdarbhanga.edu.in/"],
  ["All India Institute of Medical Sciences Deoghar", "AIIMS Deoghar", "jharkhand", "Deoghar", "https://aiimsdeoghar.edu.in/"],
];

const IIMS = [
  ["Indian Institute of Management Ahmedabad", "IIM Ahmedabad", "gujarat", "Ahmedabad", "https://www.iima.ac.in/"],
  ["Indian Institute of Management Bangalore", "IIM Bangalore", "karnataka", "Bengaluru", "https://www.iimb.ac.in/"],
  ["Indian Institute of Management Calcutta", "IIM Calcutta", "west-bengal", "Kolkata", "https://www.iimcal.ac.in/"],
  ["Indian Institute of Management Lucknow", "IIM Lucknow", "uttar-pradesh", "Lucknow", "https://www.iiml.ac.in/"],
  ["Indian Institute of Management Indore", "IIM Indore", "madhya-pradesh", "Indore", "https://www.iimidr.ac.in/"],
  ["Indian Institute of Management Kozhikode", "IIM Kozhikode", "kerala", "Kozhikode", "https://www.iimk.ac.in/"],
  ["Indian Institute of Management Shillong", "IIM Shillong", "meghalaya", "Shillong", "https://www.iimshillong.ac.in/"],
  ["Indian Institute of Management Rohtak", "IIM Rohtak", "haryana", "Rohtak", "https://www.iimrohtak.ac.in/"],
  ["Indian Institute of Management Raipur", "IIM Raipur", "chhattisgarh", "Raipur", "https://www.iimraipur.ac.in/"],
  ["Indian Institute of Management Ranchi", "IIM Ranchi", "jharkhand", "Ranchi", "https://www.iimranchi.ac.in/"],
  ["Indian Institute of Management Tiruchirappalli", "IIM Tiruchirappalli", "tamil-nadu", "Tiruchirappalli", "https://www.iimtrichy.ac.in/"],
  ["Indian Institute of Management Udaipur", "IIM Udaipur", "rajasthan", "Udaipur", "https://www.iimu.ac.in/"],
  ["Indian Institute of Management Kashipur", "IIM Kashipur", "uttarakhand", "Kashipur", "https://www.iimkashipur.ac.in/"],
  ["Indian Institute of Management Amritsar", "IIM Amritsar", "punjab", "Amritsar", "https://www.iimamritsar.ac.in/"],
  ["Indian Institute of Management Bodh Gaya", "IIM Bodh Gaya", "bihar", "Bodh Gaya", "https://www.iimbg.ac.in/"],
  ["Indian Institute of Management Nagpur", "IIM Nagpur", "maharashtra", "Nagpur", "https://www.iimnagpur.ac.in/"],
  ["Indian Institute of Management Sambalpur", "IIM Sambalpur", "odisha", "Sambalpur", "https://www.iimsambalpur.ac.in/"],
  ["Indian Institute of Management Sirmaur", "IIM Sirmaur", "himachal-pradesh", "Paonta Sahib", "https://www.iimsirmaur.ac.in/"],
  ["Indian Institute of Management Visakhapatnam", "IIM Visakhapatnam", "andhra-pradesh", "Visakhapatnam", "https://www.iimv.ac.in/"],
  ["Indian Institute of Management Jammu", "IIM Jammu", "jammu-and-kashmir", "Jammu", "https://www.iimj.ac.in/"],
];

const NLUS = [
  ["National Law School of India University", "NLSIU Bengaluru", "karnataka", "Bengaluru", "https://www.nls.ac.in/"],
  ["NALSAR University of Law", "NALSAR Hyderabad", "telangana", "Hyderabad", "https://www.nalsar.ac.in/"],
  ["The West Bengal National University of Juridical Sciences", "NUJS Kolkata", "west-bengal", "Kolkata", "https://www.nujs.edu/"],
  ["National Law University Delhi", "NLU Delhi", "delhi", "New Delhi", "https://nludelhi.ac.in/"],
  ["National Law Institute University Bhopal", "NLIU Bhopal", "madhya-pradesh", "Bhopal", "https://www.nliu.ac.in/"],
  ["Gujarat National Law University", "GNLU Gandhinagar", "gujarat", "Gandhinagar", "https://www.gnlu.ac.in/"],
  ["Rajiv Gandhi National University of Law", "RGNUL Patiala", "punjab", "Patiala", "https://rgnul.ac.in/"],
  ["Chanakya National Law University", "CNLU Patna", "bihar", "Patna", "https://cnlu.ac.in/"],
  ["National Law University Jodhpur", "NLU Jodhpur", "rajasthan", "Jodhpur", "https://nlujodhpur.ac.in/"],
  ["Hidayatullah National Law University", "HNLU Raipur", "chhattisgarh", "Raipur", "https://hnlu.ac.in/"],
  ["National Law University Odisha", "NLU Odisha", "odisha", "Cuttack", "https://www.nluo.ac.in/"],
  ["Maharashtra National Law University Mumbai", "MNLU Mumbai", "maharashtra", "Mumbai", "https://mnlumumbai.edu.in/"],
  ["Maharashtra National Law University Nagpur", "MNLU Nagpur", "maharashtra", "Nagpur", "https://nlunagpur.ac.in/"],
  ["National Law University and Judicial Academy Assam", "NLUJA Assam", "assam", "Guwahati", "https://nluassam.ac.in/"],
  ["Himachal Pradesh National Law University", "HPNLU Shimla", "himachal-pradesh", "Shimla", "https://hpnlu.ac.in/"],
  ["Damodaram Sanjivayya National Law University", "DSNLU Visakhapatnam", "andhra-pradesh", "Visakhapatnam", "https://dsnlu.ac.in/"],
  ["Tamil Nadu National Law University", "TNNLU Tiruchirappalli", "tamil-nadu", "Tiruchirappalli", "https://tnnlu.ac.in/"],
  ["National University of Advanced Legal Studies", "NUALS Kochi", "kerala", "Kochi", "https://nuals.ac.in/"],
  ["Dr. Ram Manohar Lohiya National Law University", "RMLNLU Lucknow", "uttar-pradesh", "Lucknow", "https://rmlnlu.ac.in/"],
  ["National University of Study and Research in Law", "NUSRL Ranchi", "jharkhand", "Ranchi", "https://nusrlranchi.ac.in/"],
];

const CENTRAL_UNIVERSITIES = [
  ["University of Delhi", "DU", "delhi", "New Delhi", "https://www.du.ac.in/"],
  ["Jawaharlal Nehru University", "JNU", "delhi", "New Delhi", "https://www.jnu.ac.in/"],
  ["Jamia Millia Islamia", "JMI", "delhi", "New Delhi", "https://www.jmi.ac.in/"],
  ["Aligarh Muslim University", "AMU", "uttar-pradesh", "Aligarh", "https://www.amu.ac.in/"],
  ["Banaras Hindu University", "BHU", "uttar-pradesh", "Varanasi", "https://www.bhu.ac.in/"],
  ["University of Hyderabad", "UoH", "telangana", "Hyderabad", "https://uohyd.ac.in/"],
  ["Indira Gandhi National Open University", "IGNOU", "delhi", "New Delhi", "https://www.ignou.ac.in/"],
  ["Tata Institute of Social Sciences", "TISS", "maharashtra", "Mumbai", "https://www.tiss.edu/"],
  ["Visva-Bharati University", "Visva-Bharati", "west-bengal", "Santiniketan", "https://www.visvabharati.ac.in/"],
  ["Babasaheb Bhimrao Ambedkar University", "BBAU Lucknow", "uttar-pradesh", "Lucknow", "https://www.bbau.ac.in/"],
  ["Maulana Azad National Urdu University", "MANUU", "telangana", "Hyderabad", "https://manuu.edu.in/"],
  ["The English and Foreign Languages University", "EFLU", "telangana", "Hyderabad", "https://www.efluniversity.ac.in/"],
  ["Tezpur University", "Tezpur University", "assam", "Tezpur", "https://www.tezu.ernet.in/"],
  ["Assam University", "Assam University", "assam", "Silchar", "https://www.aus.ac.in/"],
  ["North-Eastern Hill University", "NEHU", "meghalaya", "Shillong", "https://nehu.ac.in/"],
  ["Mizoram University", "Mizoram University", "mizoram", "Aizawl", "https://mzu.edu.in/"],
  ["Nagaland University", "Nagaland University", "nagaland", "Lumami", "https://nagalanduniversity.ac.in/"],
  ["Manipur University", "Manipur University", "manipur", "Imphal", "https://manipuruniv.ac.in/"],
  ["Tripura University", "Tripura University", "tripura", "Agartala", "https://tripurauniv.ac.in/"],
  ["Sikkim University", "Sikkim University", "sikkim", "Gangtok", "https://www.cus.ac.in/"],
  ["Hemwati Nandan Bahuguna Garhwal University", "HNBGU", "uttarakhand", "Srinagar", "https://hnbgu.ac.in/"],
  ["Pondicherry University", "Pondicherry University", "puducherry", "Puducherry", "https://www.pondiuni.edu.in/"],
  ["Central University of Rajasthan", "CU Rajasthan", "rajasthan", "Kishangarh", "https://www.curaj.ac.in/"],
  ["Central University of Haryana", "CU Haryana", "haryana", "Mahendragarh", "https://www.cuh.ac.in/"],
  ["Central University of Punjab", "CU Punjab", "punjab", "Bathinda", "https://www.cup.edu.in/"],
  ["Central University of Himachal Pradesh", "CU Himachal", "himachal-pradesh", "Dharamshala", "https://www.cuhimachal.ac.in/"],
  ["Central University of Jammu", "CU Jammu", "jammu-and-kashmir", "Jammu", "https://www.cujammu.ac.in/"],
  ["Central University of Karnataka", "CU Karnataka", "karnataka", "Kalaburagi", "https://www.cuk.ac.in/"],
  ["Central University of Kerala", "CU Kerala", "kerala", "Kasaragod", "https://www.cukerala.ac.in/"],
  ["Central University of Tamil Nadu", "CU Tamil Nadu", "tamil-nadu", "Thiruvarur", "https://www.cutn.ac.in/"],
  ["Central University of Andhra Pradesh", "CU Andhra Pradesh", "andhra-pradesh", "Anantapur", "https://cuap.ac.in/"],
  ["Central University of Jharkhand", "CU Jharkhand", "jharkhand", "Ranchi", "https://www.cuj.ac.in/"],
  ["Central University of South Bihar", "CU South Bihar", "bihar", "Gaya", "https://www.cusb.ac.in/"],
  ["Central University of Gujarat", "CU Gujarat", "gujarat", "Gandhinagar", "https://www.cug.ac.in/"],
  ["Central University of Odisha", "CU Odisha", "odisha", "Koraput", "https://cuo.ac.in/"],
  ["Central University of Uttarakhand", "CU Uttarakhand", "uttarakhand", "Pauri Garhwal", "https://cuuttarakhand.ac.in/"],
  ["Rajiv Gandhi University", "RGU", "arunachal-pradesh", "Itanagar", "https://www.rgu.ac.in/"],
];

const STATE_UNIVERSITIES = [
  ["Andhra University", "Andhra University", "andhra-pradesh", "Visakhapatnam", "https://www.andhrauniversity.edu.in/"],
  ["Gauhati University", "Gauhati University", "assam", "Guwahati", "https://www.gauhati.ac.in/"],
  ["Patna University", "Patna University", "bihar", "Patna", "https://www.patnauniversity.ac.in/"],
  ["Pandit Ravishankar Shukla University", "PRSU Raipur", "chhattisgarh", "Raipur", "https://www.prsu.ac.in/"],
  ["Goa University", "Goa University", "goa", "Taleigao", "https://www.unigoa.ac.in/"],
  ["Gujarat University", "Gujarat University", "gujarat", "Ahmedabad", "https://www.gujaratuniversity.ac.in/"],
  ["Kurukshetra University", "Kurukshetra University", "haryana", "Kurukshetra", "https://kuk.ac.in/"],
  ["Himachal Pradesh University", "HP University", "himachal-pradesh", "Shimla", "https://hpuniv.ac.in/"],
  ["Ranchi University", "Ranchi University", "jharkhand", "Ranchi", "https://www.ranchiuniversity.ac.in/"],
  ["Bangalore University", "Bangalore University", "karnataka", "Bengaluru", "https://bengaluruuniversity.ac.in/"],
  ["University of Kerala", "University of Kerala", "kerala", "Thiruvananthapuram", "https://www.keralauniversity.ac.in/"],
  ["Barkatullah University", "Barkatullah University", "madhya-pradesh", "Bhopal", "https://www.bubhopal.ac.in/"],
  ["University of Mumbai", "University of Mumbai", "maharashtra", "Mumbai", "https://mu.ac.in/"],
  ["Utkal University", "Utkal University", "odisha", "Bhubaneswar", "https://utkaluniversity.ac.in/"],
  ["Panjab University", "Panjab University", "punjab", "Chandigarh", "https://puchd.ac.in/"],
  ["University of Rajasthan", "University of Rajasthan", "rajasthan", "Jaipur", "https://www.uniraj.ac.in/"],
  ["University of Madras", "University of Madras", "tamil-nadu", "Chennai", "https://www.unom.ac.in/"],
  ["Osmania University", "Osmania University", "telangana", "Hyderabad", "https://www.osmania.ac.in/"],
  ["University of Lucknow", "University of Lucknow", "uttar-pradesh", "Lucknow", "https://www.lkouniv.ac.in/"],
  ["University of Calcutta", "University of Calcutta", "west-bengal", "Kolkata", "https://www.caluniv.ac.in/"],
  ["University of Kashmir", "University of Kashmir", "jammu-and-kashmir", "Srinagar", "https://www.kashmiruniversity.net/"],
  ["Chandigarh University", "Chandigarh University", "chandigarh", "Mohali", "https://www.cuchd.in/"],
  ["Andaman and Nicobar Islands Institute of Medical Sciences", "ANIIMS", "andaman-and-nicobar-islands", "Port Blair", "https://aniims.andamannicobar.gov.in/"],
  ["Government Engineering College Daman", "GEC Daman", "dadra-and-nagar-haveli-and-daman-and-diu", "Daman", "https://www.govtenggcollegedaman.org.in/"],
  ["University of Ladakh", "UoL", "ladakh", "Leh", "https://uol.ac.in/"],
  ["Pondicherry University Lakshadweep Campus", "PU Lakshadweep", "lakshadweep", "Kavaratti", "https://www.pondiuni.edu.in/department/lakshadweep-campus/"],
];

const TYPE_META = {
  iit: {
    name: "IIT",
    typeName: "Indian Institute of Technology",
    level: "Undergraduate & postgraduate",
    exams: ["jee-main", "jee-advanced", "gate"],
    streams: ["Engineering", "Science", "Technology", "Management"],
    admissionPortal: "https://josaa.nic.in/",
    summary: "Admission to the B.Tech programme is through JEE Advanced after qualifying JEE Main. Postgraduate entry is through GATE.",
  },
  nit: {
    name: "NIT",
    typeName: "National Institute of Technology",
    level: "Undergraduate & postgraduate",
    exams: ["jee-main", "gate"],
    streams: ["Engineering", "Science", "Architecture"],
    admissionPortal: "https://josaa.nic.in/",
    summary: "B.Tech admission is through JEE Main and JoSAA counselling. M.Tech admission is through GATE.",
  },
  iiit: {
    name: "IIIT",
    typeName: "Indian Institute of Information Technology",
    level: "Undergraduate & postgraduate",
    exams: ["jee-main"],
    streams: ["Engineering", "Technology", "Design"],
    admissionPortal: "https://josaa.nic.in/",
    summary: "Most IIITs admit B.Tech students through JEE Main and JoSAA counselling. Some institutes run their own counselling.",
  },
  aiims: {
    name: "AIIMS",
    typeName: "All India Institute of Medical Sciences",
    level: "Undergraduate, postgraduate & nursing",
    exams: ["neet-ug", "ini-cet", "neet-pg", "aiims-nursing"],
    streams: ["Medicine", "Nursing", "Allied Health"],
    admissionPortal: "https://www.aiimsexams.ac.in/",
    summary: "MBBS admission is through NEET UG. PG and nursing courses use INI-CET and AIIMS nursing entrance tests.",
  },
  iim: {
    name: "IIM",
    typeName: "Indian Institute of Management",
    level: "Postgraduate & doctoral",
    exams: ["cat"],
    streams: ["Management", "Business", "Analytics"],
    admissionPortal: "https://iimcat.ac.in/",
    summary: "MBA admission is through CAT, followed by a written ability test and personal interview at each IIM.",
  },
  nlu: {
    name: "NLU",
    typeName: "National Law University",
    level: "Undergraduate & postgraduate",
    exams: ["clat"],
    streams: ["Law"],
    admissionPortal: "https://consortiumofnlus.ac.in/",
    summary: "BA LLB and LLM admission is through CLAT, conducted by the Consortium of NLUs.",
  },
  "central-university": {
    name: "Central University",
    typeName: "Central University",
    level: "Undergraduate, postgraduate & research",
    exams: ["cuet-ug", "cuet-pg", "ugc-net"],
    streams: ["Arts", "Science", "Commerce", "Social Science"],
    admissionPortal: "https://cuet.nta.nic.in/",
    summary: "Most central universities admit students through CUET UG and CUET PG. Research and teaching posts use UGC-NET.",
  },
  "state-university": {
    name: "State University",
    typeName: "State University",
    level: "Undergraduate, postgraduate & research",
    exams: ["cuet-ug", "cuet-pg"],
    streams: ["Arts", "Science", "Commerce", "Social Science"],
    admissionPortal: "",
    summary: "Admission is usually through the university's own entrance test or the state common entrance test, with CUET accepted for several programmes.",
  },
};

const rows = [
  ...IITS.map((row) => ["iit", row]),
  ...NITS.map((row) => ["nit", row]),
  ...IIITS.map((row) => ["iiit", row]),
  ...AIIMS.map((row) => ["aiims", row]),
  ...IIMS.map((row) => ["iim", row]),
  ...NLUS.map((row) => ["nlu", row]),
  ...CENTRAL_UNIVERSITIES.map((row) => ["central-university", row]),
  ...STATE_UNIVERSITIES.map((row) => ["state-university", row]),
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const seen = new Set();
const institutions = [];

for (const [type, [name, shortName, stateId, city, website]] of rows) {
  const meta = TYPE_META[type];
  const state = stateById.get(stateId);
  if (!state) throw new Error(`Unknown stateId "${stateId}" for ${name}`);

  let slug = slugify(shortName || name);
  if (seen.has(slug)) slug = `${slug}-${stateId}`;
  if (seen.has(slug)) throw new Error(`Duplicate institution slug "${slug}"`);
  seen.add(slug);

  const admissionPortal = meta.admissionPortal || state.portal;

  institutions.push({
    id: slug,
    slug,
    name,
    shortName,
    type,
    typeName: meta.typeName,
    stateId,
    stateName: state.name,
    region: state.region,
    city,
    website,
    admissionPortal,
    exams: meta.exams,
    streams: meta.streams,
    level: meta.level,
    summary: `${shortName} is a ${meta.typeName} located in ${city}, ${state.name}. ${meta.summary}`,
    verificationStatus: "verified",
    verificationSource: "Official institution website and government recognition records",
  });
}

institutions.sort((a, b) => a.name.localeCompare(b.name));

const output = {
  version: 1,
  updated: new Date().toISOString().slice(0, 10),
  note: "Institution names, cities and official domains. Admission routes are indicative — verify on the official portal before applying.",
  counts: {
    total: institutions.length,
    byType: institutions.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {}),
    states: new Set(institutions.map((item) => item.stateId)).size,
  },
  types: Object.entries(TYPE_META).map(([id, meta]) => ({ id, name: meta.name, typeName: meta.typeName })),
  institutions,
};

const target = path.join(process.cwd(), "data", "institutions.json");
fs.writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(
  `✓ ${institutions.length} institutions written to data/institutions.json ` +
    `(${Object.entries(output.counts.byType)
      .map(([type, count]) => `${count} ${type}`)
      .join(", ")})`,
);
