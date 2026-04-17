import { useAuth } from "@/contexts/AuthContext";
import { ListenerOnboarding } from "./ListenerOnboarding";
import { CreatorOnboarding } from "./CreatorOnboarding";

/** Renders the appropriate onboarding modal based on the user's role. */
export function OnboardingGate() {
  const { profile } = useAuth();
  if (!profile || profile.onboarding_complete) return null;
  if (profile.role === "creator") return <CreatorOnboarding />;
  return <ListenerOnboarding />;
}
