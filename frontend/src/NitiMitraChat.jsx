import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleCheck,
  ExternalLink,
  FileDown,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  SlidersHorizontal,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  Square,
  Volume2,
} from "lucide-react";

const API_ENDPOINT = import.meta.env.VITE_API_URL || "";

const LANGUAGES = [
  { name: "English", label: "English", code: "en-IN" },
  { name: "Hindi", label: "Hindi / हिंदी", code: "hi-IN" },
  { name: "Telugu", label: "Telugu / తెలుగు", code: "te-IN" },
  { name: "Tamil", label: "Tamil / தமிழ்", code: "ta-IN" },
  { name: "Kannada", label: "Kannada / ಕನ್ನಡ", code: "kn-IN" },
];

const SPEECH_LOCALES = {
  English: "en-IN",
  Telugu: "te-IN",
  Kannada: "kn-IN",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
};

const INITIAL_PROFILE = {
  age: "",
  annualIncome: "< 1 Lakh",
  landHoldingAcres: 0,
  occupation: "",
  socialCategory: "General",
  state: "All India",
};

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Namaste! I am NitiMitra, your guide to government welfare schemes. Ask me about a scheme, eligibility, required documents, or its official application portal.",
};

const WELCOME_MESSAGES = {
  English: "Namaste! I am NitiMitra, your guide to government welfare schemes. Ask me about a scheme, eligibility, required documents, or its official application portal.",
  Hindi: "नमस्ते! मैं नीति मित्र हूं, सरकारी कल्याण योजनाओं के बारे में आपका मार्गदर्शक। किसी योजना, पात्रता, आवश्यक दस्तावेज या आधिकारिक आवेदन पोर्टल के बारे में पूछें।",
  Telugu: "నమస్కారం! నేను నీతి మిత్రను, ప్రభుత్వ సంక్షేమ పథకాలపై మీకు మార్గదర్శిని. పథకం, అర్హత, అవసరమైన పత్రాలు లేదా అధికారిక దరఖాస్తు పోర్టల్ గురించి అడగండి.",
  Tamil: "வணக்கம்! நான் நிதிமித்ரா, அரசு நலத்திட்டங்களுக்கு உங்களின் வழிகாட்டி. திட்டம், தகுதி, தேவையான ஆவணங்கள் அல்லது அதிகாரப்பூர்வ விண்ணப்ப இணையதளம் பற்றி கேளுங்கள்.",
  Kannada: "ನಮಸ್ಕಾರ! ನಾನು ನೀತಿಮಿತ್ರ, ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳ ಕುರಿತು ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಿ. ಯೋಜನೆ, ಅರ್ಹತೆ, ಅಗತ್ಯ ದಾಖಲೆಗಳು ಅಥವಾ ಅಧಿಕೃತ ಅರ್ಜಿ ಪೋರ್ಟಲ್ ಕುರಿತು ಕೇಳಿ.",
};

const STARTER_PROMPTS = [
  "Which schemes can help farmers?",
  "Am I eligible for PM-KISAN?",
  "What documents do I need for a pension scheme?",
];

