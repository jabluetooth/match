import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getNotifications, type NotificationItem } from "@/lib/notifications";
import { NotificationsPopover } from "@/components/notifications-popover";

export async function Header() {
  let items: NotificationItem[] = [];

  try {
    const { userId } = await auth();
    if (userId) {
      items = await getNotifications(userId);
    }
  } catch {
    // If auth or the DB hiccups, render the header without a notifications
    // payload rather than 500-ing the layout.
  }

  return (
    <header className="topbar">
      <Link href="/" className="logo">match</Link>

      <div className="topbar-right">
        <NotificationsPopover items={items} />
      </div>
    </header>
  );
}
