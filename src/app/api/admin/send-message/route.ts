import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { type, to, customerName, bookingId, message } = await request.json();

    if (!type || !to || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type === "email") {
      // Send email via Resend
      await resend.emails.send({
        from: "Dr Dhobi <hello@drdhobi.in>",
        to: to,
        subject: `Update on Your Booking #${bookingId.slice(0, 8)}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0d3b66 0%, #1e8ba5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #1e8ba5; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🧺 Dr Dhobi</h1>
                  <p>Booking Update</p>
                </div>
                <div class="content">
                  <h2>Hi ${customerName},</h2>
                  <p>We have an update regarding your booking <strong>#${bookingId.slice(0, 8)}</strong>:</p>
                  
                  <div class="message-box">
                    ${message.replace(/\n/g, '<br>')}
                  </div>

                  <p>If you have any questions, feel free to reach out to us!</p>

                  <p style="text-align: center; margin-top: 2rem;">
                    <a href="tel:+918080808080" style="display: inline-block; padding: 12px 30px; background: #1e8ba5; color: white; text-decoration: none; border-radius: 6px;">📞 Call Us: 080-8080-8080</a>
                  </p>
                </div>
                <div class="footer">
                  <p>Dr Dhobi - Premium Doorstep Laundry Service</p>
                  <p>For any queries, reach us at hello@drdhobi.in</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      return NextResponse.json({ success: true, message: "Email sent successfully" });
    } else if (type === "whatsapp") {
      // WhatsApp integration via Twilio or WhatsApp Business API
      // For now, we'll use a placeholder that can be integrated with actual service
      
      const whatsappUrl = process.env.WHATSAPP_API_URL;
      const whatsappToken = process.env.WHATSAPP_API_TOKEN;

      if (!whatsappUrl || !whatsappToken) {
        return NextResponse.json(
          { error: "WhatsApp not configured. Please add WHATSAPP_API_URL and WHATSAPP_API_TOKEN to environment variables." },
          { status: 503 }
        );
      }

      // Example for Twilio WhatsApp API
      const response = await fetch(whatsappUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: `whatsapp:${to}`,
          from: "whatsapp:+14155238886", // Your Twilio WhatsApp number
          body: `🧺 *Dr Dhobi Update*\n\nHi ${customerName},\n\nBooking #${bookingId.slice(0, 8)}\n\n${message}\n\n📞 Questions? Call: 080-8080-8080`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send WhatsApp message");
      }

      return NextResponse.json({ success: true, message: "WhatsApp message sent successfully" });
    }

    return NextResponse.json(
      { error: "Invalid message type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
