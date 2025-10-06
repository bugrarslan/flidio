import React, { createContext, useContext, type PropsWithChildren } from "react";

import { useUserProfileStorage } from "@/hooks/useUserProfileStorage";

export type UserProfileContextValue = ReturnType<typeof useUserProfileStorage>;

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

export const UserProfileProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const storage = useUserProfileStorage();

  return <UserProfileContext.Provider value={storage}>{children}</UserProfileContext.Provider>;
};

export const useUserProfileContext = (): UserProfileContextValue => {
  const contextValue = useContext(UserProfileContext);

  if (!contextValue) {
    throw new Error("useUserProfileContext must be used within a UserProfileProvider");
  }

  return contextValue;
};
