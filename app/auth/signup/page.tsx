import { AuthLayout } from "@/components/layout/AuthLayout";
import { SignupForm } from "@/components/features/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout footerLink={{ href: "/auth/login", label: "Already have an account? Login" }}>
      <SignupForm />
    </AuthLayout>
  );
}
