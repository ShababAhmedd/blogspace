"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import { useToast } from "@/contexts/ToastContext";
import usePageTitle from "@/hooks/usePageTitle";
import useResetOnHide from "@/hooks/useResetOnHide";
import authService from "@/services/auth.service";
import { getErrorMessage } from "@/utils/api";
import { PASSWORD_MIN_LENGTH } from "@/utils/constants";
import { hasErrors, validateConfirmPassword, validatePassword } from "@/utils/validation";

export default function ResetPasswordPage() {
  usePageTitle("Reset Password");
  const { token } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useResetOnHide(() => {
    setValues({ password: "", confirmPassword: "" });
    setErrors({});
    setServerError("");
  });

  const validate = (data) => ({
    password: validatePassword(data.password),
    confirmPassword: validateConfirmPassword(data.password, data.confirmPassword),
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
      await authService.resetPassword(token, values.password);
      setValues({ password: "", confirmPassword: "" });
      setSubmitting(false);
      toast.success("Password successfully changed.");
      router.replace("/login?reset=1");
    } catch (error) {
      setServerError(getErrorMessage(error, "Could not reset your password. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Choose a new password for your account."
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Back to Login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && (
          <Alert>
            {serverError}{" "}
            {serverError.toLowerCase().includes("expired") && (
              <Link href="/forgot-password" className="font-semibold underline">
                Request a new link
              </Link>
            )}
          </Alert>
        )}
        <FormField
          id="password"
          type="password"
          label="New Password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          disabled={submitting}
        />
        <FormField
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          disabled={submitting}
        />
        <Button type="submit" className="w-full" loading={submitting} loadingText="Resetting...">
          Reset Password
        </Button>
      </form>
    </AuthCard>
  );
}
