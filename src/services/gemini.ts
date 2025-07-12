import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export interface GeneratedStoreContent {
  description: string;
  tagline: string;
  policies: string[];
  marketingContent: string;
  pricingSuggestions?: string[];
}

export interface StoreGenerationInput {
  businessName: string;
  businessType: string;
  location: string;
  services: string[];
  targetAudience?: string;
  existingDescription?: string;
}

// ONLY KEEP THIS ONE FUNCTION - Remove all duplicates
export async function generateStoreContent(input: StoreGenerationInput): Promise<GeneratedStoreContent> {
  try {
    console.log('🤖 Generating content for:', input.businessType);
    
    const prompt = `Create professional business content for this ${input.businessType} business:

Business Name: ${input.businessName}
Business Type: ${input.businessType}
Location: ${input.location}
Services: ${input.services.join(', ')}
Target Audience: ${input.targetAudience || 'Local customers'}
${input.existingDescription ? `Existing Description: ${input.existingDescription}` : ''}

Generate realistic, industry-specific content in JSON format:
{
  "description": "A compelling 2-3 sentence business description that highlights what makes this business special and trustworthy",
  "tagline": "A catchy, memorable tagline (max 8 words)",
  "policies": [
    "Professional policy relevant to ${input.businessType}",
    "Customer service policy",
    "Quality assurance policy",
    "Pricing/warranty policy"
  ],
  "marketingContent": "An engaging promotional message that encourages customers to choose this business (1-2 sentences)"
}

Make it specific to ${input.businessType} businesses and relevant to ${input.location}. Use professional, engaging language that builds trust.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 Raw AI response:', text);
    
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generatedContent = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed AI content:', generatedContent);
        
        return {
          description: generatedContent.description || `Welcome to ${input.businessName} - your trusted ${input.businessType} in ${input.location}.`,
          tagline: generatedContent.tagline || 'Quality Service Always',
          policies: generatedContent.policies || [
            'Customer satisfaction guaranteed',
            'Professional and reliable service',
            'Competitive pricing',
            'Quality assured'
          ],
          marketingContent: generatedContent.marketingContent || `Visit ${input.businessName} for the best ${input.businessType} services in ${input.location}!`
        };
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      
      // Return fallback content
      return {
        description: `Welcome to ${input.businessName} - your trusted ${input.businessType} in ${input.location}. We provide excellent service with professional expertise.`,
        tagline: 'Quality Service Always',
        policies: [
          'Customer satisfaction guaranteed',
          'Professional and reliable service', 
          'Competitive pricing',
          'Quality work assured'
        ],
        marketingContent: `Choose ${input.businessName} for reliable ${input.businessType} services in ${input.location}. Contact us today!`
      };
    }
  } catch (error) {
    console.error('❌ Error in generateStoreContent:', error);
    
    // Return fallback content
    return {
      description: `Welcome to ${input.businessName} - your trusted ${input.businessType} in ${input.location}.`,
      tagline: 'Quality Service Always',
      policies: [
        'Customer satisfaction guaranteed',
        'Professional service',
        'Competitive pricing', 
        'Quality assured'
      ],
      marketingContent: `Visit ${input.businessName} today!`
    };
  }
}

// QR Code generation function
export function generateQRCode(storeUrl: string): string {
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(storeUrl)}`;
  return qrApiUrl;
}