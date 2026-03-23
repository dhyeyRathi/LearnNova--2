# 🚀 Supabase Edge Function Setup - Real Email Receipts

This Edge Function enables real email receipts via Resend API without CORS issues.

## 📋 Prerequisites

1. **Supabase CLI installed**: https://supabase.com/docs/guides/cli
2. **Resend API Key**: From your Resend dashboard

## 🛠️ Setup Instructions

### Step 1: Login to Supabase CLI
```bash
supabase login
```

### Step 2: Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### Step 3: Set Environment Variables
```bash
# Set your Resend API key as a secret
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Step 4: Deploy the Edge Function
```bash
# Deploy the send-receipt function
supabase functions deploy send-receipt

# Or deploy all functions
supabase functions deploy
```

### Step 5: Test the Function
```bash
# Test locally
supabase functions serve

# Test the deployed function
curl -X POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-receipt' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "courseTitle": "Test Course",
    "price": 49.99,
    "userName": "Test User"
  }'
```

## ✅ Verification

Once deployed:

1. **Buy a course** in your app
2. **Complete payment**
3. **Check your email** for the receipt!
4. **Console should show**: `✅ Real email sent successfully:`

## 🔧 Troubleshooting

**Function deployment fails:**
- Ensure you're logged into Supabase CLI
- Check your project is linked correctly
- Verify your RESEND_API_KEY is set

**Email sending fails:**
- Check Resend API key is valid
- Verify your Resend account isn't rate limited
- Check the function logs: `supabase functions logs send-receipt`

**CORS errors:**
- The Edge Function handles CORS automatically
- Make sure you're calling the Edge Function, not Resend directly

## 📧 Email Features

The Edge Function sends beautiful HTML receipts with:
- ✅ Professional styling with LearnNova branding
- ✅ Complete order details (course, price, transaction ID)
- ✅ Next steps for accessing the course
- ✅ Support contact information
- ✅ Mobile-responsive design

## 🔗 Function URL

After deployment, your function will be available at:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-receipt
```

The PaymentModal.tsx is already configured to call this endpoint! 🎉