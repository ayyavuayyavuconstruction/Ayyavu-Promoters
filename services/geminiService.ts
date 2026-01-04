
import { GoogleGenAI } from "@google/genai";
import { Project, Site } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProjectOverview = async (project: Project): Promise<string> => {
  try {
    const totalSites = project.sites.length;
    const sold = project.sites.filter(s => s.status === 'SOLD').length;
    const booked = project.sites.filter(s => s.status === 'BOOKED').length;
    const unsold = project.sites.filter(s => s.status === 'UNSOLD').length;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short executive summary for a real estate project manager based on these stats for the project "${project.name}" in "${project.location}":
      - Total Sites: ${totalSites}
      - Sold: ${sold}
      - Booked: ${booked}
      - Unsold: ${unsold}
      Provide professional advice on sales strategy or market outlook in 3-4 sentences.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Failed to fetch AI insights. Please check your network connection.";
  }
};

export const getSiteReport = async (site: Site): Promise<string> => {
  try {
    const plotValue = site.landAreaSqFt * site.landCostPerSqFt;
    const constructionValue = site.constructionAreaSqFt * site.constructionRatePerSqFt;
    const totalValue = plotValue + constructionValue;
    
    const prompt = `Generate a concise 2-sentence professional status report for real estate site #${site.number}.
    Details:
    - Status: ${site.status}
    - Facing: ${site.facing}
    - Total Land Area: ${site.landAreaSqFt} sq ft
    - Total Calculated Value: ₹${totalValue.toLocaleString('en-IN')}
    ${site.customerName ? `- Current Customer: ${site.customerName}` : ''}
    
    Focus on the property's value proposition and current inventory status.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    return response.text || "Report unavailable.";
  } catch (error) {
    console.error("Gemini API error (Site Report):", error);
    return "Could not generate AI report.";
  }
};
