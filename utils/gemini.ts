const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY || "AIzaSyCJkm9YiLMEPR09t1l5TXo1va8rYOF6MWM"; // demo thôi!

export async function askGemini(prompt: string) {
   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

   const body = {
      contents: [
         {
            role: "user",
            parts: [{ text: prompt }],
         }, 
      ],
      generationConfig: {
         temperature: 0.7,
         maxOutputTokens: 512,
      },
   };

   const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
   });

   if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini error: ${res.status} ${errText}`);
   }
   const data = await res.json();

   // lấy text đầu tiên
   const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "(không có phản hồi)";
   return text;
}
