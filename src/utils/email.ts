// Email service disabled - use Supabase auth emails instead
// To re-enable: Create a backend API route or Supabase Edge Function
// Resend cannot be called from browser due to CORS restrictions

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Temporarily disabled - using Supabase built-in email instead
    console.log('📧 Email queued (using Supabase):', { to, subject });
    return { id: 'email-queued', from: 'noreply@learnnova.com' };
  } catch (error) {
    console.error('Error queueing email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to LearnNova!',
    html: `
      <h1>Welcome to LearnNova, ${name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Start your learning journey today!</p>
    `,
  });
}

export async function sendCourseEnrollmentEmail(
  email: string,
  userName: string,
  courseName: string
) {
  return sendEmail({
    to: email,
    subject: `You're enrolled in ${courseName}`,
    html: `
      <h2>Course Enrollment Confirmation</h2>
      <p>Hi ${userName},</p>
      <p>You have successfully enrolled in <strong>${courseName}</strong>.</p>
      <p>Start learning now!</p>
    `,
  });
}

export async function sendQuizCompletionEmail(
  email: string,
  userName: string,
  courseName: string,
  score: number
) {
  return sendEmail({
    to: email,
    subject: `Quiz Results - ${courseName}`,
    html: `
      <h2>Quiz Completed</h2>
      <p>Hi ${userName},</p>
      <p>You completed the quiz for <strong>${courseName}</strong>.</p>
      <p><strong>Your Score: ${score}%</strong></p>
    `,
  });
}

