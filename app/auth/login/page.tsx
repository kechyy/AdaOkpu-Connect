import LoginForm from "@/components/client/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <LoginForm />
      </Suspense>
        
    </div>
  );
}
