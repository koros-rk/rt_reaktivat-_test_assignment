import { Flex } from "@radix-ui/themes";
import { ComponentType } from "react";
import { SignInNotification } from "../../../widgets/sign-in-notification/ui/sign-in-notification";
import { useMainPageController } from "../model/main-page.controller";
import { MainPageScreens } from "../model/main-page.screens";
import { BooksListView } from "./books-list-view";

const screens: Record<MainPageScreens, ComponentType> = {
  [MainPageScreens.SignedIn]: BooksListView,
  [MainPageScreens.Unauthorized]: SignInNotification,
};

export const MainPage = () => {
  const { pageState } = useMainPageController();
  const Screens = screens[pageState];

  return (
    <Flex direction={"column"} width={"100%"} py={"6"} px={"8"}>
      <Screens />
    </Flex>
  );
};
