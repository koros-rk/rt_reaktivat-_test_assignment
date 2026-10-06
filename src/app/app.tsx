import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { MainPage } from "../pages/main-page/ui/main-page";
import { queryClient } from "../shared/api/query-client";
import { Header } from "../widgets/header/ui/header";

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme radius={"none"} appearance={"dark"}>
        <SnackbarProvider
          style={{
            position: "relative",
            flexDirection: "column",
          }}
        >
          <Header />
          <MainPage />
        </SnackbarProvider>
      </Theme>
    </QueryClientProvider>
  );
};
