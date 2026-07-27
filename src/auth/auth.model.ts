export type AuthUser = {
  googleId: string; // payload.sub — stable unique ID
  name: string;
  picture: string;
};