export async function sendCredentialsEmail(
  email: string,
  teacherId: string,
  password: string,
  name: string
) {
  return sendEmail({
    to: email,
    subject: '🚀 Your LearnNova Instructor Account is Ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;">
        <!-- Wrapper -->
        <div style="max-width: 650px; margin: 0 auto; background-color: white;box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          
          <!-- Hero Section -->
          <div style="background: linear-gradient(135deg, #7C3AED 0%, #6B21A8 100%); padding: 50px 40px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: relative; z-index: 1;">
              <div style="font-size: 50px; margin-bottom: 15px;">🎉</div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Congratulations!</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">Your instructor account has been approved</p>
            </div>
          </div>

          <!-- Main Content -->
          <div style="padding: 45px 40px;">
            
            <!-- Greeting -->
            <p style="color: #1f2937; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">
              Hi <strong>${name}</strong>,
            </p>

            <!-- Welcome Message -->
            <div style="background: linear-gradient(135deg, #F3F0FF 0%, #EDE9FE 100%); border-left: 4px solid #7C3AED; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
                We're excited to welcome you to the <strong>LearnNova instructor community</strong>! Your profile has been verified and approved. You now have full access to create engaging courses and impart knowledge to thousands of learners.
              </p>
            </div>

            <!-- Credentials Section -->
            <div style="margin: 35px 0;">
              <p style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin: 0 0 20px 0;">Login Credentials</p>
              
              <!-- Credential Cards -->
              <div style="display: block;">
                <!-- Teacher ID Card -->
                <div style="background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%); border-radius: 12px; padding: 25px; margin-bottom: 15px; box-shadow: 0 10px 20px rgba(124, 58, 237, 0.15);">
                  <p style="color: rgba(255,255,255,0.85); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 600;">Teacher ID</p>
                  <p style="color: white; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace; font-size: 18px; font-weight: 700; margin: 0; word-break: break-all; letter-spacing: 0.5px;">${teacherId}</p>
                </div>

                <!-- Password Card -->
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; padding: 25px; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);">
                  <p style="color: rgba(255,255,255,0.85); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0; font-weight: 600;">Password</p>
                  <p style="color: white; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace; font-size: 18px; font-weight: 700; margin: 0; word-break: break-all; letter-spacing: 0.5px;">${password}</p>
                </div>
              </div>
            </div>

            <!-- Security Warning -->
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px; margin: 30px 0; border-right: 1px solid #fef3c7;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>🔐 Security Reminder:</strong> Change your password within 24 hours of your first login. Keep your credentials confidential and never share them via email or messaging platforms.
              </p>
            </div>

            <!-- Call to Action Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://learnnova.com/instructor/login" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #6B21A8 100%); color: white; padding: 16px 45px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3); transition: all 0.3s ease;">
                Sign In to Your Dashboard →
              </a>
            </div>

            <!-- Next Steps -->
            <div style="background: #f5f5f5; padding: 25px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #1f2937; font-size: 15px; font-weight: 700; margin: 0 0 18px 0; text-transform: uppercase; letter-spacing: 0.5px;">Getting Started</h3>
              <div style="color: #374151; font-size: 14px; line-height: 2;">
                <div style="display: flex; margin-bottom: 12px;">
                  <span style="color: #7C3AED; font-weight: 700; margin-right: 12px;">1.</span>
                  <span>Log in with your credentials above</span>
                </div>
                <div style="display: flex; margin-bottom: 12px;">
                  <span style="color: #7C3AED; font-weight: 700; margin-right: 12px;">2.</span>
                  <span>Complete your instructor profile</span>
                </div>
                <div style="display: flex; margin-bottom: 12px;">
                  <span style="color: #7C3AED; font-weight: 700; margin-right: 12px;">3.</span>
                  <span>Review course creation guidelines</span>
                </div>
                <div style="display: flex;">
                  <span style="color: #7C3AED; font-weight: 700; margin-right: 12px;">4.</span>
                  <span>Create your first course and inspire learners!</span>
                </div>
              </div>
            </div>

            <!-- Features Highlight -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%); padding: 25px; border-radius: 10px; margin: 30px 0; border: 1px solid #dbeafe;">
              <h3 style="color: #1f2937; font-size: 15px; font-weight: 700; margin: 0 0 15px 0;">What You Can Do Now</h3>
              <ul style="margin: 0 0 0 20px; padding: 0; color: #374151; font-size: 14px; line-height: 2;">
                <li>✅ Create unlimited courses with multimedia content</li>
                <li>✅ Design interactive quizzes and assessments</li>
                <li>✅ Track student progress and engagement</li>
                <li>✅ Earn from course sales and subscriptions</li>
                <li>✅ Collaborate with other instructors</li>
              </ul>
            </div>

            <!-- Support Section -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                Questions or need help? Our instructor support team is ready to assist you.
              </p>
              <p style="margin: 0;">
                <a href="mailto:support@learnnova.com" style="color: #7C3AED; text-decoration: none; font-weight: 600;">support@learnnova.com</a> | 
                <a href="https://learnnova.com/help/instructors" style="color: #7C3AED; text-decoration: none; margin-left: 15px; font-weight: 600;">Help Center</a>
              </p>
            </div>

            <!-- Closing -->
            <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0 0; line-height: 1.6;">
              Welcome aboard! We can't wait to see the amazing learning experiences you'll create.<br><br>
              <strong style="color: #1f2937;">The LearnNova Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #1f2937; padding: 30px 40px; text-align: center; border-top: 1px solid #111827;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 15px 0;">
              © 2026 LearnNova. All rights reserved.
            </p>
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
              This is an automated message. Please do not reply directly to this email address.
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  });
}

export async function sendApplicationRejectionEmail(
  email: string,
  name: string
) {
  return sendEmail({
    to: email,
    subject: 'Update on Your LearnNova Tutor Application',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Application Update</h1>
        </div>

        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hi ${name},</p>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for your interest in becoming a LearnNova tutor. We've reviewed your application carefully, and unfortunately, we won't be moving forward with your application at this time.
          </p>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            This decision was made to ensure we maintain our high standards for educators. We encourage you to reapply in the future—we'd love to see your progress and growth as an educator.
          </p>

          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 25px 0;">
            <p style="color: #065f46; font-size: 14px; margin: 0; font-weight: 500;">
              💡 <strong>Feedback:</strong> We encourage you to develop your expertise further and consider reapplying later.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 25px 0;">
            If you have questions about your application, feel free to reach out to us at <strong>support@learnnova.com</strong>.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            Best regards,<br>
            The LearnNova Team
          </p>
        </div>

        <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2026 LearnNova. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
}
