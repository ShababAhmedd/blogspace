"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import { GuestOnly } from "@/components/RouteGuards";
import { useToast } from "@/contexts/ToastContext";
import usePageTitle from "@/hooks/usePageTitle";
import useResetOnHide from "@/hooks/useResetOnHide";
import authService from "@/services/auth.service";
import { getErrorMessage } from "@/utils/api";
import { PASSWORD_MIN_LENGTH } from "@/utils/constants";
import {
  hasErrors,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateRequired,
} from "@/utils/validation";

const initial = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };

const validate = (data) => ({
  firstName: validateRequired(data.firstName, "First name"),
  lastName: validateRequired(data.lastName, "Last name"),
  email: validateEmail(data.email),
  password: validatePassword(data.password),
  confirmPassword: validateConfirmPassword(data.password, data.confirmPassword),
});

export default function RegisterPage() {
  usePageTitle("Register");
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // keep a half-filled form, but not the passwords or an old error, for the next visit
  useResetOnHide(() => {
    setValues((current) => ({ ...current, password: "", confirmPassword: "" }));
    setErrors({});
    setTouched({});
    setServerError("");
  });

  const handleChange = (event) => {
    const next = { ...values, [event.target.name]: event.target.value };
    setValues(next);
    setErrors(validate(next));
  };

  const handleBlur = (event) => setTouched((current) => ({ ...current, [event.target.name]: true }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const validation = validate(values);
    setErrors(validation);
    setTouched(Object.fromEntries(Object.keys(initial).map((key) => [key, true])));
    if (hasErrors(validation)) return;

    setServerError("");
    setSubmitting(true);
    try {
      await authService.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      setValues(initial);
      setTouched({});
      setSubmitting(false);
      toast.success("Registration successful. Please log in.");
      router.push("/login?registered=1");
    } catch (error) {
      setServerError(getErrorMessage(error, "Registration failed. Please try again."));
      setSubmitting(false);
    }
  };

  const field = (id, label, props = {}) => (
    <FormField
      id={id}
      label={label}
      value={values[id]}
      onChange={handleChange}
      onBlur={handleBlur}
      error={touched[id] ? errors[id] : ""}
      disabled={submitting}
      {...props}
    />
  );

  return (
    <GuestOnly>
      <AuthCard
        title="Create your account"
        subtitle="Join BlogSpace and start sharing what you know."
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Login
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Alert>{serverError}</Alert>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("firstName", "First Name", { autoComplete: "given-name", placeholder: "John" })}
            {field("lastName", "Last Name", { autoComplete: "family-name", placeholder: "Doe" })}
          </div>
          {field("email", "Email", { type: "email", autoComplete: "email", placeholder: "john@example.com" })}
          {field("password", "Password", {
            type: "password",
            autoComplete: "new-password",
            hint: `At least ${PASSWORD_MIN_LENGTH} characters.`,
          })}
          {field("confirmPassword", "Confirm Password", { type: "password", autoComplete: "new-password" })}
          <Button type="submit" className="w-full" loading={submitting} loadingText="Creating account...">
            Register
          </Button>
        </form>
      </AuthCard>
    </GuestOnly>
  );
}
