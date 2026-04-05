import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <a href="/" className="text-xl font-bold text-gray-900">JobHiro</a>
        <p className="text-sm text-gray-500 mt-1">Sign in to access your analyses</p>
      </div>
      <SignIn />
    </main>
  );
}
