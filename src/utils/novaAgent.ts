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

const TOOL_DETECTION_PROMPT = `You are Nova, an AI learning assistant. When a user's message indicates they need to use one of these tools, respond with a special JSON format:

AVAILABLE TOOLS:
1. summarize_course - Use when: user asks for a summary, overview, TL;DR, or "what is this course about"
2. give_quiz_feedback - Use when: user mentions quiz results, score, attempt, or asks "how did I do"
3. get_learner_progress - Use when: user asks about points, badge, rank, or progress
4. recommend_next_lesson - Use when: user asks what to do next, what to study, or needs guidance

RESPONSE FORMAT:
If a tool should be used, respond in this EXACT JSON format (no other text before/after):
{
  "should_use_tool": true,
  "tool_name": "tool_name_here",
  "tool_input": { "field1": "value1", "field2": "value2" }
}

If NO tool is needed, respond with:
{
  "should_use_tool": false,
  "response": "Your natural response to the user here..."
}

IMPORTANT: 
- For course_id/quiz_id/learner_id: Use "default" or "course-001"/"learner-001" if user doesn't specify
- Always try to extract needed parameters from the message
- Be warm, encouraging, and use brief responses (under 120 words unless detailed feedback)
- Never use tools for general conversation`;

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
export async function executeTool(toolName: string, toolInput: any): Promise<ToolResult> {
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

    // Execute tool with validated data (cast to any to handle different tool input types)
    const result = await (tool.execute as (input: any) => Promise<ToolResult>)(validation.data);
    return result;
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Process user message with tool support
 */
export async function processWithTools(userMessage: string): Promise<string> {
  try {
    // Step 1: Detect if a tool should be used
    const detection = await detectToolUsage(userMessage);

    if (!detection.should_use_tool) {
      // No tool needed, return response from Gemini via detection
      return detection.response || 'How can I help you with your learning journey?';
    }

    // Step 2: Execute the tool
    if (detection.tool_name) {
      const toolResult = await executeTool(detection.tool_name, detection.tool_input);

      if (!toolResult.success) {
        return `I encountered an error: ${toolResult.error}. Please try again.`;
      }

      // Step 3: Generate a response based on tool results
      const contextPrompt = `You are Nova, a warm and encouraging AI learning assistant. 
The user asked: "${userMessage}"

Tool used: ${detection.tool_name}
Tool results: ${JSON.stringify(toolResult.data, null, 2)}

Now provide a helpful, encouraging response based on the tool results. Keep it under 120 words unless providing detailed feedback. Be warm, use the learner's achievements positively, and always end with encouragement or a next step.`;

      const finalResponse = await getChatResponse(contextPrompt);
      return finalResponse;
    }

    return detection.response || 'How can I help you?';
  } catch (error) {
    console.error('Tool processing error:', error);
    return "I'm having trouble processing that request. Please try again!";
  }
}

/**
 * Tool-aware chat function to replace standard chat
 */
export async function toolAwareChatResponse(userMessage: string): Promise<string> {
  return processWithTools(userMessage);
}
