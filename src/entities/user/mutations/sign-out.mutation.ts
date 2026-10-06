import { mutationOptions } from "@tanstack/react-query";
import { UserStorage } from "../storage/user-storage.repository";

export const SignOutMutation = mutationOptions({
  mutationKey: ["user", "sign-out"],
  mutationFn: async () => {
    const storage = UserStorage.getState();
    storage.clearUser();
  },
});
