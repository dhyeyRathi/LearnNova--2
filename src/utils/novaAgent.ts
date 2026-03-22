import { getChatResponse } from './geminiService';
import { tools, ToolResult } from './novaTools';
import type { CourseSummaryInput, QuizFeedbackInput, LearnerProgressInput, RecommendLessonInput } from './novaTools';

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  tool_call?: {
    tool_name: string;
    tool_input: any;
    tool_result?: ToolResult;
  };
}

const TOOL_DETECTION_PROMPT = `You are Nova, a warm, encouraging AI learning companion. Your goal is to help students succeed! 🌟

When a user's message indicates they need help, decide whether to use a tool that fetches real data:

AVAILABLE TOOLS (fetch real student data):
1. summarize_course - Use when: "What is this about?" "Course overview" "Syllabus" 
2. give_quiz_feedback - Use when: "How did I do?" "What did I get wrong?" "My score was..."
3. get_learner_progress - Use when: "My points?" "What badge am I?" "Am I progressing?" "How far along?"
4. recommend_next_lesson - Use when: "What's next?" "Where do I go from here?" "Help me continue"

RESPONSE FORMAT:
If a tool should be used, respond ONLY with JSON (no other text):
{
  "should_use_tool": true,
  "tool_name": "tool_name_here",
  "tool_input": { "field1": "value1", "field2": "value2" }
}

If NO tool needed, respond ONLY with JSON:
{
  "should_use_tool": false,
  "response": "Your warm, encouraging response here..."
}

PERSONALITY GUIDELINES: 
- Be like a supportive tutor, not a textbook
- Use the learner's first name if asking for help
- Celebrate their effort, not just results
- Offer specific, actionable next steps
- Use varied encouraging phrases: "Great thinking!", "Love the effort!", "This is important!"
- Light emojis when natural: 🎉 🚀 💡 ✨
- Keep responses 80-150 words (unless detailed feedback needed)
- Never respond as just "I don't know" - always add helpful guidance`;

/**
 * Detect if a tool should be called from user input
 */
export async function detectToolUsage(userMessage: string): Promise<{
  should_use_tool: boolean;
  tool_name?: string;
  tool_input?: any;
  response?: string;
}> {
  try {
    console.log('🔍 Detecting tool usage for:', userMessage);
    
    // Send to Gemini for tool detection
    const detectionPrompt = `${TOOL_DETECTION_PROMPT}\n\nUser message: "${userMessage}"\n\nRespond with ONLY valid JSON.`;
    
    const response = await getChatResponse(detectionPrompt);
    console.log('📩 Tool detection response:', response);
    
    // Parse JSON response
    try {
      const parsed = JSON.parse(response);
      console.log('✅ Parsed tool detection:', parsed);
      return parsed;
    } catch {
      // If parsing fails, assume no tool needed
      console.log('⚠️ Could not parse JSON, treating as no-tool response');
      return {
        should_use_tool: false,
        response: response,
      };
    }
  } catch (error) {
    console.error('🔴 Tool detection error:', error);
    return {
      should_use_tool: false,
      response: 'I encountered an error processing your request. Please try again.',
    };
  }
}

/**
 * Execute a tool and return results
 */
