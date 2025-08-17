import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "db/client";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const { id, email_addresses, first_name, image_url } = evt.data;
    try {
      const newUser = await prisma.user.create({
        data: {
          clerkUserId: id as string,
          email: email_addresses[0].email_address,
          name: first_name,
          imageUrl: image_url,
        },
      });
      return new Response(JSON.stringify(newUser), {
        status: 201,
      });
    } catch (error) {
      console.error("Error: Failed to store event in the database:", error);
      return new Response("Error: Failed to store event in the database", {
        status: 500,
      });
    }
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
