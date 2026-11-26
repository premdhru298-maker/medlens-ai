import type {
  LanguageOption,
  ReportAnalysisResult,
  SampleReportPreset,
  SymptomTriageInput,
  SymptomTriageResult,
  UrgencyLevel,
} from "@/types/medical";

export const MEDICAL_DISCLAIMER =
  "Educational AI guidance only — NOT a medical diagnosis or prescription. Always consult a qualified physician for clinical decisions, and seek emergency care immediately for severe or sudden symptoms.";

export const MEDICAL_DISCLAIMER_HINGLISH =
  "Yeh sirf educational AI samajh ke liye hai — yeh medical diagnosis ya dawai ki salah nahi hai. Sahi ilaaj ke liye hamesha qualified doctor se milein, aur emergency symptoms mein turant hospital jayein.";

export const SAMPLE_REPORTS: SampleReportPreset[] = [
  {
    id: "cbc-anemia",
    label: "Complete Blood Count (CBC)",
    shortTag: "Low Hb / Mild Anemia",
    reportType: "Hematology - Complete Blood Count",
    rawText: `PATIENT LAB REPORT - COMPLETE BLOOD COUNT (CBC)
Hemoglobin (Hb): 10.4 g/dL (Ref: 13.0 - 17.0 g/dL) [LOW]
RBC Count: 4.1 million/uL (Ref: 4.5 - 5.9 million/uL) [LOW]
MCV (Mean Corpuscular Volume): 74 fL (Ref: 80 - 100 fL) [LOW]
WBC (Total Leukocyte Count): 7,200 /uL (Ref: 4,000 - 11,000 /uL) [NORMAL]
Platelet Count: 245,000 /uL (Ref: 150,000 - 450,000 /uL) [NORMAL]
ESR: 22 mm/hr (Ref: 0 - 15 mm/hr) [HIGH]`,
  },
  {
    id: "lipid-hba1c",
    label: "Lipid Profile & HbA1c",
    shortTag: "Borderline Sugar & LDL",
    reportType: "Metabolic & Cardiovascular Panel",
    rawText: `METABOLIC & LIPID PANEL REPORT
HbA1c (Glycated Hemoglobin): 6.1 % (Ref: < 5.7% Normal, 5.7-6.4% Prediabetes) [BORDERLINE]
Fasting Blood Glucose: 112 mg/dL (Ref: 70 - 99 mg/dL) [HIGH]
Total Cholesterol: 218 mg/dL (Ref: < 200 mg/dL) [HIGH]
LDL Cholesterol (Bad): 142 mg/dL (Ref: < 100 mg/dL) [HIGH]
HDL Cholesterol (Good): 44 mg/dL (Ref: > 40 mg/dL) [NORMAL]
Triglycerides: 168 mg/dL (Ref: < 150 mg/dL) [BORDERLINE]`,
  },
  {
    id: "lft-panel",
    label: "Liver Function Test (LFT)",
    shortTag: "Mildly Elevated SGPT/SGOT",
    reportType: "Hepatic Panel - Liver Function Test",
    rawText: `LIVER FUNCTION TEST (LFT)
Total Bilirubin: 1.0 mg/dL (Ref: 0.2 - 1.2 mg/dL) [NORMAL]
Direct Bilirubin: 0.2 mg/dL (Ref: 0.0 - 0.3 mg/dL) [NORMAL]
SGOT (AST): 54 U/L (Ref: 10 - 40 U/L) [HIGH]
SGPT (ALT): 68 U/L (Ref: 7 - 56 U/L) [HIGH]
Alkaline Phosphatase (ALP): 98 U/L (Ref: 44 - 147 U/L) [NORMAL]
Serum Albumin: 4.3 g/dL (Ref: 3.5 - 5.0 g/dL) [NORMAL]`,
  },
];