const DEMO_RESPONSES = {
  English: {
    content: `Overview
PM-KISAN is an income-support scheme for eligible farmer families. This demo answer is illustrative; verify details on the official portal.

Eligibility Criteria
- The applicant should belong to an eligible farmer family with cultivable land records.
- Land and beneficiary details must match State or Union Territory records.
- Institutional landholders and excluded higher-income categories may not qualify.

Required Documents Checklist
- Aadhaar card or another accepted identity document
- Bank account details linked to the beneficiary
- Land ownership or cultivation records
- Active mobile number for status updates

Official Portal Link
Visit https://pmkisan.gov.in/ to check eligibility, beneficiary status, and application guidance.`,
  },
  Hindi: {
    content: `अवलोकन
PM-KISAN पात्र किसान परिवारों के लिए आय सहायता योजना है। यह डेमो उत्तर केवल उदाहरण है; आधिकारिक पोर्टल पर जानकारी जांचें।

पात्रता मानदंड
- आवेदक पात्र किसान परिवार का सदस्य होना चाहिए और उसके पास खेती योग्य भूमि का रिकॉर्ड होना चाहिए।
- भूमि और लाभार्थी का विवरण सरकारी रिकॉर्ड से मेल खाना चाहिए।
- कुछ संस्थागत भूमि धारक और अधिक आय वाली श्रेणियां पात्र नहीं हो सकती हैं।

आवश्यक दस्तावेज चेकलिस्ट
- आधार कार्ड या स्वीकृत पहचान दस्तावेज
- लाभार्थी से जुड़ा बैंक खाता विवरण
- भूमि स्वामित्व या खेती का रिकॉर्ड
- स्थिति अपडेट के लिए सक्रिय मोबाइल नंबर

आधिकारिक पोर्टल लिंक
पात्रता और लाभार्थी स्थिति के लिए https://pmkisan.gov.in/ पर जाएं।`,
  },
  Telugu: {
    content: `అవలోకనం
PM-KISAN అర్హత ఉన్న రైతు కుటుంబాలకు ఆదాయ సహాయ పథకం. ఇది డెమో సమాధానం మాత్రమే; అధికారిక పోర్టల్‌లో వివరాలను నిర్ధారించండి.

అర్హత ప్రమాణాలు
- దరఖాస్తుదారు సాగు చేయదగిన భూమి రికార్డు ఉన్న అర్హత కలిగిన రైతు కుటుంబానికి చెందినవారు కావాలి.
- భూమి మరియు లబ్ధిదారు వివరాలు ప్రభుత్వ రికార్డులతో సరిపోవాలి.
- కొన్ని సంస్థాగత భూమి యజమానులు అర్హులు కాకపోవచ్చు.

అవసరమైన పత్రాల చెక్‌లిస్ట్
- ఆధార్ కార్డు లేదా అంగీకరించిన గుర్తింపు పత్రం
- లబ్ధిదారుని పేరుతో ఉన్న బ్యాంక్ ఖాతా వివరాలు
- భూమి యాజమాన్య లేదా సాగు రికార్డులు
- స్థితి సమాచారం కోసం మొబైల్ నంబర్

అధికారిక పోర్టల్ లింక్
అర్హత మరియు లబ్ధిదారు స్థితి కోసం https://pmkisan.gov.in/ సందర్శించండి.`,
  },
  Tamil: {
    content: `மேலோட்டம்
PM-KISAN தகுதியுள்ள விவசாயக் குடும்பங்களுக்கு வருமான உதவி வழங்கும் திட்டமாகும். இது டெமோ பதில் மட்டுமே; அதிகாரப்பூர்வ இணையதளத்தில் சரிபார்க்கவும்.

தகுதி நிபந்தனைகள்
- விண்ணப்பதாரர் பயிரிடக்கூடிய நிலப் பதிவுகளைக் கொண்ட தகுதியுள்ள விவசாயக் குடும்பத்தைச் சேர்ந்தவராக இருக்க வேண்டும்.
- நிலம் மற்றும் பயனாளி விவரங்கள் அரசு பதிவுகளுடன் பொருந்த வேண்டும்.
- சில நிறுவன நில உரிமையாளர்கள் தகுதி பெறாமல் இருக்கலாம்.

தேவையான ஆவணங்கள் சரிபார்ப்புப் பட்டியல்
- ஆதார் அட்டை அல்லது ஏற்றுக்கொள்ளப்பட்ட அடையாள ஆவணம்
- பயனாளியுடன் இணைக்கப்பட்ட வங்கிக் கணக்கு விவரங்கள்
- நில உரிமை அல்லது சாகுபடி பதிவுகள்
- நிலைத் தகவல்களுக்கு மொபைல் எண்

அதிகாரப்பூர்வ இணையதள இணைப்பு
தகுதி மற்றும் பயனாளி நிலையை அறிய https://pmkisan.gov.in/ செல்லவும்.`,
  },
  Kannada: {
    content: `ಅವಲೋಕನ
PM-KISAN ಅರ್ಹ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ಆದಾಯ ಸಹಾಯ ನೀಡುವ ಯೋಜನೆಯಾಗಿದೆ. ಇದು ಡೆಮೋ ಉತ್ತರ ಮಾತ್ರ; ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.

ಅರ್ಹತಾ ಮಾನದಂಡಗಳು
- ಅರ್ಜಿದಾರರು ಕೃಷಿ ಯೋಗ್ಯ ಭೂಮಿ ದಾಖಲೆಗಳನ್ನು ಹೊಂದಿರುವ ಅರ್ಹ ರೈತ ಕುಟುಂಬಕ್ಕೆ ಸೇರಿದವರಾಗಿರಬೇಕು.
- ಭೂಮಿ ಮತ್ತು ಫಲಾನುಭವಿ ವಿವರಗಳು ರಾಜ್ಯ ಅಥವಾ ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶದ ದಾಖಲೆಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗಬೇಕು.
- ಕೆಲವು ಸಂಸ್ಥೆಯ ಭೂ ಮಾಲೀಕರು ಅರ್ಹರಾಗಿರದಿರಬಹುದು.

ಅಗತ್ಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ
- ಆಧಾರ್ ಕಾರ್ಡ್ ಅಥವಾ ಸ್ವೀಕೃತ ಗುರುತಿನ ದಾಖಲೆ
- ಫಲಾನುಭವಿಗೆ ಸಂಪರ್ಕ ಹೊಂದಿರುವ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು
- ಭೂ ಮಾಲೀಕತ್ವ ಅಥವಾ ಕೃಷಿ ದಾಖಲೆಗಳು
- ಸ್ಥಿತಿ ಮಾಹಿತಿಗಾಗಿ ಸಕ್ರಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ

ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಲಿಂಕ್
ಅರ್ಹತೆ ಮತ್ತು ಫಲಾನುಭವಿ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲು https://pmkisan.gov.in/ ಗೆ ಭೇಟಿ ನೀಡಿ.`,
  },
};

