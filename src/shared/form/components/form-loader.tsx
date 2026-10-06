import { Loader } from "../../ui/loader";
import { useFormContext } from "../model/form.model";

export function FormLoader() {
  const form = useFormContext();
  return (
    <form.Subscribe>
      {({ isSubmitting }) => {
        if (!isSubmitting) return null;
        return <Loader />;
      }}
    </form.Subscribe>
  );
}
