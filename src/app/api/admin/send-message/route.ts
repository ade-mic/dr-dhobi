import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { type, to, customerName, bookingId, message } = await request.json();

    if (type === "email") {
      return NextResponse.json(
        { error: "Email delivery is not configured." },
        { status: 501 }
      );
    }

    if (type === "whatsapp") {
      // WhatsApp integration via Twilio or WhatsApp Business API
      // For now, we'll use a placeholder that can be integrated with actual service

      const whatsappUrl = process.env.WHATSAPP_API_URL;
      const whatsappToken = process.env.WHATSAPP_API_TOKEN;

      if (!whatsappUrl || !whatsappToken) {
        return NextResponse.json(
          {
            error:
              "WhatsApp not configured. Please add WHATSAPP_API_URL and WHATSAPP_API_TOKEN to environment variables.",
          },
          { status: 503 }
        );
      }

      // Example for Twilio WhatsApp API
      const response = await fetch(whatsappUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: `whatsapp:${to}`,
          from: "whatsapp:+14155238886", // Your Twilio WhatsApp number
          body: `🧺 *Dr Dhobi Update*\n\nHi ${customerName},\n\nBooking #${bookingId.slice(
            0,
            8
          )}\n\n${message}\n\n📞 Questions? Call: 080-8080-8080`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send WhatsApp message");
      }

      return NextResponse.json({
        success: true,
        message: "WhatsApp message sent successfully",
      });
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