function splitAssistantSections(content) {
  const sections = [];
  let current = { title: "", lines: [] };

  content.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;

    const heading = line.match(
      /^(?:\d+[.)]\s*)?(overview|eligibility(?: criteria)?|required documents(?: checklist)?|documents|official portal link|application link|status guidance|application status|अवलोकन|पात्रता मानदंड|आवश्यक दस्तावेज(?: चेकलिस्ट)?|आधिकारिक पोर्टल लिंक|అవలోకనం|అర్హత ప్రమాణాలు|అవసరమైన పత్రాల చెక్‌లిస్ట్|అధికారిక పోర్టల్ లింక్|மேலோட்டம்|தகுதி நிபந்தனைகள்|தேவையான ஆவணங்கள் சரிபார்ப்புப் பட்டியல்|அதிகாரப்பூர்வ இணையதள இணைப்பு|ಅವಲೋಕನ|ಅರ್ಹತಾ ಮಾನದಂಡಗಳು|ಅಗತ್ಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ|ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಲಿಂಕ್)\s*:?[\s]*$/i,
    );
    if (heading) {
      if (current.title || current.lines.length) sections.push(current);
      current = { title: heading[1], lines: [] };
      return;
    }
    current.lines.push(line);
  });

  if (current.title || current.lines.length) sections.push(current);
  return sections;
}

function isDocumentsSection(title) {
  return /document|दस्तावेज|పತ್ರ|ஆவண|ದಾಖಲೆ/i.test(title || "");
}

const STATUS_GUIDANCE = `Status Guidance
- Open https://pmkisan.gov.in/ and choose "Know Your Status".
- Use your Registration Number or registered mobile number, then complete the OTP verification.
- If an installment is delayed, check e-KYC completion, Land Seeding status, and NPCI/DBT bank seeding.
- For unresolved issues, visit your local CSC or agriculture office with generic identity and land documents. Never share ID numbers in chat.`;

function demoIntentResponse(query, profile) {
  const normalizedQuery = query.toLowerCase();
  if (/track application status|status|installment|kyc/i.test(normalizedQuery)) return STATUS_GUIDANCE;
  if (/check my eligibility|eligibility/i.test(normalizedQuery)) {
    const age = Number(profile.age);
    const landHolding = Number(profile.landHoldingAcres);
    if (profile.age && age < 18) return "As a minor (under 18), you cannot apply independently for PM-KISAN. However, your parents can apply as a family unit if cultivable land is registered in their name. Would you like to check if your parents qualify?";
    if (landHolding === 0) return "PM-KISAN requires cultivable landholding registered in revenue records. Since you do not own land, you may not qualify for PM-KISAN, but you may be eligible for agricultural worker schemes like PM-SYM or MGNREGA.";
    return "Your profile suggests a possible PM-KISAN eligibility path because a cultivable landholding is recorded. I still need to confirm scheme exclusions and official records from the Knowledge Base before giving a final verdict. Would you like to review the required documents?";
  }
  return null;
}

