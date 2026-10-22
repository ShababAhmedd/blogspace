"use client";

import { useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import usePageTitle from "@/hooks/usePageTitle";
import authService from "@/services/auth.service";
import { getErrorMessage } from "@/utils/api";
import { validateEmail } from "@/utils/validation";

export default function ForgotPasswordPage() {
  usePageTitle("Forgot Password");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const validation = validateEmail(email);
    setError(validation);
    if (validation) return;

    setServerError("");
    setSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setServerError(getErrorMessage(err, "Could not send the reset link. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email you registered with and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Back to Login
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <Alert type="success">
            If an account exists for <strong>{email.trim()}</strong>, a password reset link has been sent. Please check
            your inbox. The link expires in 15 minutes.
          </Alert>
          <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
            Send to a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Alert>{serverError}</Alert>
          <FormField
            id="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="john@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(validateEmail(event.target.value));
            }}
            error={error}
            disabled={submitting}
          />
          <Button type="submit" className="w-full" loading={submitting} loadingText="Sending...">
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
