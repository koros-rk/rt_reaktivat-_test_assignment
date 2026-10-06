import { EnterIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { SignInModal } from "../../../features/sign-in/ui/sign-in-modal";

export const HeaderSignIn = () => {
  return (
    <SignInModal>
      <Button size={"3"}>
        Sign In
        <EnterIcon />
      </Button>
    </SignInModal>
  );
};