function extractSchemeName(overview) {
  const firstSentence = overview.match(/^(.+?)(?:\.|$)/)?.[1] || overview;
  return firstSentence.match(/^([A-Z][A-Za-z0-9-]*(?:\s+[A-Z][A-Za-z0-9-]*){0,4})\s+(?:is|provides|offers)\b/i)?.[1]
    || firstSentence.match(/\b[A-Z][A-Z0-9]+(?:-[A-Z0-9]+)?\b/)?.[0]
    || "Welfare Scheme";
}

function extractChecklist(content) {
  const sections = splitAssistantSections(content);
  const documentSection = sections.find((section) => isDocumentsSection(section.title));
  if (!documentSection) return null;

  const documents = documentSection.lines
    .filter((line) => /^[-*•]/.test(line))
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
  if (!documents.length) return null;

  const overviewSection = sections.find((section) => /overview|अवलोकन|மேலோட்டம்|అవలోకనం|ಅವಲೋಕನ/i.test(section.title || ""));
  const overview = overviewSection?.lines.join(" ") || "Eligibility and scheme details should be verified on the official portal.";
  const portalUrl = content.match(/https?:\/\/\S+/)?.[0]?.replace(/[).,]+$/, "") || "Not provided";
  const schemeName = extractSchemeName(overview);

  return { documents, overview, portalUrl, schemeName };
}

const SHARE_LABELS = {
  English: { title: "*NitiMitra Scheme Update*", scheme: "Scheme Name", schemeFallback: "Welfare Scheme", eligibility: "Key eligibility criteria", portal: "Official Application Link", portalFallback: "Not provided", fallback: "Please check the official scheme eligibility details." },
  Hindi: { title: "*नीति मित्र योजना अपडेट*", scheme: "योजना का नाम", schemeFallback: "कल्याण योजना", eligibility: "मुख्य पात्रता मानदंड", portal: "आधिकारिक आवेदन लिंक", portalFallback: "उपलब्ध नहीं", fallback: "कृपया आधिकारिक पोर्टल पर योजना की पात्रता जांचें।" },
  Telugu: { title: "*నీతి మిత్ర పథకం సమాచారం*", scheme: "పథకం పేరు", schemeFallback: "సంక్షేమ పథకం", eligibility: "ముఖ్యమైన అర్హత ప్రమాణాలు", portal: "అధికారిక దరఖాస్తు లింక్", portalFallback: "అందుబాటులో లేదు", fallback: "అధికారిక పోర్టల్‌లో పథకం అర్హతను పరిశీలించండి." },
  Tamil: { title: "*நிதிமித்ரா திட்ட தகவல்*", scheme: "திட்டத்தின் பெயர்", schemeFallback: "நலத்திட்டம்", eligibility: "முக்கிய தகுதி நிபந்தனைகள்", portal: "அதிகாரப்பூர்வ விண்ணப்ப இணைப்பு", portalFallback: "வழங்கப்படவில்லை", fallback: "அதிகாரப்பூர்வ இணையதளத்தில் திட்டத் தகுதியை சரிபார்க்கவும்." },
  Kannada: { title: "*ನೀತಿಮಿತ್ರ ಯೋಜನೆ ಮಾಹಿತಿ*", scheme: "ಯೋಜನೆಯ ಹೆಸರು", schemeFallback: "ಕಲ್ಯಾಣ ಯೋಜನೆ", eligibility: "ಮುಖ್ಯ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು", portal: "ಅಧಿಕೃತ ಅರ್ಜಿ ಲಿಂಕ್", portalFallback: "ಲಭ್ಯವಿಲ್ಲ", fallback: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಯೋಜನೆಯ ಅರ್ಹತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ." },
};

function createWhatsAppShareUrl(content, languageName) {
  const sections = splitAssistantSections(content);
  const labels = SHARE_LABELS[languageName] || SHARE_LABELS.English;
  const overviewSection = sections.find((section) => /overview|अवलोकन|மேலோட்டம்|అవలోకనం|ಅವಲೋಕನ/i.test(section.title || ""));
  const eligibilitySection = sections.find((section) => /eligibility|पात्रता|தகுதி|అర్హత|ಅರ್ಹತಾ/i.test(section.title || ""));
  const overview = overviewSection?.lines.join(" ") || content;
  const eligibility = eligibilitySection?.lines
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3)
    .join("; ") || labels.fallback;
  const portalUrl = content.match(/https?:\/\/\S+/)?.[0]?.replace(/[).,]+$/, "") || labels.portalFallback;
  const extractedSchemeName = extractSchemeName(overview);
  const schemeName = extractedSchemeName === "Welfare Scheme" ? labels.schemeFallback : extractedSchemeName;
  const shareText = [
    labels.title,
    `- ${labels.scheme}: ${schemeName}`,
    `- ${labels.eligibility}: ${eligibility}`,
    `- ${labels.portal}: ${portalUrl}`,
  ].join("\n");

  return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
}

