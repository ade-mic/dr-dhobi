/**
 * Firebase Cloud Function to send push notifications
 * when new bookings are created
 */

import {setGlobalOptions} from "firebase-functions/v2";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

setGlobalOptions({maxInstances: 10});

export const sendBookingNotification = onDocumentCreated(
  "bookings/{bookingId}",
  async (event) => {
    const bookingData = event.data?.data();
    const bookingId = event.params.bookingId;

    if (!bookingData) {
      logger.warn("No booking data found");
      return;
    }

    logger.info("New booking created:", bookingId);

    try {
      // Get all admin FCM tokens
      const tokensSnapshot = await admin
        .firestore()
        .collection("adminTokens")
        .get();

      if (tokensSnapshot.empty) {
        logger.info("No admin tokens found");
        return;
      }

      const tokens: string[] = [];
      tokensSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token) {
          tokens.push(data.token);
        }
      });

      if (tokens.length === 0) {
        logger.info("No valid tokens found");
        return;
      }

      // Send notification to all admin devices
      const message = {
        notification: {
          title: "🧺 Dr Dhobi - New Booking!",
          body: `${bookingData.name} booked ${bookingData.service}\nPhone: ${bookingData.phone}`,
        },
        data: {
          bookingId: bookingId,
          customerName: bookingData.name || "",
          service: bookingData.service || "",
          phone: bookingData.phone || "",
          url: "/admin",
        },
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      logger.info(`Successfully sent ${response.successCount} notifications`);

      if (response.failureCount > 0) {
        logger.warn(`Failed to send ${response.failureCount} notifications`);

        // Remove invalid tokens
        const tokensToDelete: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            tokensToDelete.push(tokens[idx]);
          }
        });

        // Delete invalid tokens from Firestore
        for (const token of tokensToDelete) {
          const tokenQuery = await admin
            .firestore()
            .collection("adminTokens")
            .where("token", "==", token)
            .get();

          tokenQuery.forEach((doc) => {
            doc.ref.delete().catch((err) => {
              logger.error("Error deleting token:", err);
            });
          });
        }
      }

      return response;
    } catch (error) {
      logger.error("Error sending notification:", error);
      return null;
    }
  }
);
