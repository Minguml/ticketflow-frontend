"use client";
import { LoginForm } from "@/features/auth/components/login-form";
export function OperatorLogin() {
  return <LoginForm operator />;
}
export function UserLogin() {
  return <LoginForm operator={false} />;
}