function downloadChecklist(content) {
  const checklist = extractChecklist(content);
  if (!checklist) return;

  const fileContent = [
    `Scheme Name: ${checklist.schemeName}`,
    "",
    "Overview",
    checklist.overview,
    "",
    "Required Documents Checklist",
    ...checklist.documents.map((document) => `[ ] ${document}`),
    "",
    "Official Application Portal URL",
    checklist.portalUrl,
    "",
    "Generated by NitiMitra",
  ].join("\n");
  const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `NitiMitra_Checklist_${checklist.schemeName.replace(/[^A-Za-z0-9-]+/g, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function speechText(content) {
  return content
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/[*#`_~]/g, "")
    .replace(/^\s*[-*•]\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function AssistantMessage({ content, languageName, isSpeaking, onReadAloud }) {
  const sections = splitAssistantSections(content);
  const checklist = extractChecklist(content);

  return (
    <div className="space-y-4 text-sm leading-6 text-slate-700">
      <div className="flex justify-end gap-1">
        <button aria-label={isSpeaking ? "Stop reading aloud" : "Listen to this answer"} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold transition ${isSpeaking ? "bg-emerald-100 text-emerald-800" : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"}`} onClick={() => onReadAloud(content)} type="button">
          {isSpeaking ? <Square fill="currentColor" size={12} /> : <Volume2 size={15} />}
          {isSpeaking ? "Stop" : "Listen"}
        </button>
        <a aria-label="Share to WhatsApp" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 transition hover:bg-green-50 hover:text-green-700" href={createWhatsAppShareUrl(content, languageName)} rel="noreferrer" target="_blank">
          <MessageCircle size={15} /> Share
        </a>
      </div>
      {sections.map((section, index) => {
        const isDocuments = isDocumentsSection(section.title);
        const isStatus = /status|स्थिति|స్థితి|நிலை|ಸ್ಥಿತಿ/i.test(section.title || "");
        const isLink = /link|portal|पोर्टल|పోర్టల్|இணையதள|ಪೋರ್ಟಲ್/i.test(section.title);
        const isList = section.lines.some((line) => /^[-*•]/.test(line));
        return (
          <section key={`${section.title || "section"}-${index}`}>
            {section.title && (
              <h3 className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">
                {isLink ? <ExternalLink size={15} /> : isDocuments ? <CheckCircle2 size={15} /> : isStatus ? <CircleCheck size={15} /> : <Building2 size={15} />}
                {section.title}
              </h3>
            )}
            {isList ? (
              <ul className="list-disc space-y-1 pl-5 marker:text-emerald-600">
                {section.lines.map((line, lineIndex) => <li key={lineIndex}>{line.replace(/^[-*•]\s*/, "")}</li>)}
              </ul>
            ) : (
              <div className="space-y-1">
                {section.lines.map((line, lineIndex) => {
                  const url = line.match(/https?:\/\/\S+/)?.[0];
                  return url ? (
                    <a className="inline-flex max-w-full items-center gap-1 break-all font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-900" href={url} key={lineIndex} rel="noreferrer" target="_blank">
                      {line}<ExternalLink className="shrink-0" size={13} />
                    </a>
                  ) : <p key={lineIndex}>{line}</p>;
                })}
              </div>
            )}
          </section>
        );
      })}
      {checklist && (
        <div className="border-t border-slate-100 pt-3">
          <button aria-label="Download document checklist" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100" onClick={() => downloadChecklist(content)} type="button">
            <FileDown size={15} /> Download Checklist
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
      <span className="flex gap-1" aria-label="NitiMitra is thinking">
        {[0, 1, 2].map((dot) => <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" key={dot} style={{ animationDelay: `${dot * 120}ms` }} />)}
      </span>
      NitiMitra is thinking
    </div>
  );
}

export default function NitiMitraChat() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileApplied, setProfileApplied] = useState(false);
  const [citizenProfile, setCitizenProfile] = useState(INITIAL_PROFILE);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionRetryRef = useRef(0);

  const selectedLanguageName = selectedLanguage.name;
  const isDemoMode = !API_ENDPOINT;

  const useStarterPrompt = (prompt) => {
    setInput(prompt);
    setError("");
  };

  const stopReading = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMessageIndex(null);
  };

  const readAloud = (content, messageIndex) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setError("Read Aloud is not supported in this browser.");
      return;
    }
    if (speakingMessageIndex === messageIndex) {
      stopReading();
      return;
    }

    const targetLocale = SPEECH_LOCALES[selectedLanguage.name] || "en-IN";
    const languagePrefix = targetLocale.slice(0, 2).toLowerCase();
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((voice) => voice.lang.toLowerCase() === targetLocale.toLowerCase())
      || voices.find((voice) => voice.lang.toLowerCase().startsWith(languagePrefix));
    const fallbackVoice = voices.find((voice) => voice.lang.toLowerCase() === "en-in") || voices[0];
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(speechText(content));
    utterance.lang = targetLocale;
    if (matchedVoice || fallbackVoice) utterance.voice = matchedVoice || fallbackVoice;
    if (!matchedVoice && fallbackVoice && targetLocale !== "en-IN") {
      setVoiceStatus(`No ${selectedLanguage.name} voice is installed; using the available voice.`);
    } else {
      setVoiceStatus("");
    }
    utterance.onend = () => setSpeakingMessageIndex(null);
    utterance.onerror = () => setSpeakingMessageIndex(null);
    setSpeakingMessageIndex(messageIndex);
    window.speechSynthesis.speak(utterance);
  };

  const updateProfile = (field, value) => {
    setCitizenProfile((current) => ({ ...current, [field]: value }));
    setProfileApplied(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "assistant") {
      setMessages([{ ...messages[0], content: WELCOME_MESSAGES[selectedLanguageName] || WELCOME_MESSAGES.English }]);
    }
  }, [selectedLanguageName]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  useEffect(() => {
    stopReading();
  }, [selectedLanguage.code]);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("Voice input is unavailable in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    recognitionRetryRef.current = 0;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage.code;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        setError("");
        setVoiceStatus("Listening... speak now");
        setIsListening(true);
      };
      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const transcript = event.results[index][0]?.transcript || "";
          if (event.results[index].isFinal) finalText += transcript;
          else interimText += transcript;
        }
        if (finalText) {
          setInput((current) => `${current}${current ? " " : ""}${finalText.trim()}`);
          setVoiceStatus("Captured. You can edit the text before sending.");
        } else if (interimText) {
          setVoiceStatus(`Hearing: ${interimText}`);
        }
      };
      recognition.onerror = (event) => {
        const messages = {
          "not-allowed": "Microphone access is blocked. Allow microphone access for localhost and try again.",
          "audio-capture": "No microphone was found. Connect a microphone and try again.",
          network: "Voice recognition service is unavailable. Retrying once...",
          "no-speech": "No speech detected. Tap the microphone and speak clearly.",
        };
        if (event.error === "network" && recognitionRetryRef.current < 1) {
          recognitionRetryRef.current += 1;
          setIsListening(false);
          window.setTimeout(() => {
            if (!recognitionRef.current) return;
            try {
              setVoiceStatus("Retrying voice recognition...");
              recognitionRef.current.start();
            } catch {
              setVoiceStatus("Voice recognition is unavailable. Please type your question instead.");
            }
          }, 400);
          return;
        }
        setVoiceStatus(event.error === "network" ? "Voice recognition is unavailable. Please type your question instead." : messages[event.error] || "Voice input stopped. Please try again.");
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatus((current) => current === "Listening... speak now" ? "No speech detected. Try again." : current);
      };
      recognitionRef.current = recognition;
      setVoiceStatus("Starting microphone...");
      recognition.start();
    } catch (recognitionError) {
      setIsListening(false);
      setVoiceStatus(recognitionError.name === "NotAllowedError" ? "Microphone access is blocked for localhost." : "Could not start voice input. Please try again.");
    }
  };

  const sendMessage = async (messageText) => {
    const query = messageText.trim();
    if (!query || isLoading) return;

    setInput("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: query }]);
    setIsLoading(true);

    try {
      let data;
      if (isDemoMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        const intentResponse = demoIntentResponse(query, citizenProfile);
        const demo = DEMO_RESPONSES[selectedLanguageName] || DEMO_RESPONSES.English;
        data = {
          answer: intentResponse || demo.content,
          citations: ["https://pmkisan.gov.in/"],
          sessionId: sessionId || `demo-${Date.now()}`,
        };
      } else {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            language: selectedLanguageName,
            sessionId,
            citizenProfile: profileApplied ? citizenProfile : null,
          }),
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.error || "The assistant is temporarily unavailable.");
      }

      setSessionId(data.sessionId || sessionId);
      const citations = (data.citations || []).map((citation) => {
        if (typeof citation === "string") return citation;
        return citation?.location?.s3Location?.uri || citation?.content?.text || "Official source";
      });
      setMessages((current) => [...current, {
        role: "assistant",
        content: data.answer || "I could not find an answer for that question.",
        citations,
      }]);
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleIntentChoice = (choice) => {
    sendMessage(choice);
  };

  return (
    <main className="min-h-screen bg-[#edf4ef] px-3 py-4 font-sans text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-white shadow-[0_30px_100px_-40px_rgba(15,90,70,0.5)] sm:min-h-[calc(100vh-4rem)]">
        <header className="relative flex flex-wrap items-center justify-between gap-5 overflow-hidden border-b border-emerald-950/10 bg-[#123b32] px-5 py-5 text-white sm:px-9 sm:py-6">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-2/5 bg-[linear-gradient(110deg,transparent,rgba(241,190,74,0.12))]" />
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1bd4a] text-[#123b32] shadow-lg shadow-black/20"><Building2 size={24} /></div>
            <div className="relative"><div className="flex items-center gap-2"><h1 className="text-xl font-bold tracking-tight">NitiMitra</h1><span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-50">Bharat builds</span></div><p className="mt-0.5 text-xs text-emerald-100/75">Bharat Citizen Scheme Assistant</p></div>
          </div>
          <div className="relative flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[11px] font-medium text-emerald-100/70 sm:flex"><CircleCheck size={14} /> {isDemoMode ? "Demo / Mock Mode" : "Grounded guidance"}</span>
            <button aria-expanded={isProfileOpen} aria-label="Open Citizen Profile" className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${profileApplied ? "border-[#f1bd4a] bg-[#f1bd4a] text-[#123b32]" : "border-white/20 bg-white/10 text-white hover:bg-white/20"}`} onClick={() => setIsProfileOpen(true)} type="button">
              <UserRound size={15} /> {profileApplied ? "Profile applied" : "Apply Profile"}
            </button>
            <label className="flex items-center rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur">
              <select aria-label="Select response language" className="bg-transparent outline-none [&>option]:text-slate-900" onChange={(event) => setSelectedLanguage(LANGUAGES.find((language) => language.code === event.target.value) || LANGUAGES[0])} value={selectedLanguage.code}>
                {LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
              </select>
            </label>
          </div>
        </header>

        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="citizen-profile-title">
            <button aria-label="Close Citizen Profile" className="absolute inset-0 cursor-default bg-slate-950/35 backdrop-blur-[2px]" onClick={() => setIsProfileOpen(false)} type="button" />
            <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700"><SlidersHorizontal size={15} /> Personalize guidance</div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#123b32]" id="citizen-profile-title">Citizen Profile</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">Share your details so NitiMitra can check scheme eligibility more precisely.</p>
                </div>
                <button aria-label="Close Citizen Profile" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={() => setIsProfileOpen(false)} type="button"><X size={20} /></button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                <label className="block text-sm font-semibold text-slate-700">
                  Age
                  <input className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50" min="0" max="120" onChange={(event) => updateProfile("age", event.target.value)} placeholder="Enter your age" type="number" value={citizenProfile.age} />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Annual Family Income
                  <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50" onChange={(event) => updateProfile("annualIncome", event.target.value)} value={citizenProfile.annualIncome}>
                    { ["< 1 Lakh", "1-3 Lakhs", "3-5 Lakhs", "5+ Lakhs"].map((income) => <option key={income} value={income}>{income}</option>) }
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Land Holding in Acres
                  <input className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50" min="0" step="0.01" onChange={(event) => updateProfile("landHoldingAcres", event.target.value)} type="number" value={citizenProfile.landHoldingAcres} />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Occupation
                  <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50" onChange={(event) => updateProfile("occupation", event.target.value)} value={citizenProfile.occupation}>
                    <option value="">Prefer not to say</option>
                    {["Farmer", "Agricultural Worker", "Student", "Self-employed", "Other"].map((occupation) => <option key={occupation} value={occupation}>{occupation}</option>)}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Social Category
                  <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50" onChange={(event) => updateProfile("socialCategory", event.target.value)} value={citizenProfile.socialCategory}>
                    {["General", "OBC", "SC", "ST"].map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  State
                  <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50" onChange={(event) => updateProfile("state", event.target.value)} value={citizenProfile.state}>
                    {["Andhra Pradesh", "Telangana", "Karnataka", "All India"].map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </label>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-800" onClick={() => { setProfileApplied(true); setIsProfileOpen(false); }} type="button">
                  <CheckCircle2 size={18} /> Apply Profile
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-400">You can update these details anytime.</p>
              </div>
            </aside>
          </div>
        )}

        <div className="flex flex-1 flex-col bg-[linear-gradient(135deg,#fbfdfb_0%,#f3f9f5_100%)]">
          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-10 sm:py-8">
            {messages.length === 1 && (
              <div className="mb-8 max-w-2xl">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-700"><Sparkles size={15} /> Start with a question</div>
                <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#123b32] sm:text-4xl">Find the support you&apos;re entitled to.</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">Ask in your language. NitiMitra helps you understand eligibility, documents, and the official way to apply.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((prompt) => <button className="group inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-left text-xs font-semibold text-emerald-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md" key={prompt} onClick={() => useStarterPrompt(prompt)} type="button">{prompt}<ArrowUpRight className="text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={14} /></button>)}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={index}>
                <div className="max-w-[92%] sm:max-w-[78%]">
                  {message.role === "assistant" && <div className="mb-2 flex items-center gap-2 px-1 text-xs font-bold text-emerald-800"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-700 text-white"><ShieldCheck size={14} /></span>NitiMitra <span className="font-normal text-slate-400">• verified assistant</span></div>}
                  <div className={message.role === "user" ? "rounded-2xl rounded-br-md bg-emerald-700 px-4 py-3 text-sm leading-6 text-white shadow-md" : "rounded-2xl rounded-tl-md border border-slate-100 bg-white px-5 py-4 shadow-sm"}>
                    {message.role === "assistant" ? <AssistantMessage content={message.content} languageName={selectedLanguageName} isSpeaking={speakingMessageIndex === index} onReadAloud={(content) => readAloud(content, index)} /> : message.content}
                  </div>
                  {message.role === "assistant" && /pm[-\s]?kisan/i.test(message.content) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="cursor-pointer rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10" disabled={isLoading} onClick={() => handleIntentChoice("Check My Eligibility")} type="button">🔍 Check My Eligibility</button>
                      <button className="cursor-pointer rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10" disabled={isLoading} onClick={() => handleIntentChoice("Track Application Status")} type="button">📍 Track Application Status</button>
                    </div>
                  )}
                  {message.citations?.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{message.citations.map((citation, citationIndex) => <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800" key={citationIndex}>Source {citationIndex + 1}: {citation}</span>)}</div>}
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-5 py-4 shadow-sm"><LoadingMessage /></div></div>}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 bg-white/90 px-4 py-4 sm:px-8 sm:py-5">
            {error && <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</div>}
            <form className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm transition focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-50" onSubmit={submit}>
              <textarea aria-label="Ask NitiMitra a question" className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-400" onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(event); } }} placeholder="Ask about a welfare scheme..." value={input} />
              <button aria-label={isListening ? "Stop dictation" : "Start dictation"} className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${isListening ? "bg-red-100 text-red-600 ring-4 ring-red-200/70 ring-offset-2" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"}`} onClick={toggleListening} type="button">{isListening && <span className="absolute inset-1 animate-ping rounded-lg bg-red-300/40" />}{isListening ? <MicOff className="relative animate-pulse" size={19} /> : <Mic size={19} />}</button>
              <button aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40" disabled={!input.trim() || isLoading} type="submit">{isLoading ? <Loader2 className="animate-spin" size={19} /> : <Send size={18} />}</button>
            </form>
            {voiceStatus && <p className={`mt-2 text-center text-[11px] font-medium ${isListening ? "text-red-600" : "text-slate-500"}`} role="status">{voiceStatus}</p>}
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400"><CheckCircle2 size={12} /> Official scheme information, made easier to understand</p>
          </div>
        </div>
      </div>
    </main>
  );
}