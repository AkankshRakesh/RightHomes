import { mockProperties } from "./mock-data";
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.NEXT_PUBLIC_GEMINI) {
  throw new Error("Environment variable NEXT_PUBLIC_GEMINI is not defined.");
}
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

interface ProcessResult {
  response: string;
  updatedRequirementMap: Record<string, string | number | undefined>;
  updatedStage: number;
  showRecommendations: boolean;
  showScheduleOptions: boolean;
  missingFields?: string[];
  quickReplies?: string[];
  recommendations?: Recommendation[];
}

// Supported cities with metadata
const SUPPORTED_CITIES = {
  'gurgaon': { name: 'Gurgaon', currency: 'INR', budgetUnit: 'Lakh' },
  'gurugram': { name: 'Gurgaon', currency: 'INR', budgetUnit: 'Lakh' },
  'noida': { name: 'Noida', currency: 'INR', budgetUnit: 'Lakh' },
  'delhi': { name: 'Delhi', currency: 'INR', budgetUnit: 'Lakh' },
  'mumbai': { name: 'Mumbai', currency: 'INR', budgetUnit: 'Crore' },
  'navi mumbai': { name: 'Navi Mumbai', currency: 'INR', budgetUnit: 'Crore' },
  'bangalore': { name: 'Bangalore', currency: 'INR', budgetUnit: 'Lakh' },
  'hyderabad': { name: 'Hyderabad', currency: 'INR', budgetUnit: 'Lakh' },
  'pune': { name: 'Pune', currency: 'INR', budgetUnit: 'Lakh' },
  'chennai': { name: 'Chennai', currency: 'INR', budgetUnit: 'Lakh' },
  'ahmedabad': { name: 'Ahmedabad', currency: 'INR', budgetUnit: 'Lakh' },
  'kolkata': { name: 'Kolkata', currency: 'INR', budgetUnit: 'Lakh' },
  'jaipur': { name: 'Jaipur', currency: 'INR', budgetUnit: 'Lakh' },
  'lucknow': { name: 'Lucknow', currency: 'INR', budgetUnit: 'Lakh' },
  'dubai': { name: 'Dubai', currency: 'AED', budgetUnit: 'Million' },
  'abudhabi': { name: 'Abu Dhabi', currency: 'AED', budgetUnit: 'Million' },
  'sharjah': { name: 'Sharjah', currency: 'AED', budgetUnit: 'Million' },
};

// Property type mappings
const PROPERTY_TYPES = {
  'apartment': ['flat', 'apartment', 'condo', 'condominium'],
  'villa': ['villa', 'house', 'bungalow', 'townhouse'],
  'plot': ['plot', 'land', 'empty land'],
  'penthouse': ['penthouse', 'duplex'],
  'studio': ['studio', 'studio apartment'],
  'commercial': ['office', 'shop', 'retail', 'business']
};

async function generateAIResponse(
  input: string,
  requirements: Record<string, string | number | undefined>,
  stage: number,
  missingFields?: string[],
  hasRecommendations?: boolean
): Promise<string> {
  const prompt = `
You are a smart real estate assistant.

User said: "${input}"
Current stage: ${stage}
Known requirements: ${JSON.stringify(requirements)}
Missing fields: ${missingFields?.join(", ") || "None"}
Properties found: ${hasRecommendations ? "Yes" : "No"}

Instructions:
- Ask questions naturally if any fields are missing.
- If everything is filled and properties exist, summarize and invite next steps.
- If user is dissatisfied, suggest adjusting criteria.
Respond naturally and professionally.
`;


  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return response.trim();
}


interface Recommendation {
  id: string;
  name: string;
  location: string;
  type: string;
  bedrooms: number | string;
  status: string;
  price: number;
}

