import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const response = await resend.emails.send({
      from: 'noreply@learnnova.com',
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error('Email send error:', response.error);
      throw response.error;
    }

    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
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
    subject: '🎉 Welcome to LearnNova - Your Tutor Account Approved!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your tutor application has been approved</p>
        </div>

        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">Hi ${name},</p>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
            We're thrilled to inform you that your tutor application has been <strong>approved</strong>! 🌟
          </p>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            Your credentials to access the LearnNova instructor dashboard are ready. Use them to log in and start creating extraordinary courses.
          </p>

          <div style="background: white; border: 2px solid #fca5a5; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #7f1d1d; font-weight: bold; margin: 0 0 15px 0;">Your Login Credentials:</p>
            
            <div style="background: #fef2f2; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Teacher ID</p>
              <p style="color: #1f2937; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; margin: 0; word-break: break-all;">${teacherId}</p>
            </div>

            <div style="background: #fef2f2; padding: 12px; border-radius: 6px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Password</p>
              <p style="color: #1f2937; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; margin: 0; word-break: break-all;">${password}</p>
            </div>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 25px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
              ⚠️ <strong>Security Tip:</strong> Change your password immediately after your first login. Never share your credentials with anyone.
            </p>
          </div>

          <div style="margin: 30px 0;">
            <a href="https://learnnova.com/instructor/login" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Sign In Now</a>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Next Steps:</p>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
              <li>Log in to your instructor dashboard</li>
              <li>Complete your profile with a profile picture and bio</li>
              <li>Review our course creation guidelines</li>
              <li>Start creating your first course!</li>
            </ul>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 25px 0;">
            If you have any questions or need assistance, please don't hesitate to contact our support team at <strong>support@learnnova.com</strong>.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            Welcome to the LearnNova instructor community! We can't wait to see the amazing courses you'll create.
          </p>

          <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0 0; font-style: italic;">
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
