import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


export async function getMovieRecommendations(preferences: { name: string; preference: string }[]) {
    const prompt = `
These are the preferences of a group of ${preferences.length} people:
${preferences.map(p => `- ${p.name}: "${p.preference}"`).join("\n")}

Suggest 6 real, existing movies that would satisfy all these tastes. For each, include:
- Title
- Year
- Why it's a good fit

Respond with a list like:
1. Title (Year): Reason
`;

    const chat = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5
    });

    const content = chat.choices[0]?.message?.content || "";

    const lines = content.split("\n").filter(line => line.match(/^\d+\.\s/));
    const parsed = lines.map(line => {
        const match = line.match(/^\d+\.\s(.+?)\s\((\d{4})\):\s(.+)/);
        if (match) {
        const [, title, year, why] = match;
        return { title, year: parseInt(year), why };
        }
        return null;
    }).filter(Boolean);

    return parsed;
}