export async function processUserInput(
  input: string,
  currentRequirementMap: Record<string, string | number | undefined>,
  currentStage: number,
): Promise<ProcessResult> {
  const updatedRequirementMap = { ...currentRequirementMap };
  let updatedStage = currentStage;
  let showRecommendations = false;
  let showScheduleOptions = false;
  let missingFields: string[] = [];
  let response = "";
  let quickReplies: string[] = [];
  let recommendations: Recommendation[] = [];

  const inputLower = input.toLowerCase();

  // First check if user wants to update any existing requirements
  const updatePatterns = {
    city: /(change|update|different)\s*(city|location|area)/,
    budget: /(change|update|different)\s*(budget|price|amount)/,
    type: /(change|update|different)\s*(type|kind|property)/,
    bedrooms: /(change|update|different)\s*(bedrooms|bhk|bed|size)/,
    purpose: /(change|update|different)\s*(purpose|use|reason)/,
    status: /(change|update|different)\s*(status|timing|ready|construction)/
  };

  // Check for update requests
  for (const [field, pattern] of Object.entries(updatePatterns)) {
    if (pattern.test(inputLower)) {
      delete updatedRequirementMap[field];
      response = `I'll update the ${field} preference. `;
      break;
    }
  }

  // Special case for "start over" or "reset"
  if (inputLower.includes('start over') || inputLower.includes('reset')) {
    Object.keys(updatedRequirementMap).forEach(key => delete updatedRequirementMap[key]);
    updatedStage = 1;
    response = "Okay, let's start fresh. Which city are you interested in?";
    quickReplies = [
      "Gurgaon properties",
      "Mumbai apartments",
      "Dubai villas"
    ];
    return {
      response,
      updatedRequirementMap,
      updatedStage,
      showRecommendations,
      showScheduleOptions,
      missingFields,
      quickReplies,
      recommendations
    };
  }

  // Extract/update requirements if not already present or being updated
  if (!updatedRequirementMap.city || inputLower.includes('location')) {
    for (const [cityKey, cityData] of Object.entries(SUPPORTED_CITIES)) {
      if (inputLower.includes(cityKey)) {
        updatedRequirementMap.city = cityData.name;
        updatedRequirementMap.currency = cityData.currency;
        updatedRequirementMap.budgetUnit = cityData.budgetUnit;
        break;
      }
    }
  }

  if (!updatedRequirementMap.type || inputLower.includes('type')) {
    for (const [typeKey, typeSynonyms] of Object.entries(PROPERTY_TYPES)) {
      if (typeSynonyms.some(syn => inputLower.includes(syn))) {
        updatedRequirementMap.type = typeKey;
        break;
      }
    }
  }

  if (!updatedRequirementMap.bedrooms || inputLower.includes('bedroom')) {
    const bedroomMatch = inputLower.match(/(\d+)\s*(bhk|bed|bedroom|bedrooms)/);
    if (bedroomMatch) {
      updatedRequirementMap.bedrooms = parseInt(bedroomMatch[1]);
    } else if (inputLower.includes('studio')) {
      updatedRequirementMap.bedrooms = 'studio';
    }
  }

  if (!updatedRequirementMap.budget || inputLower.includes('budget')) {
    const cityData = updatedRequirementMap.city 
      ? Object.values(SUPPORTED_CITIES).find(c => c.name.toLowerCase() === (typeof updatedRequirementMap.city === 'string' ? updatedRequirementMap.city.toLowerCase() : ''))
      : null;

    if (cityData) {
      const budgetRegex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${cityData.budgetUnit.toLowerCase()}|${cityData.currency.toLowerCase()})`, 'i');
      const budgetMatch = input.match(budgetRegex);
      
      if (budgetMatch) {
        const budgetValue = parseFloat(budgetMatch[1]);
        if (cityData.budgetUnit === 'Lakh') {
          updatedRequirementMap.budget = budgetValue * 100000;
        } else if (cityData.budgetUnit === 'Crore') {
          updatedRequirementMap.budget = budgetValue * 10000000;
        } else if (cityData.budgetUnit === 'Million') {
          updatedRequirementMap.budget = budgetValue * 1000000;
        } else {
          updatedRequirementMap.budget = budgetValue;
        }
      }
    }
  }

  if (!updatedRequirementMap.purpose || inputLower.includes('purpose')) {
    if (inputLower.includes('personal') || inputLower.includes('live') || inputLower.includes('own use')) {
      updatedRequirementMap.purpose = 'Personal Use';
    } else if (inputLower.includes('invest') || inputLower.includes('rental') || inputLower.includes('return')) {
      updatedRequirementMap.purpose = 'Investment';
    } else if (inputLower.includes('commercial') || inputLower.includes('office') || inputLower.includes('business')) {
      updatedRequirementMap.purpose = 'Commercial';
    }
  }

  if (!updatedRequirementMap.status || inputLower.includes('status')) {
    if (inputLower.includes('ready') || inputLower.includes('move in')) {
      updatedRequirementMap.status = 'Ready to Move';
    } else if (inputLower.includes('under construction') || inputLower.includes('upcoming')) {
      updatedRequirementMap.status = 'Under Construction';
    }
  }

  // Evaluate current missing fields
  missingFields = getMissingFieldsForStage2(updatedRequirementMap);

  switch (updatedStage) {
    case 1:
      if (Object.keys(updatedRequirementMap).length > 0) {
        updatedStage = 2;
        response = await generateAIResponse(input, updatedRequirementMap, updatedStage);
        if (missingFields.length === 0) {
          updatedStage = 3;
          showRecommendations = true;
        }
      } else {
        response = "I'd be happy to help you find the perfect property. Could you tell me which city you're interested in and your budget range?";
        quickReplies = [
          "I want to buy a flat in Gurgaon",
          "Looking for a 3BHK in Dubai under 2 Cr",
          "Show me top builder projects"
        ];
      }
      break;

    case 2:
      const possibleRecommendations = generateRecommendations(updatedRequirementMap);

if (possibleRecommendations.length > 0) {
  recommendations = possibleRecommendations;
  showRecommendations = true;
  updatedStage = 3;

  if (missingFields.length > 0) {
    response = `I’ve found some close matches even though a few details are still missing (${missingFields.join(', ')}). Take a look and let me know if you'd like to adjust.`;
  } else {
    response = "Based on your requirements, I've found some properties that might interest you. Take a look at these options.";
  }
} else {
  response = await generateAIResponse(input, updatedRequirementMap, updatedStage, missingFields, false);
}

      break;

    case 3:
      if (isPositiveResponse(inputLower)) {
        updatedStage = 4;
        response = "Great! Would you like to schedule a site visit or a call with our property expert to discuss further?";
        showScheduleOptions = true;
        quickReplies = [
          "Schedule a site visit",
          "Book a call with expert",
          "Send me more options"
        ];
      } else if (isNegativeResponse(inputLower)) {
        updatedStage = 5;
        response = "I understand. What specifically didn't work for you? You can mention location, price, property type, or other preferences.";
        quickReplies = [
          "Location not ideal",
          "Price is too high",
          "Want different property type"
        ];
      } else if (inputLower.includes('more details') || inputLower.includes('tell me more')) {
        response = getPropertyDetails(updatedRequirementMap);
        quickReplies = [
          "Schedule visit",
          "Book a call",
          "Show similar properties"
        ];
      } else {
        response = "Would you like to see more options with different parameters?";
        quickReplies = [
          "Yes, show more options",
          "Adjust my preferences",
          "Start over"
        ];
      }
      showRecommendations = true;
      break;

    case 4:
      if (isSchedulingRequest(inputLower)) {
        updatedStage = 6;
        response = "Perfect! How would you like to schedule?";
        showScheduleOptions = true;
        quickReplies = [
          "WhatsApp me the details",
          "Schedule via Calendly",
          "Call me now"
        ];
      } else {
        response = "Would you like to schedule a site visit to see the property in person, or would you prefer a call with our property expert first?";
        showScheduleOptions = true;
      }
      break;

    case 5:
      if (inputLower.includes('location') || inputLower.includes('area')) {
        response = "I'll adjust the location preferences. What area would you prefer instead?";
        delete updatedRequirementMap.city;
      } else if (inputLower.includes('price') || inputLower.includes('expensive')) {
        response = "I'll look for more options within your budget. Would you like to adjust your budget range?";
        delete updatedRequirementMap.budget;
      } else if (inputLower.includes('type') || inputLower.includes('kind')) {
        response = "What type of property would you prefer instead?";
        delete updatedRequirementMap.type;
      } else {
        response = "I'll adjust my search based on your feedback. Let me find some better options for you.";
      }
      updatedStage = 3;
      showRecommendations = true;
      break;

    case 6:
      updatedStage = 7;
      response = "Thank you for your interest! I've noted down your preferences. Would you like me to send a summary of these properties to your email or WhatsApp?";
      quickReplies = [
        "Send via WhatsApp",
        "Email me the details",
        "Both please"
      ];
      break;

    default:
      response = "Thank you for using our service! We'll keep tracking better options based on your preferences and alert you if prices change. Feel free to reach out if you have more questions.";
  }

  if (showRecommendations) {
    recommendations = generateRecommendations(updatedRequirementMap);
    if (recommendations.length === 0) {
      response = "I couldn't find properties matching all your criteria. Would you like to adjust your preferences?";
      quickReplies = [
        "Adjust budget",
        "Change location",
        "Modify property type"
      ];
    }
  }

  return {
    response,
    updatedRequirementMap,
    updatedStage,
    showRecommendations,
    showScheduleOptions,
    missingFields,
    quickReplies,
    recommendations
  };
}

