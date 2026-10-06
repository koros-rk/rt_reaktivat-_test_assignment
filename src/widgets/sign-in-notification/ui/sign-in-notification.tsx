import { EnterIcon } from "@radix-ui/react-icons";
import { Card, Flex, Text } from "@radix-ui/themes";
import { SignInModal } from "../../../features/sign-in/ui/sign-in-modal";

export const SignInNotification = () => (
  <Flex
    position={"absolute"}
    align={"center"}
    justify={"center"}
    inset={"0"}
    height={"100vh"}
  >
    <Card>
      <Text size={"2"} color={"gray"} style={{ textTransform: "uppercase" }}>
        Please{" "}
        <SignInModal>
          <Text
            color={"blue"}
            style={{ textDecoration: "underline", cursor: "default" }}
          >
            sign in <EnterIcon style={{ transform: "translate(10%, 20%)" }} />
          </Text>
        </SignInModal>{" "}
        to view user books
      </Text>
    </Card>
  </Flex>
);
