"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/dashboard/auth", { method: "DELETE" });
    router.push("/dashboard/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-white/80 hover:text-white transition-colors"
    >
      Log out
    </button>
  );
}
