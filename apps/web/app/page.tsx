// app/page.tsx - Server Component
import { redirect } from "next/navigation";

export default function Home() {
  // This page only renders if middleware allows it
  // If authenticated, show dashboard content or redirect
  redirect("/dashboard");
}
