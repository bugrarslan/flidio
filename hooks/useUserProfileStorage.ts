import { useCallback, useEffect, useMemo, useState } from "react";

import { asyncStorageService, storageKeys } from "@/services/asyncStorage";

export type BudgetPreference = "Value" | "Balanced" | "Premium" | string;

export interface StoredUserProfile {
  name: string;
  age?: number | null;
  location: string;
  bio?: string;
  selectedBudget?: BudgetPreference | null;
  travelStyles: string[];
  createdAt: string;
  updatedAt: string;
}

export type SaveUserProfileInput = Partial<StoredUserProfile> & Pick<StoredUserProfile, "name" | "location">;

const createNormalizedProfile = (
  current: StoredUserProfile | null,
  updates: SaveUserProfileInput
): StoredUserProfile => {
  const now = new Date().toISOString();
  const previous = current ?? {
    name: "",
    location: "",
    age: null,
    bio: "",
    selectedBudget: null,
    travelStyles: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    name: updates.name.trim(),
    location: updates.location.trim(),
    age: updates.age ?? previous.age ?? null,
    bio: updates.bio?.trim() ?? previous.bio ?? "",
    selectedBudget: updates.selectedBudget ?? previous.selectedBudget ?? null,
    travelStyles: updates.travelStyles ?? previous.travelStyles ?? [],
    createdAt: previous.createdAt ?? now,
    updatedAt: now,
  };
};

export const useUserProfileStorage = () => {
  const [profile, setProfile] = useState<StoredUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedProfile = await asyncStorageService.getItem<StoredUserProfile>(storageKeys.userProfile);
      setProfile(storedProfile);
      return storedProfile;
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error("Failed to load user profile");
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const saveProfile = useCallback(
    async (updates: SaveUserProfileInput): Promise<StoredUserProfile> => {
      setSaving(true);
      setError(null);

      try {
        const normalized = createNormalizedProfile(profile, updates);
        await asyncStorageService.setItem(storageKeys.userProfile, normalized);
        setProfile(normalized);
        return normalized;
      } catch (err) {
        const normalizedError = err instanceof Error ? err : new Error("Failed to save user profile");
        setError(normalizedError);
        throw normalizedError;
      } finally {
        setSaving(false);
      }
    },
    [profile]
  );

  const clearProfile = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      await asyncStorageService.removeItem(storageKeys.userProfile);
      setProfile(null);
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error("Failed to clear user profile");
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setSaving(false);
    }
  }, []);

  const hasProfile = useMemo(() => Boolean(profile && profile.name.trim().length > 0), [profile]);

  return {
    profile,
    loading,
    saving,
    error,
    hasProfile,
    refreshProfile,
    saveProfile,
    clearProfile,
  };
};
