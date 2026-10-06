export enum BookListMode {
  all = "all",
  private = "private",
}

export interface BookListStorageInterface {
  mode: BookListMode;
  setMode: (mode: BookListMode) => void;
}
