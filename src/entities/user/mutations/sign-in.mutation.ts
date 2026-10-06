import { mutationOptions } from "@tanstack/react-query";
import { UserStorage } from "../storage/user-storage.repository";

export const SignInMutation = mutationOptions({
  mutationKey: ["user", "sign-in"],
  mutationFn: async (user: string) => {
    const storage = UserStorage.getState();
    storage.setUser(user);
  },
});
