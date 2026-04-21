import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Invalid webhook signature', { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

    try {
      // Create user in database
      const user = await prisma.user.create({
        data: {
          id: id,
          email: email_addresses[0]?.email_address || '',
          fullName: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          phone: phone_numbers?.[0]?.phone_number || null,
        },
      });

      console.log('[Clerk Webhook] User created in database:', user.id);

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        userId: user.id,
      });
    } catch (error: any) {
      console.error('[Clerk Webhook] Error creating user:', error);

      // If user already exists, that's okay
      if (error.code === 'P2002') {
        console.log('[Clerk Webhook] User already exists:', id);
        return NextResponse.json({
          success: true,
          message: 'User already exists',
          userId: id,
        });
      }

      return NextResponse.json(
        { error: 'Failed to create user', details: error.message },
        { status: 500 }
      );
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

    try {
      // Update user in database
      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email_addresses[0]?.email_address || '',
          fullName: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          phone: phone_numbers?.[0]?.phone_number || null,
        },
      });

      console.log('[Clerk Webhook] User updated in database:', user.id);

      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        userId: user.id,
      });
    } catch (error: any) {
      console.error('[Clerk Webhook] Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user', details: error.message },
        { status: 500 }
      );
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Delete user from database (cascade will delete related records)
      await prisma.user.delete({
        where: { id: id || '' },
      });

      console.log('[Clerk Webhook] User deleted from database:', id);

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      console.error('[Clerk Webhook] Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user', details: error.message },
        { status: 500 }
      );
    }
  }

  // For other event types, just acknowledge receipt
  return NextResponse.json({
    success: true,
    message: `Webhook received: ${eventType}`,
  });
}
