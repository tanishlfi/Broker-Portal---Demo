import LoginButton from "@/app/components/LoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#eef1f5]">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1565c0] via-[#1e88e5] to-[#42a5f5] px-6 sm:px-10 pt-7 pb-14">
        <div className="absolute -bottom-7 -left-[10%] w-[120%] h-14 bg-white/10 rounded-[50%] scale-x-125" />
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-5xl sm:text-6xl font-black italic text-white leading-none tracking-tighter">
            RMA
          </span>
          <span className="text-xl sm:text-2xl text-white font-normal">
            RMA Broker Portal
          </span>
        </div>
        <p className="text-white/85 text-sm mt-2">
          Caring | Compassionate | Compensation
        </p>
      </header>

      <main className="flex-1 flex justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-normal text-gray-800 mb-2">
            <span className="text-[#1e88e5] font-bold">RMA</span> Broker Portal
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            Welcome back, <strong className="text-gray-800">John Smith</strong>. Here is an
            overview of your latest activity.
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1e88e5] transition-colors"
            />
            <button className="w-full mt-3 py-3 bg-[#3a7d44] hover:bg-[#2e6636] text-white font-semibold rounded text-base transition-colors cursor-pointer">
              Send OTP
            </button>

            <div className="mt-6">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1.5">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#1e88e5] transition-colors"
              />
            </div>

            <LoginButton />

            <div className="flex flex-wrap justify-between items-end gap-3 mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-red-600 flex items-center gap-1.5">
                  <span>⊘</span> Invalid OTP. Please try again.
                </span>
                <span className="text-xs text-red-600 flex items-center gap-1.5">
                  <span>⊘</span> OTP expired. Please request a new OTP.
                </span>
              </div>
              <a href="#" className="text-sm text-[#1e88e5] hover:underline whitespace-nowrap">
                Resend OTP
              </a>
            </div>

            <p className="mt-5 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
              For assistance, please contact{" "}
              <a href="mailto:support@rma.co.za" className="text-[#1e88e5] underline">
                support@rma.co.za
              </a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
