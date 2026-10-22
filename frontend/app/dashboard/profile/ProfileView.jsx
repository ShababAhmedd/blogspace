"use client";

import { useEffect, useRef, useState } from "react";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Loader from "@/components/Loader";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import usePageTitle from "@/hooks/usePageTitle";
import userService from "@/services/user.service";
import { getErrorMessage } from "@/utils/api";
import { capitalize, formatDate } from "@/utils/format";
import { hasErrors, validateImage, validateRequired } from "@/utils/validation";

function ImageUpload({ user, onUploaded }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleChoose = (event) => {
    const chosen = event.target.files?.[0];
    if (!chosen) return;
    const validation = validateImage(chosen);
    setError(validation);
    if (validation) {
      reset();
      return;
    }
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  };

  const handleUpload = async () => {
    const validation = validateImage(file);
    setError(validation);
    if (validation || uploading) return;
    setUploading(true);
    try {
      const updated = await userService.uploadProfileImage(file);
      onUploaded(updated);
      toast.success("Profile image updated.");
      reset();
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload the image."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-900">Profile Image</h2>
      <div className="mt-5 flex flex-col items-center gap-4 text-center">
        <Avatar user={user} src={preview} size="xl" className="ring-4 ring-brand-50" />
        <p className="text-xs text-slate-500">{preview ? "Preview — click Upload to save" : "Current avatar"}</p>
      </div>
      <input
        ref={inputRef}
        id="image"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChoose}
        className="sr-only"
        disabled={uploading}
      />
      <div className="mt-5 space-y-3">
        <Alert>{error}</Alert>
        {file && <p className="truncate text-center text-sm text-slate-600">{file.name}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => inputRef.current?.click()} disabled={uploading}>
            Choose Image
          </Button>
          <Button className="flex-1" onClick={handleUpload} disabled={!file} loading={uploading} loadingText="Uploading...">
            Upload
          </Button>
        </div>
        <p className="text-center text-xs text-slate-500">JPG, PNG, WEBP or GIF. Max 2MB.</p>
      </div>
    </section>
  );
}

export default function ProfileView() {
  usePageTitle("Profile");
  const { updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [values, setValues] = useState({ firstName: "", lastName: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    userService
      .getProfile()
      .then((data) => {
        if (ignore) return;
        setProfile(data);
        setValues({ firstName: data.firstName || "", lastName: data.lastName || "" });
        updateUser(data);
      })
      .catch((err) => !ignore && setLoadError(getErrorMessage(err, "Could not load your profile.")))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [updateUser]);

  const applyProfile = (data) => {
    setProfile((current) => ({ ...current, ...data }));
    updateUser(data);
  };

  const validate = (data) => ({
    firstName: validateRequired(data.firstName, "First name"),
    lastName: validateRequired(data.lastName, "Last name"),
  });

  const handleChange = (event) => {
    const next = { ...values, [event.target.name]: event.target.value };
    setValues(next);
    if (hasErrors(errors)) setErrors(validate(next));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const validation = validate(values);
    setErrors(validation);
    if (hasErrors(validation)) return;
    setServerError("");
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      });
      applyProfile(updated);
      toast.success("Profile updated successfully.");
    } catch (err) {
      setServerError(getErrorMessage(err, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;
  if (loadError) return <Alert>{loadError}</Alert>;

  const unchanged =
    values.firstName.trim() === (profile.firstName || "") && values.lastName.trim() === (profile.lastName || "");

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal information and avatar." />
      <div className="grid gap-6 lg:grid-cols-3">
        <ImageUpload user={profile} onUploaded={applyProfile} />

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Personal Information</h2>
          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
            <Alert>{serverError}</Alert>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="firstName"
                label="First Name"
                value={values.firstName}
                onChange={handleChange}
                error={errors.firstName}
                autoComplete="given-name"
                disabled={saving}
              />
              <FormField
                id="lastName"
                label="Last Name"
                value={values.lastName}
                onChange={handleChange}
                error={errors.lastName}
                autoComplete="family-name"
                disabled={saving}
              />
            </div>
            <FormField id="email" label="Email" value={profile.email} readOnly disabled hint="Email address cannot be changed." />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="role" label="Role" value={capitalize(profile.role)} readOnly disabled />
              <FormField id="memberSince" label="Member Since" value={formatDate(profile.createdAt)} readOnly disabled />
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button type="submit" loading={saving} loadingText="Saving..." disabled={unchanged}>
                Save Changes
              </Button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
