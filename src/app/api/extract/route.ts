import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { transcript, teamMembers = [] } = await req.json();

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide meeting notes or a transcript to extract tasks.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!apiKey || apiKey.includes('your_openrouter_api_key')) {
      return NextResponse.json(
        {
          error:
            'OpenRouter API Key is not configured. Please add your OPENROUTER_API_KEY in .env.local or via Settings.',
        },
        { status: 400 }
      );
    }

    const teamListStr = Array.isArray(teamMembers) && teamMembers.length > 0
      ? teamMembers.join(', ')
      : 'None specified';

    const systemPrompt = `You are an expert AI meeting assistant and project manager.
Your task is to analyze meeting notes or transcripts and extract all actionable tasks and to-dos.

Given the list of known team members: [${teamListStr}], assign each task to the most appropriate person mentioned in the transcript. If an owner is not mentioned or unclear, set the owner to "Unassigned".

For deadlines, detect any mentioned due dates, timeframes, or deadlines relative to the meeting (format as YYYY-MM-DD). If no deadline is mentioned, return an empty string "".

STRICT REQUIREMENT: Respond ONLY with a valid JSON object matching this schema:
{
  "tasks": [
    {
      "description": "Clear and actionable task description",
      "owner": "Full Name or Unassigned",
      "deadline": "YYYY-MM-DD or empty string"
    }
  ]
}
Do not include markdown codeblocks, commentary, or text outside the JSON object.`;

    const userPrompt = `Here is the meeting transcript / notes:\n\n${transcript}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Meeting Task Manager',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      return NextResponse.json(
        { error: `OpenRouter API error (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    // Safely parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI response could not be parsed as JSON: ' + content.slice(0, 100));
      }
    }

    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];

    return NextResponse.json({ tasks });
  } catch (err: any) {
    console.error('Extraction error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while extracting tasks.' },
      { status: 500 }
    );
  }
}

