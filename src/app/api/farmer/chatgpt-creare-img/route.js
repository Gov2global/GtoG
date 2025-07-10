// api/farmer/chatgpt-creare-img

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });
    const data = await res.json();
    if (data.error) {
      console.error("DALL·E error:", data.error); // <--- เพิ่ม log
      return Response.json({ imageUrl: "", error: data.error.message });
    }
    const imageUrl = data.data?.[0]?.url || "";
    return Response.json({ imageUrl });
  } catch (err) {
    console.error("DALL·E API Exception", err); // <--- เพิ่ม log
    return Response.json({ imageUrl: "", error: "server error" });
  }
}