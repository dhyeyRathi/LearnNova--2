import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface EmailRequest {
  email: string
  courseTitle: string
  price: number
  userName?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { email, courseTitle, price, userName }: EmailRequest = await req.json()

    if (!email || !courseTitle || !price) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, courseTitle, price' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable not set')
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}`
    const currentDate = new Date().toLocaleDateString()

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 8px;
            text-align: center;
          }
          .content { margin: 30px 0; }
          .order-details {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th { background: #f5f5f5; font-weight: bold; }
          .success { color: #10b981; font-weight: bold; font-size: 18px; }
          .footer {
            text-align: center;
            color: #666;
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
            font-size: 14px;
          }
          .next-steps {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
          }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 LearnNova</div>
            <h1 style="margin: 0; font-size: 28px;">✓ Payment Successful!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
          </div>

          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your payment has been processed successfully! You're now enrolled in <strong>${courseTitle}</strong> and can start learning immediately.</p>

            <div class="order-details">
              <h3 style="margin-top: 0; color: #333;">📋 Order Details</h3>
              <table>
                <tr>
                  <th>Course</th>
                  <td>${courseTitle}</td>
                </tr>
                <tr>
                  <th>Amount Paid</th>
                  <td class="success">$${price.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>${currentDate}</td>
                </tr>
                <tr>
                  <th>Transaction ID</th>
                  <td><code>${transactionId}</code></td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>${email}</td>
                </tr>
              </table>
            </div>

            <div class="next-steps">
              <h3 style="margin-top: 0; color: #1976d2;">🚀 What's Next?</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Visit your <strong>My Courses</strong> page to access the course</li>
                <li>Start learning at your own pace</li>
                <li>Complete quizzes to earn points and certificates</li>
                <li>Get AI-powered feedback from Nova</li>
              </ul>
            </div>

            <p>If you have any questions or need help, contact our support team at <a href="mailto:support@learnnova.com">support@learnnova.com</a></p>

            <p>Happy learning! 🎉</p>
            <p><strong>The LearnNova Team</strong></p>
          </div>

          <div class="footer">
            <p>© 2026 LearnNova. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
            <p style="font-size: 12px; opacity: 0.7;">Transaction processed securely via LearnNova Payment Gateway</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email via Resend API
    console.log('Sending email to:', email)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'LearnNova <onboarding@resend.dev>',
        to: email,
        subject: `🎓 Payment Receipt - ${courseTitle}`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: errorData.message || 'Unknown error'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = await response.json()
    console.log('Email sent successfully:', result.id)

    return new Response(
      JSON.stringify({
        success: true,
        emailId: result.id,
        message: `Receipt sent to ${email}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Send receipt error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})