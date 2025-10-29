import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { layouts, photos } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Planning photobook for ${photos.length} photos with ${Object.keys(layouts).length} layouts`);

    // Build prompt for AI
    const systemPrompt = `You are a professional magazine-quality photobook designer. Create stunning, visually impactful layouts that tell a story.

Available Layouts:
${JSON.stringify(layouts, null, 2)}

Images to arrange:
${JSON.stringify(photos, null, 2)}

DESIGN PRINCIPLES:
1. **Visual Hierarchy & Impact**:
   - Create hero moments: Use large frames for the most striking images
   - Balance bold statements with supporting details
   - Vary frame sizes to create dynamic rhythm across pages

2. **Orientation Matching** (Critical):
   - Portrait images → Tall/vertical frames (prioritize layouts with portrait orientation)
   - Landscape images → Wide/horizontal frames (prioritize landscape layouts)
   - Square images → Flexible placement

3. **Page Flow & Storytelling**:
   - Alternate between dense and spacious layouts for visual breathing room
   - Create narrative progression across pages
   - Consider left-right page relationships in book view

4. **Professional Composition**:
   - Use whitespace strategically (empty frames can enhance design)
   - Balance visual weight across left and right pages
   - Create intentional focal points on each page

5. **Technical Requirements**:
   - Use each image exactly once (no duplicates)
   - frame_number starts at 1 and goes up to frameCount
   - Distribute images thoughtfully (quality over quantity)

GOAL: Create a magazine-quality photobook with professional visual flow, strong focal points, and balanced composition.`;

    // Call Lovable AI with tool calling for structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Create a photobook layout plan for these images.' }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_photobook_plan",
              description: "Return page layouts with frame assignments for a photobook",
              parameters: {
                type: "object",
                properties: {
                  pages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        layout_to_use: {
                          type: "string",
                          description: "Name of the layout template (e.g., 'layout3.svg')"
                        },
                        frames: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              frame_number: {
                                type: "integer",
                                minimum: 1,
                                description: "Frame index in the SVG (1-based, must be <= frameCount)"
                              },
                              image_id: {
                                type: "string",
                                description: "ID of the photo to place in this frame"
                              }
                            },
                            required: ["frame_number", "image_id"],
                            additionalProperties: false
                          }
                        }
                      },
                      required: ["layout_to_use", "frames"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["pages"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_photobook_plan" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received:', JSON.stringify(aiResponse, null, 2));

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== 'create_photobook_plan') {
      throw new Error('Invalid AI response: no tool call found');
    }

    const plan = JSON.parse(toolCall.function.arguments);
    console.log(`Generated plan with ${plan.pages.length} pages`);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in plan-photobook function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
