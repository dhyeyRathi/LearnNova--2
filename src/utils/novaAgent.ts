import { getChatResponse } from './geminiService';
import { tools, ToolResult } from './novaTools';
import type { CourseSummaryInput, QuizFeedbackInput, LearnerProgressInput, RecommendLessonInput } from './novaTools';
import {
  ASSISTANT_TOOL_DETECTION_PROMPT,
  ASSISTANT_QUIZ_EXPLANATION_PROMPT,
  ASSISTANT_PERSONALIZED_PROMPT,
  ASSISTANT_QUIZ_FEEDBACK_PROMPT,
  ASSISTANT_TOOL_RESULT_PROMPT,
} from './prompts';

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  tool_call?: {
    tool_name: string;
    tool_input: any;
    tool_result?: ToolResult;
  };
}

// Tool detection prompt imported from prompts.ts (AI Assistant category)
const TOOL_DETECTION_PROMPT = ASSISTANT_TOOL_DETECTION_PROMPT;

// Quiz explanation prompt imported from prompts.ts (AI Assistant category)
const QUIZ_EXPLANATION_PROMPT = ASSISTANT_QUIZ_EXPLANATION_PROMPT;

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
      const personalizedPrompt = ASSISTANT_PERSONALIZED_PROMPT(
        currentUser?.name || 'Student',
        currentUser?.points || 0,
        userMessage
      );

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

      // Check if this is a quiz feedback context
      const isQuizFeedback = detection.tool_name === 'give_quiz_feedback' ||
        userMessage.toLowerCase().includes('quiz') ||
        userMessage.toLowerCase().includes('score') ||
        userMessage.toLowerCase().includes('correct');



      const contextPrompt = isQuizFeedback
        ? ASSISTANT_QUIZ_FEEDBACK_PROMPT(
            userName,
            currentUser?.name || 'Student',
            currentUser?.points || 0,
            userMessage,
            detection.tool_name!,
            toolResult.data
          )
        : ASSISTANT_TOOL_RESULT_PROMPT(
            userName,
            currentUser?.name || 'Student',
            currentUser?.points || 0,
            currentUser?.role || 'learner',
            userMessage,
            detection.tool_name!,
            toolResult.data
          );

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
