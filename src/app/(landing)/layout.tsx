export const metadata = {
  title: "Arabic Maqām Network",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  // Minimal layout for the landing route-group: render children only (no nav)
  return <>{children}</>;
}
