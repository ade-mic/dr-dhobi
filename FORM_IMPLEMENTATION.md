# Form Implementation Guide

## 🔧 Next Steps: Making Forms Functional

Currently, the forms are styled and ready but need backend implementation. Here's how to make them functional:

## Option 1: Email Submission (Quick Setup)

### Using EmailJS (Free Tier Available)

1. **Sign up** at [EmailJS](https://www.emailjs.com/)

2. **Install EmailJS**:
```bash
npm install @emailjs/browser
```

3. **Create a form handler** in `src/lib/emailService.ts`:
```typescript
import emailjs from '@emailjs/browser';

export const sendQuoteRequest = async (formData: {
  name: string;
  phone: string;
  email: string;
  service: string;
  items: string;
}) => {
  try {
    const response = await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      formData,
      'YOUR_PUBLIC_KEY'
    );
    return { success: true, message: 'Quote request sent!' };
  } catch (error) {
    return { success: false, message: 'Failed to send request' };
  }
};

export const sendContactMessage = async (formData: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) => {
  // Similar implementation
};
```

4. **Update forms to use the handler** (add 'use client' directive):
```typescript
'use client';
import { useState } from 'react';
import { sendQuoteRequest } from '@/lib/emailService';

// In your form component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  // Process and send
};
```

## Option 2: API Route (Recommended for Production)

### Create API Route

1. **Create** `src/app/api/quote/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Send email using Nodemailer, SendGrid, etc.
  // Or save to database
  
  return NextResponse.json({ 
    success: true, 
    message: 'Quote request received' 
  });
}
```

2. **Create** `src/app/api/contact/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Process contact form
  
  return NextResponse.json({ 
    success: true, 
    message: 'Message received' 
  });
}
```

### Using Nodemailer

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'hello@drdhobi.com',
  subject: 'New Quote Request',
  html: `<p>Name: ${data.name}</p>...`,
});
```

## Option 3: Database Storage

### Using Firebase (Already in your project!)

1. **Update Firebase configuration** in `src/lib/firebase.ts`

2. **Add Firestore functions**:
```typescript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const saveQuoteRequest = async (data: any) => {
  const docRef = await addDoc(collection(db, 'quotes'), {
    ...data,
    createdAt: new Date(),
    status: 'pending'
  });
  return docRef.id;
};
```

## Option 4: Third-Party Form Services

### Formspree (Easiest)
1. Sign up at [Formspree](https://formspree.io/)
2. Update form action:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### Google Forms Integration
- Create Google Form
- Embed or use API to submit

## 🎯 Recommended Approach

**For MVP/Quick Launch**: Use EmailJS or Formspree
**For Production**: Use Next.js API Routes + Nodemailer + Database

## 📧 Email Template Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #0D3B66; color: white; padding: 20px; }
    .content { padding: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>New Quote Request - Dr Dhobi</h1>
  </div>
  <div class="content">
    <h2>Customer Details</h2>
    <p><strong>Name:</strong> {{name}}</p>
    <p><strong>Phone:</strong> {{phone}}</p>
    <p><strong>Email:</strong> {{email}}</p>
    <p><strong>Service:</strong> {{service}}</p>
    <p><strong>Items:</strong> {{items}}</p>
  </div>
</body>
</html>
```

## 🔐 Environment Variables

Create `.env.local`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
```

## ✅ Form Validation

Add client-side validation:
```typescript
const validateForm = (data: FormData) => {
  const phone = data.get('phone') as string;
  const email = data.get('email') as string;
  
  if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
    return { valid: false, error: 'Invalid phone number' };
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Invalid email' };
  }
  
  return { valid: true };
};
```

## 🎨 Success/Error Messages

Add toast notifications:
```bash
npm install react-hot-toast
```

```typescript
import toast from 'react-hot-toast';

const handleSubmit = async (e) => {
  e.preventDefault();
  toast.loading('Sending...');
  
  try {
    // Send form
    toast.success('Quote request sent!');
  } catch (error) {
    toast.error('Failed to send. Please try again.');
  }
};
```

## 🚀 Quick Implementation Checklist

- [ ] Choose form submission method
- [ ] Set up email service or database
- [ ] Add form validation
- [ ] Implement error handling
- [ ] Add success/error notifications
- [ ] Test all form fields
- [ ] Add rate limiting (prevent spam)
- [ ] Set up email templates
- [ ] Configure environment variables
- [ ] Test on mobile devices

Choose the approach that best fits your needs and timeline! 🎯
