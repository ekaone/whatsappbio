import { OpenAIStream } from "@/utils/OpenAIStream";
import { OpenAIStreamPayload } from "@/shared/types";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export async function POST(request: Request, response: Response) {
  const { prompt } = (await request.json()) as {
    prompt?: string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a creator whatsapp biography." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 1024,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);

  return new Response(stream);
}
