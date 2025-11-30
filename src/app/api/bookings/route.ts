import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Resend } from "resend";
import type { BookingFormData } from "@/types/booking";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const data: BookingFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.phone || !data.service || !data.date || !data.slot || !data.address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create booking in Firestore
    const bookingData = {
      ...data,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "bookings"), bookingData);

    // Send customer confirmation email
    if (data.email) {
      try {
        await resend.emails.send({
          from: "Dr Dhobi <bookings@drdhobi.in>",
          to: data.email,
          subject: "🧺 Booking Confirmed - Dr Dhobi Laundry Service",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #0d3b66 0%, #1e8ba5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                  .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e8ba5; }
                  .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                  .detail-label { font-weight: bold; color: #0d3b66; }
                  .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                  .button { display: inline-block; padding: 12px 30px; background: #1e8ba5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🧺 Dr Dhobi</h1>
                    <p>Your Booking is Confirmed!</p>
                  </div>
                  <div class="content">
                    <h2>Hi ${data.name},</h2>
                    <p>Thank you for choosing Dr Dhobi! Your laundry service has been booked successfully.</p>
                    
                    <div class="booking-details">
                      <h3 style="color: #0d3b66; margin-top: 0;">Booking Details</h3>
                      <div class="detail-row">
                        <span class="detail-label">Service:</span>
                        <span>${data.service}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Pickup Date:</span>
                        <span>${new Date(data.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Time Slot:</span>
                        <span>${data.slot}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span>${data.address}</span>
                      </div>
                      ${data.notes ? `
                      <div class="detail-row">
                        <span class="detail-label">Special Instructions:</span>
                        <span>${data.notes}</span>
                      </div>
                      ` : ''}
                      <div class="detail-row" style="border-bottom: none;">
                        <span class="detail-label">Booking ID:</span>
                        <span>${docRef.id}</span>
                      </div>
                    </div>

                    <p><strong>What's Next?</strong></p>
                    <ul>
                      <li>Our team will call you 30 minutes before pickup</li>
                      <li>Please keep your laundry ready and sorted</li>
                      <li>We'll provide a detailed invoice at pickup</li>
                      <li>Track your order status via SMS updates</li>
                    </ul>

                    <p style="text-align: center;">
                      <a href="tel:+918080808080" class="button">📞 Call Us: 080-8080-8080</a>
                    </p>
                  </div>
                  <div class="footer">
                    <p>Dr Dhobi - Premium Doorstep Laundry Service</p>
                    <p>For any queries, reach us at hello@drdhobi.in or call 080-8080-8080</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send customer email:", emailError);
        // Don't fail the booking if email fails
      }
    }

    // Send admin notification email
    try {
      await resend.emails.send({
        from: "Dr Dhobi Bookings <bookings@drdhobi.in>",
        to: process.env.ADMIN_EMAIL || "hello@drdhobi.in",
        subject: `🔔 New Booking: ${data.name} - ${data.service}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #0d3b66; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .booking-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f4a259; }
                .detail { padding: 8px 0; }
                .label { font-weight: bold; color: #0d3b66; display: inline-block; width: 150px; }
                .urgent { background: #f4a259; color: white; padding: 10px; border-radius: 6px; text-align: center; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🔔 New Booking Received</h2>
                </div>
                <div class="content">
                  <div class="urgent">
                    <strong>Action Required:</strong> Contact customer to confirm pickup
                  </div>
                  
                  <div class="booking-card">
                    <h3 style="color: #0d3b66; margin-top: 0;">Customer Information</h3>
                    <div class="detail">
                      <span class="label">Name:</span>
                      <strong>${data.name}</strong>
                    </div>
                    <div class="detail">
                      <span class="label">Phone:</span>
                      <a href="tel:${data.phone}"><strong>${data.phone}</strong></a>
                    </div>
                    ${data.email ? `
                    <div class="detail">
                      <span class="label">Email:</span>
                      ${data.email}
                    </div>
                    ` : ''}
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                    
                    <h3 style="color: #0d3b66;">Service Details</h3>
                    <div class="detail">
                      <span class="label">Service Type:</span>
                      <strong>${data.service}</strong>
                    </div>
                    <div class="detail">
                      <span class="label">Pickup Date:</span>
                      ${new Date(data.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div class="detail">
                      <span class="label">Time Slot:</span>
                      ${data.slot}
                    </div>
                    <div class="detail">
                      <span class="label">Address:</span>
                      ${data.address}
                    </div>
                    ${data.notes ? `
                    <div class="detail">
                      <span class="label">Notes:</span>
                      ${data.notes}
                    </div>
                    ` : ''}
                    
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                    
                    <div class="detail">
                      <span class="label">Booking ID:</span>
                      <code>${docRef.id}</code>
                    </div>
                    <div class="detail">
                      <span class="label">Status:</span>
                      <span style="background: #ffd700; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">PENDING</span>
                    </div>
                  </div>
                  
                  <p style="margin-top: 20px; text-align: center;">
                    <a href="tel:${data.phone}" style="display: inline-block; padding: 12px 30px; background: #1e8ba5; color: white; text-decoration: none; border-radius: 6px;">📞 Call Customer Now</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (adminEmailError) {
      console.error("Failed to send admin email:", adminEmailError);
      // Don't fail the booking if admin email fails
    }

    return NextResponse.json({
      success: true,
      bookingId: docRef.id,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking. Please try again." },
      { status: 500 }
    );
  }
}