export function generateDemoReportAnalysis(
  params: { sampleId?: string; reportText?: string; fileName?: string },
  language: LanguageOption
): ReportAnalysisResult {
  const isHinglish = language === "hinglish";
  const id = `rep_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const disclaimer = isHinglish
    ? MEDICAL_DISCLAIMER_HINGLISH
    : MEDICAL_DISCLAIMER;

  const detectedPreset =
    params.sampleId ||
    (params.reportText?.toLowerCase().includes("hba1c") ||
    params.reportText?.toLowerCase().includes("cholesterol")
      ? "lipid-hba1c"
      : params.reportText?.toLowerCase().includes("bilirubin") ||
          params.reportText?.toLowerCase().includes("sgpt")
        ? "lft-panel"
        : "cbc-anemia");

  if (detectedPreset === "lipid-hba1c") {
    return {
      id,
      timestamp,
      mode: "demo",
      language,
      reportTitle: params.fileName || "Lipid Profile & HbA1c Panel",
      reportType: "Metabolic & Cardiovascular Screening",
      overallSummary: isHinglish
        ? "Aapki report mein blood sugar (HbA1c 6.1%) prediabetes range mein hai aur LDL cholesterol thoda badha hua hai. Yeh early lifestyle stage hai jise diet aur exercise se kaafi had tak control kiya ja sakta hai."
        : "Your metabolic panel shows HbA1c in the prediabetes range (6.1%) along with elevated LDL cholesterol (142 mg/dL) and borderline triglycerides. These are modifiable cardiovascular risk markers that respond well to early medical and lifestyle guidance.",
      urgencyLevel: "schedule_soon",
      urgencyReason: isHinglish
        ? "Agle 1-2 hafton mein General Physician ya Endocrinologist se routine follow-up karwana sahi rahega."
        : "Schedule a routine appointment with a primary care physician within 1–2 weeks to build a prevention plan.",
      biomarkers: [
        {
          name: "HbA1c",
          observedValue: "6.1",
          unit: "%",
          referenceRange: "< 5.7%",
          status: "borderline",
          category: "Glycemic Control",
          plainExplanation: isHinglish
            ? "Pichle 3 mahine ka average blood sugar dikhata hai; 5.7–6.4% prediabetes range maani jaati hai."
            : "Reflects 3-month average blood sugar; 5.7–6.4% falls in the prediabetes zone.",
        },
        {
          name: "Fasting Blood Glucose",
          observedValue: "112",
          unit: "mg/dL",
          referenceRange: "70 - 99 mg/dL",
          status: "high",
          category: "Glycemic Control",
          plainExplanation: isHinglish
            ? "Khali pet sugar normal (99) se thodi zyada hai, jo insulin resistance ka sanket ho sakti hai."
            : "Slightly above normal fasting threshold (100–125 mg/dL indicates impaired fasting glucose).",
        },
        {
          name: "LDL Cholesterol",
          observedValue: "142",
          unit: "mg/dL",
          referenceRange: "< 100 mg/dL",
          status: "high",
          category: "Lipid Panel",
          plainExplanation: isHinglish
            ? "Ise 'bad cholesterol' kehte hain; zyada rehne par arteries mein jama ho sakta hai."
            : "Often called 'bad' cholesterol; elevated levels increase long-term plaque buildup risk.",
        },
        {
          name: "HDL Cholesterol",
          observedValue: "44",
          unit: "mg/dL",
          referenceRange: "> 40 mg/dL",
          status: "normal",
          category: "Lipid Panel",
          plainExplanation: isHinglish
            ? "Yeh 'good cholesterol' hai jo heart ko protect karne mein madad karta hai."
            : "Protective 'good' cholesterol within acceptable range; regular exercise can raise it further.",
        },
        {
          name: "Triglycerides",
          observedValue: "168",
          unit: "mg/dL",
          referenceRange: "< 150 mg/dL",
          status: "borderline",
          category: "Lipid Panel",
          plainExplanation: isHinglish
            ? "Blood mein maujood fats; meetha, refined carbs aur fried food kam karne se ghat-te hain."
            : "Blood fats that often rise with excess refined carbs or sugars; mildly elevated here.",
        },
      ],
      keyTakeaways: isHinglish
        ? [
            "HbA1c (6.1%) aur Fasting Glucose (112) dono early prediabetes ki taraf ishara kar rahe hain.",
            "Total aur LDL cholesterol target se upar hain — saturated fat aur sugary drinks kam karna zaroori hai.",
            "HDL protective range mein hai, jo ek positive baat hai.",
          ]
        : [
            "Both HbA1c (6.1%) and fasting glucose (112 mg/dL) point toward early prediabetes.",
            "LDL cholesterol (142 mg/dL) is above optimal (<100 mg/dL) and warrants dietary/clinical review.",
            "HDL remains within acceptable limits, offering baseline cardiovascular protection.",
          ],
      lifestyleGuidance: isHinglish
        ? [
            "Roz kam se kam 30 minute brisk walk ya moderate exercise shuru karein.",
            "Refined sugar, white bread/maida aur deep-fried snacks kam karke fiber (dal, sabzi, oats) badhayein.",
            "3 mahine baad doctor ki salah se repeat HbA1c aur Lipid test karwayein.",
          ]
        : [
            "Aim for 150 minutes/week of brisk walking or aerobic activity plus light strength training.",
            "Swap refined carbs and sugary drinks for high-fiber whole foods, vegetables, and healthy fats.",
            "Discuss a 3-month repeat HbA1c & fasting lipid recheck timeline with your physician.",
          ],
      doctorQuestions: isHinglish
        ? [
            "Kya abhi sirf diet aur exercise kaafi hai ya kisi preventive medicine ki zaroorat hai?",
            "Mera ideal LDL target meri age aur family history ke hisaab se kya hona chahiye?",
            "Mujhe repeat HbA1c aur Lipid test kitne mahine baad karwana chahiye?",
          ]
        : [
            "Given my age and risk factors, can we manage this initially with lifestyle changes alone?",
            "What is my personal target LDL cholesterol level?",
            "When should I schedule my follow-up HbA1c and lipid panel?",
          ],
      disclaimer,
    };
  }

  if (detectedPreset === "lft-panel") {
    return {
      id,
      timestamp,
      mode: "demo",
      language,
      reportTitle: params.fileName || "Liver Function Test (LFT)",
      reportType: "Hepatic Panel",
      overallSummary: isHinglish
        ? "Bilirubin aur Albumin bilkul normal hain, lekin liver enzymes SGOT (54) aur SGPT (68) halka sa badhe hue hain. Aksar fatty liver, recent viral infection, ya kuch painkillers/supplements ki wajah se aisa ho sakta hai."
        : "Your core liver synthetic and clearance markers (Bilirubin and Albumin) are completely normal, while liver enzymes SGOT (54 U/L) and SGPT (68 U/L) are mildly elevated. Mild elevations commonly occur with fatty liver, recent viral illness, or certain medications.",
      urgencyLevel: "schedule_soon",
      urgencyReason: isHinglish
        ? "Mild enzyme elevation ke liye 1-2 hafton mein doctor ko dikhayein; agar peeli aankhein (jaundice) ya tez pet dard ho toh turant milen."
        : "Review with a physician within 1–2 weeks for ultrasound or follow-up check; seek prompt care if yellowing of eyes or severe abdominal pain occurs.",
      biomarkers: [
        {
          name: "Total Bilirubin",
          observedValue: "1.0",
          unit: "mg/dL",
          referenceRange: "0.2 - 1.2 mg/dL",
          status: "normal",
          category: "Bile Clearance",
          plainExplanation: isHinglish
            ? "Normal range mein hai — jaundice ka koi sanket nahi dikhta."
            : "Within normal range, indicating no bilirubin buildup (no jaundice).",
        },
        {
          name: "SGOT (AST)",
          observedValue: "54",
          unit: "U/L",
          referenceRange: "10 - 40 U/L",
          status: "high",
          category: "Liver Enzymes",
          plainExplanation: isHinglish
            ? "Liver aur muscle cells mein paya jaane wala enzyme; halka badha hona mild liver strain dikhata hai."
            : "Enzyme found in liver and muscle tissue; mild elevation suggests temporary liver irritation or strain.",
        },
        {
          name: "SGPT (ALT)",
          observedValue: "68",
          unit: "U/L",
          referenceRange: "7 - 56 U/L",
          status: "high",
          category: "Liver Enzymes",
          plainExplanation: isHinglish
            ? "Liver ke liye sabse specific enzyme; fatty liver ya medication stress mein badh sakta hai."
            : "Liver-specific enzyme; mildly above upper limit, often linked to fatty liver or medication stress.",
        },
        {
          name: "Alkaline Phosphatase (ALP)",
          observedValue: "98",
          unit: "U/L",
          referenceRange: "44 - 147 U/L",
          status: "normal",
          category: "Biliary Ducts",
          plainExplanation: isHinglish
            ? "Normal hai — bile duct blockage ka sanket nahi hai."
            : "Normal level, suggesting bile ducts are functioning smoothly.",
        },
        {
          name: "Serum Albumin",
          observedValue: "4.3",
          unit: "g/dL",
          referenceRange: "3.5 - 5.0 g/dL",
          status: "normal",
          category: "Protein Synthesis",
          plainExplanation: isHinglish
            ? "Liver dwara banaya jaane wala main protein bilkul healthy level par hai."
            : "Healthy protein production by the liver, indicating preserved liver synthetic function.",
        },
      ],
      keyTakeaways: isHinglish
        ? [
            "Bilirubin, ALP aur Albumin normal hain — yeh accha sanket hai ki liver ka core function theek chal raha hai.",
            "SGOT/SGPT mild range (<2x upper limit) mein elevated hain.",
            "Doctor shayad abdomen ultrasound ya viral hepatitis screening recommend kar sakte hain.",
          ]
        : [
            "Bilirubin, ALP, and Albumin are normal, showing preserved core liver function.",
            "SGOT and SGPT are mildly elevated (<2x upper normal limit).",
            "Physicians often evaluate mild elevations alongside medication history and an abdominal ultrasound.",
          ],
      lifestyleGuidance: isHinglish
        ? [
            "Alcohol aur bina doctor ki salah ke painkillers/herbal supplements lena band rakhein.",
            "Oily, ultra-processed food aur excess sugar kam karein.",
            "Adequate paani piyen aur regular light exercise karein.",
          ]
        : [
            "Avoid alcohol and unnecessary over-the-counter pain relievers or unverified herbal supplements.",
            "Reduce added sugars, fried foods, and ultra-processed snacks.",
            "Maintain hydration and gradual, steady physical activity.",
          ],
      doctorQuestions: isHinglish
        ? [
            "Kya mujhe fatty liver check karne ke liye abdomen ultrasound karwana chahiye?",
            "Kya meri koi current dawai ya supplement SGPT badha sakti hai?",
            "Kitne hafton baad LFT repeat karwana sahi rahega?",
          ]
        : [
            "Should I get an abdominal ultrasound to check for fatty liver?",
            "Could any of my current medications or supplements be affecting AST/ALT?",
            "When should we repeat the liver enzyme panel?",
          ],
      disclaimer,
    };
  }

  return {
    id,
    timestamp,
    mode: "demo",
    language,
    reportTitle: params.fileName || "Complete Blood Count (CBC)",
    reportType: "Hematology - Complete Blood Count",
    overallSummary: isHinglish
      ? "Report mein Hemoglobin (10.4 g/dL) aur MCV (74 fL) normal se kam hain, jo mild microcytic anemia (aksar iron deficiency ki wajah se) ki taraf ishara karte hain. White blood cells (WBC) aur Platelets bilkul normal hain."
      : "Your CBC shows mildly reduced Hemoglobin (10.4 g/dL) alongside low MCV (74 fL), a common pattern seen in mild microcytic anemia (frequently related to iron deficiency). White blood cells and platelets are completely normal.",
    urgencyLevel: "schedule_soon",
    urgencyReason: isHinglish
      ? "Thakaan ya chakkar nahi hain toh 1 hafte ke andar doctor ko dikhayein; agar saans phoolna ya bahut kamzori ho toh jaldi milein."
      : "Book a routine clinic visit within 1 week to confirm the cause (such as iron studies); seek earlier care if experiencing dizziness or shortness of breath.",
    biomarkers: [
      {
        name: "Hemoglobin (Hb)",
        observedValue: "10.4",
        unit: "g/dL",
        referenceRange: "13.0 - 17.0 g/dL",
        status: "low",
        category: "Red Blood Cells",
        plainExplanation: isHinglish
          ? "Body mein oxygen le jaane wala protein kam hai — isi wajah se thakaan ya kamzori mehsoos ho sakti hai."
          : "Oxygen-carrying protein in red blood cells is mildly low, which can cause fatigue or low stamina.",
      },
      {
        name: "MCV",
        observedValue: "74",
        unit: "fL",
        referenceRange: "80 - 100 fL",
        status: "low",
        category: "RBC Indices",
        plainExplanation: isHinglish
          ? "Red blood cells ka average size thoda chhota hai (microcytic), jo aksar iron ki kami mein dekha jaata hai."
          : "Indicates smaller-than-average red blood cells, classically seen in iron deficiency or thalassemia trait.",
      },
      {
        name: "WBC Count",
        observedValue: "7,200",
        unit: "/uL",
        referenceRange: "4,000 - 11,000 /uL",
        status: "normal",
        category: "Immune Cells",
        plainExplanation: isHinglish
          ? "Infection se ladne wale white blood cells bilkul normal range mein hain."
          : "Infection-fighting white blood cells are well within the healthy normal range.",
      },
      {
        name: "Platelet Count",
        observedValue: "245,000",
        unit: "/uL",
        referenceRange: "150,000 - 450,000 /uL",
        status: "normal",
        category: "Clotting",
        plainExplanation: isHinglish
          ? "Blood clotting ke liye zaroori platelets ekdum normal hain."
          : "Healthy platelet count supporting normal blood clotting.",
      },
      {
        name: "ESR",
        observedValue: "22",
        unit: "mm/hr",
        referenceRange: "0 - 15 mm/hr",
        status: "high",
        category: "Inflammation",
        plainExplanation: isHinglish
          ? "Halka sa badha hua hai; anemia mein bhi ESR thoda upar aa sakta hai ya mild inflammation dikha sakta hai."
          : "Mildly elevated nonspecific marker; can be slightly raised alongside anemia or minor inflammation.",
      },
    ],
    keyTakeaways: isHinglish
      ? [
          "Low Hemoglobin + Low MCV ka combination aksar iron deficiency anemia mein milta hai.",
          "WBC aur Platelets normal hain, isliye active acute infection ya bleeding risk ka sign nahi dikh raha.",
          "Confirm karne ke liye doctor Serum Ferritin aur Iron Profile test bol sakte hain.",
        ]
      : [
          "Low hemoglobin combined with low MCV points toward mild microcytic anemia.",
          "Normal WBC and platelet counts are reassuring against broader bone marrow issues.",
          "Doctors typically order Serum Ferritin and Iron Studies before starting targeted supplements.",
        ],
    lifestyleGuidance: isHinglish
      ? [
          "Bina doctor se pooche iron ki high-dose tablets khud se shuru na karein.",
          "Iron-rich foods jaise palak, chana, rajma, dates aur Vitamin C (nimbu/amla) saath mein lein (Vitamin C iron absorption badhata hai).",
          "Khane ke turant baad chai ya coffee avoid karein kyunki woh iron absorption kam karti hai.",
        ]
      : [
          "Avoid self-prescribing iron pills until your doctor confirms ferritin levels.",
          "Include iron-rich foods (lentils, spinach, beans, lean meats) paired with Vitamin C (citrus/amla) to boost absorption.",
          "Avoid drinking tea or coffee right alongside iron-rich meals, as tannins reduce absorption.",
        ],
    doctorQuestions: isHinglish
      ? [
          "Kya mujhe Serum Ferritin, Iron Studies ya Vitamin B12 test karwana chahiye?",
          "Kya yeh anemia diet se theek hoga ya iron supplement ki zaroorat hogi?",
          "Kitne time baad CBC dobara check karwana chahiye?",
        ]
      : [
          "Should we test Serum Ferritin and Iron Profile to confirm the cause of low hemoglobin?",
          "Do I need oral iron supplementation, and for how long?",
          "When should we repeat the CBC to check recovery?",
        ],
    disclaimer,
  };
}

const EMERGENCY_KEYWORDS = [
  "chest pain",
  "chest tightness",
  "shortness of breath",
  "difficulty breathing",
  "can't breathe",
  "slurred speech",
  "face drooping",
  "one side weakness",
  "unconscious",
  "severe bleeding",
  "vomiting blood",
  "seizure",
  "suicidal",
  "saans nahi",
  "seene mein dard",
];

export function hasEmergencyRedFlags(input: SymptomTriageInput): boolean {
  const combined = `${input.symptoms.join(" ")} ${input.customDescription}`.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => combined.includes(kw));
}

export function generateDemoSymptomTriage(
  input: SymptomTriageInput
): SymptomTriageResult {
  const isHinglish = input.language === "hinglish";
  const id = `tri_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const disclaimer = isHinglish
    ? MEDICAL_DISCLAIMER_HINGLISH
    : MEDICAL_DISCLAIMER;

  const isEmergency = hasEmergencyRedFlags(input);
  let urgencyLevel: UrgencyLevel = "routine";
  if (isEmergency) {
    urgencyLevel = "emergency";
  } else if (input.severity >= 8) {
    urgencyLevel = "urgent";
  } else if (input.severity >= 5 || input.duration === "More than 1 week") {
    urgencyLevel = "schedule_soon";
  }

  const symptomSummary =
    [...input.symptoms, input.customDescription.trim()]
      .filter(Boolean)
      .join(", ") || "General discomfort";

  if (urgencyLevel === "emergency") {
    return {
      id,
      timestamp,
      mode: "demo",
      language: input.language,
      urgencyLevel: "emergency",
      urgencyHeadline: isHinglish
        ? "EMERGENCY ALERT: Turant Najdeeki Hospital / Emergency Room Jayein"
        : "EMERGENCY ALERT: Seek Immediate In-Person Emergency Care",
      summary: isHinglish
        ? `Aapke bataye symptoms (${symptomSummary}) mein high-risk warning signs shaamil hain. Online triage ka intezaar na karein — turant emergency medical help lein.`
        : `Your reported symptoms (${symptomSummary}) include potential red-flag indicators that require urgent, in-person medical evaluation without delay.`,
      possibleConsiderations: [
        {
          name: isHinglish
            ? "Acute Cardiopulmonary ya Neurological Evaluation Zaroori"
            : "Acute Cardiopulmonary or Neurological Cause to Rule Out",
          likelihoodNote: isHinglish ? "High Priority" : "Must rule out first",
          explanation: isHinglish
            ? "Chest pain, saans phoolna, ya sudden neurological symptoms ko pehle hospital mein ECG/vitals check karke rule-out karna zaroori hota hai."
            : "Symptoms such as chest pain, breathing difficulty, or sudden weakness require immediate vitals, ECG, or imaging in an ER.",
        },
      ],
      redFlags: isHinglish
        ? [
            "Emergency helpline call karein ya kisi ke saath turant ER jayein (khud drive na karein).",
            "Agar paseena aana, chakkar, ya dard baazu/jaw tak jaana mehsoos ho toh bilkul der na karein.",
          ]
        : [
            "Call local emergency services or have someone take you to the nearest ER immediately — do not drive yourself.",
            "Watch for worsening dizziness, cold sweats, fainting, or spreading pain.",
          ],
      safeHomeCare: isHinglish
        ? [
            "Shaanti se baith jayein ya aaramdayak position mein rahein jab tak medical help na pahunche.",
            "Bina doctor ki salah ke koi nayi dawai na lein.",
          ]
        : [
            "Sit or rest comfortably while waiting for emergency transport.",
            "Do not take unprescribed medications while awaiting emergency assessment.",
          ],
      recommendedSpecialist: isHinglish
        ? "Emergency Medicine / Nearest Hospital ER"
        : "Emergency Department (ER)",
      doctorQuestions: isHinglish
        ? [
            "Mere vitals aur ECG ki sthiti kya dikha rahi hai?",
            "Sabse pehle kaunse emergency tests kiye ja rahe hain?",
          ]
        : [
            "What do my initial vitals and ECG show?",
            "Which urgent tests are needed to rule out serious causes?",
          ],
      disclaimer,
    };
  }

  const combinedLower = symptomSummary.toLowerCase();
  const isRespiratory =
    combinedLower.includes("fever") ||
    combinedLower.includes("cough") ||
    combinedLower.includes("sore throat") ||
    combinedLower.includes("bukhar");
  const isDigestive =
    combinedLower.includes("stomach") ||
    combinedLower.includes("nausea") ||
    combinedLower.includes("acidity") ||
    combinedLower.includes("pet");

  return {
    id,
    timestamp,
    mode: "demo",
    language: input.language,
    urgencyLevel,
    urgencyHeadline:
      urgencyLevel === "urgent"
        ? isHinglish
          ? "24 Ghante ke Andar Doctor se Milein"
          : "See a Doctor Within 24 Hours"
        : urgencyLevel === "schedule_soon"
          ? isHinglish
            ? "Agle Kuch Dino Mein Clinic Visit Book Karein"
            : "Schedule a Doctor Visit Soon"
          : isHinglish
            ? "Self-Care & Monitor Karein (Agar Badhe Toh Doctor Se Milein)"
            : "Monitor & Self-Care (Visit Clinic If Worsening)",
    summary: isHinglish
      ? `Reported symptoms (${symptomSummary}) — duration: ${input.duration}, severity: ${input.severity}/10. Neeche non-diagnostic possibilities aur safety signs diye gaye hain.`
      : `Based on your reported symptoms (${symptomSummary}) over ${input.duration} at severity ${input.severity}/10, here are structured educational considerations and next steps.`,
    possibleConsiderations: isRespiratory
      ? [
          {
            name: isHinglish
              ? "Viral Upper Respiratory Infection (Common Viral)"
              : "Viral Upper Respiratory Tract Infection",
            likelihoodNote: isHinglish ? "Common possibility" : "Common consideration",
            explanation: isHinglish
              ? "Halka bukhar, khansi ya gala kharab aksar seasonal viral infection mein hota hai aur 3–5 din mein sudhar dikhne lagta hai."
              : "Fever, cough, and throat discomfort often reflect a self-limiting viral illness, especially in early days.",
          },
          {
            name: isHinglish
              ? "Bacterial Throat / Sinus Infection"
              : "Secondary Bacterial or Sinus Involvement",
            likelihoodNote: isHinglish ? "Check if persistent" : "Consider if persistent",
            explanation: isHinglish
              ? "Agar bukhar 3 din se zyada teez rahe ya gala bahut suja ho toh doctor physical exam se check karte hain."
              : "Persistent high fever beyond 72 hours or severe localized pain warrants clinical throat/chest exam.",
          },
        ]
      : isDigestive
        ? [
            {
              name: isHinglish
                ? "Gastritis / Acid Reflux ya Mild Gastroenteritis"
                : "Acute Gastritis or Mild Gastroenteritis",
              likelihoodNote: isHinglish ? "Common possibility" : "Common consideration",
              explanation: isHinglish
                ? "Pet dard ya nausea aksar acidity, spicy food, ya stomach bug se ho sakti hai; hydration sabse zaroori hai."
                : "Upper abdominal discomfort or nausea frequently stems from acid irritation or a mild stomach bug.",
            },
          ]
        : [
            {
              name: isHinglish
                ? "Viral Prodrome, Dehydration ya Stress-Related Fatigue"
                : "Mild Viral Illness, Dehydration, or Fatigue Syndrome",
              likelihoodNote: isHinglish ? "General consideration" : "Broad consideration",
              explanation: isHinglish
                ? "Sar dard, thakaan ya body ache neend ki kami, paani ki kami ya shuruati viral infection ki wajah se ho sakte hain."
                : "Non-specific symptoms like headache and fatigue often relate to hydration, sleep debt, or early viral recovery.",
            },
          ],
    redFlags: isHinglish
      ? [
          "102°F (38.9°C) se upar lagatar bukhar jo kam na ho",
          "Saans lene mein dikkat, seene mein dard, ya bahut zyada chakkar",
          "Lagatar ulti jisse paani bhi pet mein na ruke (dehydration)",
        ]
      : [
          "Persistent high fever above 102°F (38.9°C) not responding to rest",
          "Shortness of breath, chest pain, confusion, or severe dizziness",
          "Inability to keep fluids down for more than 24 hours",
        ],
    safeHomeCare: isHinglish
      ? [
          "Paani, ORS, ya halka garam fluid lete rahein taaki hydration bana rahe.",
          "Poori neend aur physical rest lein; heavy/oily khana kuch din avoid karein.",
          "Symptoms ka temperature aur time note karte rahein doctor ko dikhane ke liye.",
        ]
      : [
          "Stay well-hydrated with water, oral rehydration fluids, or clear broths.",
          "Prioritize rest and light, easily digestible meals.",
          "Track symptom progression (temperature, frequency) to share with your physician.",
        ],
    recommendedSpecialist: isHinglish
      ? "General Physician (Internal Medicine)"
      : "General Physician / Primary Care",
    doctorQuestions: isHinglish
      ? [
          "Kya in symptoms ke liye mujhe koi basic blood test ya swab karwana chahiye?",
          "Kaunse warning signs dikhne par mujhe turant follow-up karna chahiye?",
          "Kya meri existing health condition ke hisaab se koi specific precaution leni hai?",
        ]
      : [
          "Do these symptoms warrant any basic lab tests or physical screening?",
          "What warning signs mean I should return earlier than planned?",
          "Are there specific precautions given my medical history?",
        ],
    disclaimer,
  };
}
