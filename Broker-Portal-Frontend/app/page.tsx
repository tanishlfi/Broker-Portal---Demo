import { ROUTES } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a]">
      <div className="text-center">
        <h1 className="text-white text-2xl mb-4">RMA Broker Portal</h1>
        <a 
          href={ROUTES.login}
          className="inline-block px-6 py-3 bg-[#29abe2] hover:bg-[#1a8fc1] text-white font-semibold rounded-lg transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
