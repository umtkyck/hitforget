import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/ai/generate-code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, provider = 'openai', hardwareType, language = 'cpp' } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert embedded systems developer. Generate production-ready code for ${hardwareType || 'embedded hardware'} in ${language}.
Include:
- Clean, well-commented code
- Error handling
- Best practices for embedded systems
- Memory efficiency considerations

Format the response as JSON with:
{
  "code": "the generated code",
  "explanation": "brief explanation of the code",
  "files": [{"filename": "main.cpp", "content": "..."}]
}`;

    let generatedCode;
    let tokensUsed = 0;

    if (provider === 'openai') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      generatedCode = completion.choices[0].message.content;
      tokensUsed = completion.usage?.total_tokens || 0;
    } else if (provider === 'anthropic') {
      const message = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${prompt}` },
        ],
      });

      generatedCode = message.content[0].type === 'text' ? message.content[0].text : '';
      tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
    }

    // Try to parse as JSON, fallback to plain text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedCode || '{}');
    } catch {
      parsedResponse = {
        code: generatedCode,
        explanation: 'Generated code',
        files: [{ filename: 'main.cpp', content: generatedCode }],
      };
    }

    // TODO: Save to database (ai_executions table)
    // TODO: Calculate cost based on tokens

    return NextResponse.json({
      success: true,
      ...parsedResponse,
      metadata: {
        provider,
        model: provider === 'openai' ? 'gpt-4-turbo' : 'claude-3-opus',
        tokensUsed,
      },
    });
  } catch (error) {
    console.error('Error generating code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate code' },
      { status: 500 }
    );
  }
}
