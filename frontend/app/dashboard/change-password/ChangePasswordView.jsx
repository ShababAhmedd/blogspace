"use client";

import { useState } from "react";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/contexts/ToastContext";
import usePageTitle from "@/hooks/usePageTitle";
import useResetOnHide from "@/hooks/useResetOnHide";
import userService from "@/services/user.service";
import { getErrorMessage } from "@/utils/api";
import { PASSWORD_MIN_LENGTH } from "@/utils/constants";
import { hasErrors, validateConfirmPassword, validatePassword } from "@/utils/validation";

const initial = { password: "", confirmPassword: "" };

export default function ChangePasswordView() {
  usePageTitle("Change Password");
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useResetOnHide(() => {
    setValues(initial);
    setErrors({});
    setServerError("");
    setSuccess("");
  });

  const validate = (data) => ({
    password: validatePassword(data.password),
    confirmPassword: validateConfirmPassword(data.password, data.confirmPassword),
  });

  const handleChange = (event) => {
    const next = { ...values, [event.target.name]: event.target.value };
    setValues(next);
    setSuccess("");
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
      await userService.changePassword(values.password);
      setValues(initial);
      setSuccess("Password changed successfully. Use your new password next time you log in.");
      toast.success("Password changed successfully.");
    } catch (err) {
      setServerError(getErrorMessage(err, "Could not change your password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Change Password" description="Choose a strong password you don't use anywhere else." />
      <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Alert>{serverError}</Alert>
        <Alert type="success">{success}</Alert>
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
          label="Confirm New Password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          disabled={submitting}
        />
        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button type="submit" loading={submitting} loadingText="Changing...">
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
}
