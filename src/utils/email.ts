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
