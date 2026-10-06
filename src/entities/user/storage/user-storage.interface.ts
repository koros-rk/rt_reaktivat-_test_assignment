export interface UserStorageInterface {
  user: string | null;

  setUser: (user: string) => void;
  clearUser: () => void;
}