// Helper functions
function isPositiveResponse(input: string): boolean {
  return /(like|good|interested|yes|yeah|yup|perfect|great)/.test(input);
}

function isNegativeResponse(input: string): boolean {
  return /(don'?t like|not interested|no|nope|nah|other options|different)/.test(input);
}

function isSchedulingRequest(input: string): boolean {
  return /(visit|see|tour|call|talk|speak|meeting|appointment)/.test(input);
}

function getMissingFieldsForStage2(requirements: Record<string, string | number | undefined>): string[] {
  const missing = [];
  if (!requirements.city) missing.push('city');
  if (!requirements.purpose) missing.push('purpose');
  if (!requirements.budget) missing.push('budget');
  return missing;
}

interface Requirements {
  city?: string;
  purpose?: string;
  budget?: number;
  budgetUnit?: string;
  bedrooms?: number | string;
  type?: string;
  status?: string;
}

// function getMissingFieldsPrompt(missingFields: string[], requirements: Requirements): string {
//   const prompts = {
//     city: "Which city are you looking to buy in? We operate in multiple locations including Gurgaon, Mumbai, Bangalore, and Dubai.",
//     purpose: "Are you buying for personal use, investment, or commercial purposes?",
//     budget: `What's your budget range for this property? (in ${requirements.budgetUnit || 'Lakh/Crore'})`,
//     bedrooms: "How many bedrooms are you looking for?",
//     type: "What type of property are you interested in? (Apartment, Villa, Plot, etc.)",
//     status: "Do you prefer ready-to-move properties or under-construction projects?"
//   };

//   // Return prompt for the first missing field
//   return prompts[missingFields[0] as keyof typeof prompts] || "Could you provide more details about your requirements?";
// }

function getPropertyDetails(requirements: Requirements): string {
  const cityDetails = {
    'Gurgaon': 'Properties in Gurgaon offer excellent connectivity to Delhi, with good infrastructure and amenities.',
    'Mumbai': 'Mumbai properties are premium investments with high appreciation potential.',
    'Bangalore': 'Bangalore offers a mix of modern apartments and villas with good tech infrastructure.',
    'Dubai': 'Dubai properties come with world-class amenities and tax-free benefits.'
  };

  const baseDetails = `These ${requirements.type || 'properties'} offer premium amenities including 24/7 security, swimming pools, gyms, and landscaped gardens. `;
  const citySpecific = cityDetails[requirements.city as keyof typeof cityDetails] || 'They are located in prime areas with good connectivity.';

  return baseDetails + citySpecific + " Would you like to know more about a specific property?";
}

function generateRecommendations(requirements: Requirements): Recommendation[] {
  const exactMatches: Recommendation[] = [];
  const scoredMatches: { score: number; recommendation: Recommendation }[] = [];

  for (const property of mockProperties) {
    let score = 0;
    let isExact = true;

    if (requirements.city) {
      const cityMatch = property.location.toLowerCase().includes(requirements.city.toLowerCase());
      if (cityMatch) score += 2;
      else isExact = false;
    }

    if (requirements.type) {
      if (property.type === requirements.type) score += 2;
      else isExact = false;
    }

    if (requirements.bedrooms) {
      if (property.bedrooms === requirements.bedrooms) score += 1.5;
      else isExact = false;
    }

    if (requirements.status) {
      if (property.status === requirements.status) score += 1;
      else isExact = false;
    }

    if (requirements.budget) {
      const budgetDiff = Math.abs(property.price - requirements.budget);
      if (budgetDiff <= 0.2 * requirements.budget) score += 2;
      else if (budgetDiff <= 0.3 * requirements.budget) score += 1;
      else isExact = false;
    }

    const recommendation = { ...property, id: property.id.toString() };

    if (isExact) {
      exactMatches.push(recommendation);
    } else {
      scoredMatches.push({ score, recommendation });
    }
  }

  if (exactMatches.length > 0) {
    return exactMatches.slice(0, 5);
  }

  // Sort close matches by score descending and return top 5
  scoredMatches.sort((a, b) => b.score - a.score);
  return scoredMatches.map(item => item.recommendation).slice(0, 5);
}
