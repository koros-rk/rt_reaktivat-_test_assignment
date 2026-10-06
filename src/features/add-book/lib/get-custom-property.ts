import { getShortId } from "./get-short-id";

export const getCustomProperty = () => ({
  id: getShortId(),
  value: "",
  name: "",
});
