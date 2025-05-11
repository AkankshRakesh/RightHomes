import { mockProperties } from "./mock-data";

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
  'delhi': { name: 'Delhi', currency: 'INR', budgetUnit: 'Lakh' },
  'mumbai': { name: 'Mumbai', currency: 'INR', budgetUnit: 'Crore' },
  'bangalore': { name: 'Bangalore', currency: 'INR', budgetUnit: 'Lakh' },
  'hyderabad': { name: 'Hyderabad', currency: 'INR', budgetUnit: 'Lakh' },
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
  'studio': ['studio', 'studio apartment']
};


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

  // Stage 1: Extract basic information from initial input
  if (updatedStage <= 2) {
    // Extract city from input if not already set
    if (!updatedRequirementMap.city) {
      for (const [cityKey, cityData] of Object.entries(SUPPORTED_CITIES)) {
        if (inputLower.includes(cityKey)) {
          updatedRequirementMap.city = cityData.name;
          updatedRequirementMap.currency = cityData.currency;
          updatedRequirementMap.budgetUnit = cityData.budgetUnit;
          break;
        }
      }
    }

    // Extract property type if not already set
    if (!updatedRequirementMap.type) {
      for (const [typeKey, typeSynonyms] of Object.entries(PROPERTY_TYPES)) {
        if (typeSynonyms.some(syn => inputLower.includes(syn))) {
          updatedRequirementMap.type = typeKey;
          break;
        }
      }
    }

    // Extract bedrooms
    if (!updatedRequirementMap.bedrooms) {
      const bedroomMatch = inputLower.match(/(\d+)\s*(bhk|bed|bedroom|bedrooms)/);
      if (bedroomMatch) {
        updatedRequirementMap.bedrooms = parseInt(bedroomMatch[1]);
      } else if (inputLower.includes('studio')) {
        updatedRequirementMap.bedrooms = 'studio';
      }
    }

    // Extract budget with currency awareness
    if (!updatedRequirementMap.budget) {
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

    // Extract purpose
    if (!updatedRequirementMap.purpose) {
      if (inputLower.includes('personal') || inputLower.includes('live') || inputLower.includes('own use')) {
        updatedRequirementMap.purpose = 'Personal Use';
      } else if (inputLower.includes('invest') || inputLower.includes('rental') || inputLower.includes('return')) {
        updatedRequirementMap.purpose = 'Investment';
      } else if (inputLower.includes('commercial') || inputLower.includes('office') || inputLower.includes('business')) {
        updatedRequirementMap.purpose = 'Commercial';
      }
    }

    // Extract status
    if (!updatedRequirementMap.status) {
      if (inputLower.includes('ready') || inputLower.includes('move in')) {
        updatedRequirementMap.status = 'Ready to Move';
      } else if (inputLower.includes('under construction') || inputLower.includes('upcoming')) {
        updatedRequirementMap.status = 'Under Construction';
      }
    }
  }

  // Conversation flow based on stage
  switch (currentStage) {
    case 1: // Initial greeting and intent capture
      if (Object.keys(updatedRequirementMap).length > 0) {
        updatedStage = 2;
        response = "Great! I'd like to understand your requirements better. ";
        missingFields = getMissingFieldsForStage2(updatedRequirementMap);
        if (missingFields.length > 0) {
          response += getMissingFieldsPrompt(missingFields, updatedRequirementMap);
        } else {
          response += "Let me find some properties for you.";
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

    case 2: // Gather more detailed requirements
      missingFields = getMissingFieldsForStage2(updatedRequirementMap);
      if (missingFields.length === 0) {
        updatedStage = 3;
        response = "Based on your requirements, I've found some properties that might interest you. Take a look at these options.";
        showRecommendations = true;
      } else {
        response = getMissingFieldsPrompt(missingFields, updatedRequirementMap);
      }
      break;

    case 3: // Recommendations and feedback
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
        updatedStage = 5; // Objection handling
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
      
      // Always show recommendations at this stage
      showRecommendations = true;
      break;

    case 4: // Scheduling
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

    case 5: // Objection handling
      // Update requirements based on feedback
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
      
      updatedStage = 3; // Go back to recommendations
      showRecommendations = true;
      break;

    case 6: // Summary and follow-up
      updatedStage = 7;
      response = "Thank you for your interest! I've noted down your preferences. Would you like me to send a summary of these properties to your email or WhatsApp?";
      quickReplies = [
        "Send via WhatsApp",
        "Email me the details",
        "Both please"
      ];
      break;

    default: // Final stage
      response = "Thank you for using our service! We'll keep tracking better options based on your preferences and alert you if prices change. Feel free to reach out if you have more questions.";
  }

  // Generate recommendations if needed
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

function getMissingFieldsPrompt(missingFields: string[], requirements: Requirements): string {
  const prompts = {
    city: "Which city are you looking to buy in? We operate in multiple locations including Gurgaon, Mumbai, Bangalore, and Dubai.",
    purpose: "Are you buying for personal use, investment, or commercial purposes?",
    budget: `What's your budget range for this property? (in ${requirements.budgetUnit || 'Lakh/Crore'})`,
    bedrooms: "How many bedrooms are you looking for?",
    type: "What type of property are you interested in? (Apartment, Villa, Plot, etc.)",
    status: "Do you prefer ready-to-move properties or under-construction projects?"
  };

  // Return prompt for the first missing field
  return prompts[missingFields[0] as keyof typeof prompts] || "Could you provide more details about your requirements?";
}

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
  // Filter properties based on requirements
  return mockProperties.map(property => ({
    ...property,
    id: property.id.toString()
  })).filter(property => {
    // Match city if specified
    if (requirements.city && !property.location.toLowerCase().includes(requirements.city.toLowerCase())) {
      return false;
    }
    
    // Match type if specified
    if (requirements.type && property.type !== requirements.type) {
      return false;
    }
    
    // Match bedrooms if specified
    if (requirements.bedrooms && property.bedrooms !== requirements.bedrooms) {
      return false;
    }
    
    // Match status if specified
    if (requirements.status && property.status !== requirements.status) {
      return false;
    }
    
    // Match budget if specified (within 20% range)
    if (requirements.budget) {
      const budgetDiff = Math.abs(property.price - requirements.budget);
      if (budgetDiff > (0.2 * requirements.budget)) {
        return false;
      }
    }
    
    return true;
  }).slice(0, 5); // Return max 5 recommendations
}