export async function executeTool(toolName: string, toolInput: any, currentUser?: any): Promise<ToolResult> {
  try {
    const tool = tools.find(t => t.name === toolName);
    if (!tool) {
      return { success: false, error: `Tool ${toolName} not found` };
    }

    // Validate input
    const validation = tool.schema.safeParse(toolInput);
    if (!validation.success) {
      return { success: false, error: `Invalid input: ${validation.error.message}` };
    }

    // If learner_id is not specified and user is available, use current user's ID
    if (currentUser && (toolInput.learner_id === 'default' || !toolInput.learner_id)) {
      toolInput.learner_id = currentUser.id;
    }

    // Execute tool with validated data (cast to any to handle different tool input types)
    // Pass currentUser as second parameter for context-aware execution
    const result = await (tool.execute as (input: any, user?: any) => Promise<ToolResult>)(validation.data, currentUser);
    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Process user message with tool support
 */
export async function processWithTools(userMessage: string, currentUser?: any): Promise<string> {
  try {
    // Step 1: Detect if a tool should be used
    const detection = await detectToolUsage(userMessage);

    if (!detection.should_use_tool) {
      // No tool needed, but still personalize the response
      const userName = currentUser?.name?.split(' ')[0] || 'there';
      const personalizedPrompt = `You are Nova, an engaging AI learning companion! 🌟

LEARNER CONTEXT:
- Name: ${currentUser?.name || 'Student'}
- Points earned so far: ${currentUser?.points || 0}

USER MESSAGE: "${userMessage}"

WITHOUT using any tools, provide a warm, encouraging response that:
1. Feels personal (like from a tutor who knows ${userName})
2. Relates to their learning journey
3. Is helpful and actionable
4. Uses natural language (no "as an AI" language)
5. Is 60-120 words typically
6. Uses 0-1 light emoji if appropriate (✨ 🚀 💡 🎉)

Respond naturally without mentioning tools or data fetching.`;

      return await getChatResponse(personalizedPrompt);
    }

    // Step 2: Execute the tool with current user context
    if (detection.tool_name) {
      const toolResult = await executeTool(detection.tool_name, detection.tool_input, currentUser);

      if (!toolResult.success) {
        const userName = currentUser?.name?.split(' ')[0] || 'there';
        return `Hi ${userName}! I ran into a small issue accessing that data (${toolResult.error}), but don't worry - try rephrasing your question or asking again in a moment. I'm here to help! 💪`;
      }

      // Step 3: Generate a response based on tool results
      const userName = currentUser?.name?.split(' ')[0] || 'there'; // Get first name for personalization
      const contextPrompt = `You are Nova, an AI learning companion who genuinely cares about student success! 🌟

LEARNER CONTEXT:
- Name: ${currentUser?.name || 'Student'}
- Current achievements: ${currentUser?.points || 0} points earned
- Role: ${currentUser?.role === 'learner' ? 'Learner' : 'Instructor'}

INTERACTION:
- User asked: "${userMessage}"
- Tool used: ${detection.tool_name}
- Real-time data: ${JSON.stringify(toolResult.data, null, 2)}

RESPONSE GUIDELINES:
1. **Personalize**: Use "${userName}" when addressing them directly
2. **Celebrate**: Acknowledge actual achievements with specific praise:
   - If points < 100: "You're building great momentum!"
   - If 100+ points: "Impressive progress! You're really dedicated!"
   - If progressing to next badge: "You're so close to [Badge]! Keep it up! 🎯"
3. **Be specific**: Reference actual data (badge name, points earned, lesson topics)
4. **Encourage action**: Always suggest a concrete next step
5. **Tone**: Like a supportive tutor who knows the student personally
6. **Length**: Usually 60-120 words (except detailed feedback)
7. **Emojis**: 1-2 relevant emojis max, only when it adds warmth (✨ 🚀 💡 🎉 ⭐)
8. **Avoid**: Generic responses, "as a robot" language, excessive punctuation

Now generate a response that feels like it's from someone who knows ${userName} and celebrates their learning journey.`;

      const finalResponse = await getChatResponse(contextPrompt);
      return finalResponse;
    }

    return detection.response || 'How can I help you with your learning journey?';
  } catch (error) {
    console.error('Tool processing error:', error);
    return "I'm having trouble processing that request right now, but I'm still here to help! Try again in a moment. 💙";
  }
}

/**
 * Tool-aware chat function to replace standard chat
 */
export async function toolAwareChatResponse(userMessage: string, currentUser?: any): Promise<string> {
  return processWithTools(userMessage, currentUser);
}
