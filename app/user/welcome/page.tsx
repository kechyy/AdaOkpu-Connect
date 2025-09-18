import WelcomeEditor from "@/components/client/WelcomeEditor";

export default function WelcomePage() {
  return (
    <div className="space-y-6">
      <h1 className="h1">👋 Welcome Text</h1>
      <p className="lead">What new sisters see when they join.</p>
      <WelcomeEditor />
    </div>
  );
}
