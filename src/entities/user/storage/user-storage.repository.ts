import { persist } from "zustand/middleware";
import { create } from "zustand/react";
import { UserStorageInterface } from "./user-storage.interface";

export const UserStorage = create<UserStorageInterface>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "user-storage" },
  ),
);

export const useUserStorage = UserStorage;
export const useRequiredUserStorage = () => {
  const user = useUserStorage((s) => s.user);
  if (!user)
    throw new Error(
      "useRequiredUser must be used inside an authenticated screen",
    );

  return { user };
};
