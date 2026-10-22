"use client";

import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import userService from "@/services/user.service";
import { getErrorMessage } from "@/utils/api";
import { getFullName } from "@/utils/format";

// shared activate/deactivate flow: deactivation asks for confirmation first
export default function useUserStatus(onUpdated) {
  const toast = useToast();
  const [pendingId, setPendingId] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);

  const setStatus = async (user, isActive) => {
    setPendingId(user.id);
    try {
      const updated = await userService.updateUserStatus(user.id, isActive);
      onUpdated(updated);
      toast.success(`${getFullName(user)} has been ${isActive ? "activated" : "deactivated"}.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the user's status."));
    } finally {
      setPendingId(null);
      setConfirmUser(null);
    }
  };

  const toggle = (user) => (user.isActive ? setConfirmUser(user) : setStatus(user, true));

  return {
    pendingId,
    confirmUser,
    toggle,
    confirmDeactivate: () => setStatus(confirmUser, false),
    cancel: () => setConfirmUser(null),
  };
}
