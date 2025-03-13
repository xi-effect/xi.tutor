export type AuthContextT = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};
