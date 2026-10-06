import { BookListMode } from "./books-mode-storage.interface";
import { useBookListStorage } from "./books-mode-storage.repository";

export const useBooksSelectorButtonController = (target: BookListMode) => {
  const isActive = useBookListStorage((s) => s.mode === target);
  const setMode = useBookListStorage((s) => s.setMode);

  return {
    isActive,
    variant: isActive ? "solid" : "outline",
    select: () => setMode(target),
  } as const;
};
