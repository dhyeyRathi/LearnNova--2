# How to Upload Email Template to Supabase

## Steps to Upload Custom Email Template

### 1. Go to Supabase Dashboard
- Visit [app.supabase.com](https://app.supabase.com)
- Select your project: **LearnNova**

### 2. Navigate to Auth Settings
- Go to **Authentication** (left sidebar)
- Click **Email Templates** 
- Look for **Confirm Signup** template

### 3. Update the Template
- Click the **Edit** icon (pencil) next to "Confirm Signup"
- Delete the existing template
- Copy the entire HTML from `email-template.html` and paste it into the template editor
- Click **Save**

### 4. Template Variables
The template uses these Supabase variables that will be automatically replaced:
- `{{ .ConfirmationURL }}` - The email verification link (e.g., `https://learn-nova-odoo.netlify.app/confirm-email?token=...`)
- `{{ .Date | formatDate "2006" }}` - Current year

### 5. Test the Template
- Go to **Authentication → Users**
- Create a test user
- Check the test email to verify the template appears correctly

## Email Template Features

✅ **Responsive Design** - Works on mobile, tablet, and desktop
✅ **Professional Branding** - LearnNova logo and red gradient theme
✅ **Clear CTA** - Bold verification button
✅ **Fallback Link** - Plain text link for email clients that don't support HTML
✅ **Security Info** - Explains link expiration and phishing safety
✅ **Mobile Optimized** - Adapts layout for small screens
✅ **Accessible** - Proper semantic HTML and color contrast

## Important Notes

⚠️ **Link Expiration**: Supabase automatically expires verification links after 24 hours (configured in Auth settings)

⚠️ **From Address**: The "From" address is configured in Supabase SMTP settings (currently using Resend API)

⚠️ **Custom Domain**: Make sure `{{ .ConfirmationURL }}` matches your production domain (`learn-nova-odoo.netlify.app`)

## Customization Options

You can modify:
- Colors (currently red: `#ef4444`, `#dc2626`)
- Font sizes and spacing
- Company name and tagline
- Footer links
- Support contact information

Just maintain the `{{ .ConfirmationURL }}` placeholder for the verification link to work properly.

## Testing Before Production

1. Create a test account on your staging environment
2. Verify the email renders correctly in Gmail, Outlook, Apple Mail
3. Test the verification link works
4. Confirm users are redirected to login page after verification
