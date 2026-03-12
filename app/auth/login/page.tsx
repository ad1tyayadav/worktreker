import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "@/components/features/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout footerLink={{ href: "/auth/signup", label: "Need an account? Sign up" }}>
      <LoginForm />
    </AuthLayout>
  );
}
