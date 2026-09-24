import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { getNotifications } from "@/lib/notifications";
import { NotificationsPopover } from "@/components/notifications-popover";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { Crumb } from "@/components/app-shell/crumb";

/**
 * The topbar is the one glass surface in the app (skill §4.4): it's the
 * only thing that legitimately sits over scrolling content.
 */
export async function Header() {
  const { userId } = await auth();
  const notifications = userId ? await getNotifications(userId) : [];

  return (
    <header className="sticky top-0 z-20 flex h-[var(--topbar-h)] items-center gap-3 border-b border-line bg-bg/75 px-4 backdrop-blur-md backdrop-saturate-150 sm:px-6 lg:px-10">
      <MobileNav />
      <Crumb />
      <div className="ml-auto flex items-center gap-2">
        <NotificationsPopover items={notifications} />
        <div className="lg:hidden">
          <UserButton appearance={{ elements: { avatarBox: "size-7" } }} />
        </div>
      </div>
    </header>
  );
}
