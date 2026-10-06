import { Flex, FlexProps, Spinner } from "@radix-ui/themes";
import { forwardRef } from "react";

export const Loader = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
  return (
    <Flex
      align={"center"}
      justify={"center"}
      style={{ backgroundColor: "rgb(43 46 191 / 0.2)" }}
      ref={ref}
      {...props}
    >
      <Spinner />
    </Flex>
  );
});
