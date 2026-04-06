import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => (process.env.GEMINI_API_KEY || '');

export async function interpretDream(
  dreamDescription: string,
  lang: 'en' | 'ar' = 'ar'
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const systemInstruction = lang === 'ar'
    ? `أنت محلل أحلام خبير وعالم نفسي مع معرفة عميقة بـ:
- تفسير الأحلام الإسلامي
- علم النفس التحليلي اليونغي والأقنعة
- تحليل الأحلام الفرويدي
- الرمزية عبر الثقافات في الأحلام

قدم تفسيراً مفكراً متعدد الطبقات يتضمن:
1. **الرموز الرئيسية**: الرموز الرئيسية في الحلم ومعانيها
2. **التحليل النفسي**: ما قد يكشفه الحلم عن لاوعي الحالم
3. **التفسير الروحي**: الدلالة الروحية أو الثقافية
4. **الرسالة المخفية**: الرسالة الأساسية أو الدرس
5. **نصيحة**: توجيه لطيف بناءً على التفسير

مهم: أضف دائماً تنويهاً بأن هذا للأغراض الترفيهية فقط ولا يغني عن الاستشارة المهنية.
أجب بالعربية. كن دافئاً وثاقفاً ومحترماً.`
    : `You are an expert dream analyst and psychologist with deep knowledge of:
- Jungian psychology and archetypes
- Freudian dream analysis
- Cross-cultural symbolism in dreams
- Spiritual and mystical dream traditions

Provide a thoughtful, multi-layered dream interpretation that includes:
1. **Main Symbols**: Key symbols found in the dream and their meanings
2. **Psychological Analysis**: What the dream might reveal about the dreamer's subconscious
3. **Spiritual Interpretation**: Spiritual or cultural significance
4. **Hidden Message**: The underlying message or lesson
5. **Advice**: Gentle guidance based on the interpretation

IMPORTANT: Always include a disclaimer that this is for entertainment purposes only.
Be insightful, warm, and respectful.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: dreamDescription,
      config: { systemInstruction, temperature: 0.7, maxOutputTokens: 1000 },
    });
    return response.text || (lang === 'ar' ? 'لم يتم الحصول على تفسير.' : 'No interpretation available.');
  } catch (error) {
    console.error("Error interpreting dream:", error);
    throw new Error("Failed to interpret dream");
  }
}
