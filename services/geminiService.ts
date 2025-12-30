
import { GoogleGenAI, Type } from "@google/genai";
import { Member } from "../types";

export const getPastoralInsights = async (member: Member) => {
  // Always initialize GoogleGenAI with the API key from process.env.API_KEY as per instructions.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analiza el siguiente perfil de un miembro de la iglesia y proporciona:
    1. Recomendaciones de grupos internos adecuados (FJU, EVG, FTU, CALEB, etc.) basados en su edad y situación civil.
    2. Sugerencias de seguimiento pastoral.
    3. Una breve reflexión bíblica para animarle.

    Perfil:
    Nombre: ${member.firstName} ${member.lastName}
    Estado Civil: ${member.maritalStatus}
    Grupo actual: ${member.group}
    Fecha de nacimiento: ${member.birthDate}
    Tiempo en iglesia: ${member.churchTime}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ministryMatches: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de grupos recomendados"
            },
            pastoralSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Pasos de seguimiento"
            },
            biblicalEncouragement: {
              type: Type.STRING,
              description: "Mensaje de ánimo basado en la Biblia"
            }
          },
          required: ["ministryMatches", "pastoralSteps", "biblicalEncouragement"]
        }
      }
    });

    // Extract text output directly using the .text property from GenerateContentResponse.
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
