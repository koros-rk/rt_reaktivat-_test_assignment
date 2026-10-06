import { match } from "ts-pattern";
import { useUserStorage } from "../../../entities/user/storage/user-storage.repository";
import { MainPageScreens } from "./main-page.screens";

export const useMainPageController = () => {
  const user = useUserStorage((state) => state.user);

  const pageState = match(user)
    .returnType<MainPageScreens>()
    .when(
      (u) => !u,
      () => MainPageScreens.Unauthorized,
    )
    .otherwise(() => MainPageScreens.SignedIn);

  return { pageState };
};
