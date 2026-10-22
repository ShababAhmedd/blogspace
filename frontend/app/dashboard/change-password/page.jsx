import ChangePasswordView from "./ChangePasswordView";

// rendered after the browser-side session check, so it can't be prerendered for instant navigation
export const instant = false;

export default function ChangePasswordPage() {
  return <ChangePasswordView />;
}
