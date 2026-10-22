"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Alert from "@/components/Alert";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import { GuestOnly } from "@/components/RouteGuards";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import usePageTitle from "@/hooks/usePageTitle";
import { getErrorMessage } from "@/utils/api";
import { hasErrors, validateEmail } from "@/utils/validation";

// only follow redirects that stay inside this app
const safeRedirect = (value) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard");

const sessionMessages = {
  expired: "Your session has expired. Please log in again.",
  deactivated: "Your account has been deactivated.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");
  const sessionMessage = sessionMessages[searchParams.get("session")];

  const validate = (data) => ({
    email: validateEmail(data.email),
    password: data.password ? "" : "Password is required.",
  });

  const handleChange = (event) => {
    const next = { ...values, [event.target.name]: event.target.value };
    setValues(next);
    if (hasErrors(errors)) setErrors(validate(next));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const validation = validate(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setServerError("");
    setSubmitting(true);
    try {
      const profile = await login(values.email.trim(), values.password);
      // GuestOnly performs the redirect once the session is set
      toast.success(`Welcome back, ${profile.firstName}!`);
    } catch (error) {
      setServerError(getErrorMessage(error, "Login failed. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to manage your blogs and profile."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {registered && !serverError && <Alert type="success">Account created successfully. Please log in.</Alert>}
        {reset && !serverError && <Alert type="success">Password successfully changed. Log in with your new password.</Alert>}
        {sessionMessage && !serverError && <Alert type="warning">{sessionMessage}</Alert>}
        <Alert>{serverError}</Alert>

        <FormField
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          placeholder="john@example.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          disabled={submitting}
        />
        <div>
          <FormField
            id="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            disabled={submitting}
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Forgot Password?
            </Link>
          </div>
        </div>
        <Button type="submit" className="w-full" loading={submitting} loadingText="Logging in...">
          Login
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  usePageTitle("Login");
  const searchParams = useSearchParams();
  return (
    <GuestOnly redirectTo={safeRedirect(searchParams.get("redirect"))}>
      <LoginForm />
    </GuestOnly>
  );
}
