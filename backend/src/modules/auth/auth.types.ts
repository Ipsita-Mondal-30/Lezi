export type Journey = "PLAY" | "CONNECT";

export type ApplicationUser = {
  id: string;
  auth_id: string;
  email: string | null;
  current_journey: Journey | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};
