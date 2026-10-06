import { Card, Flex, Heading } from "@radix-ui/themes";
import { useUserStorage } from "../../../entities/user/storage/user-storage.repository";
import { HeaderAccount } from "./header-account";
import { HeaderSignIn } from "./header-sign-in";

const screens = {
  authorized: HeaderAccount,
  unauthorized: HeaderSignIn,
};

export const Header = () => {
  const user = useUserStorage((state) => state.user);
  const Screen = screens[user ? "authorized" : "unauthorized"];

  return (
    <Card
      style={{
        height: "fit-content",
        width: "100%",
        position: "sticky",
        zIndex: 10000,
        top: 0,
      }}
      size={"2"}
    >
      <Flex align={"center"} justify={"between"}>
        <Heading style={{ textTransform: "uppercase" }} as={"h2"} size={"8"}>
          Books
        </Heading>
        <Screen />
      </Flex>
    </Card>
  );
};
