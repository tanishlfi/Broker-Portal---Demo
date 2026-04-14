import Link from "next/link";

export default function QuoteLanding() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-white relative overflow-hidden">

      {/* Logo header with arch wave */}
      <div className="w-full relative flex flex-col items-center pt-10 pb-16" style={{ background: "linear-gradient(160deg, #d8f0fb 0%, #eaf6fd 60%, #f5fbff 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#b3e0f2] rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b3e0f2] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />

      {/* Logo */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .rma-logo {
          background: linear-gradient(
            90deg,
            #1a8fc1 0%,
            #29abe2 30%,
            #7dd8f8 50%,
            #29abe2 70%,
            #1a8fc1 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
      <div className="flex flex-col items-center mb-10 z-10">
        <span
          className="rma-logo font-extrabold leading-none tracking-tight"
          style={{ fontSize: "3.5rem", fontStyle: "italic" }}
        >
          RMA
        </span>
        <p className="text-sm text-gray-400 mt-1 italic tracking-wide">
          Caring | Compassionate | Compensation
        </p>
        </div>

        {/* SVG Wave Arch */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none" style={{ lineHeight: 0 }}>
          <svg
            viewBox="0 0 1440 70"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full"
            style={{ display: "block", height: "70px" }}
          >
            <path
              d="M0,30 C360,80 1080,-10 1440,30 L1440,70 L0,70 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center w-full px-4 pt-6 pb-10">

      {/* Title */}
      <h1
        className="text-2xl sm:text-3xl font-bold text-center mb-2 z-10"
        style={{ color: "#1a2e4a" }}
      >
        Let's Get Started with an Employee Coverage Quote
      </h1>
      <p className="text-gray-500 text-sm sm:text-base text-center mb-5 z-10">
        Select the type of quote journey you would like to proceed with:
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-4 z-10">
        <div className="w-full bg-[#dce8f0] rounded h-6 overflow-hidden">
          <div
            className="h-6 flex items-center px-2 text-white text-xs font-semibold rounded"
            style={{ width: "10%", backgroundColor: "#29abe2" }}
          >
            10%
          </div>
        </div>
      </div>

      {/* Eligibility bullets */}
      <ul className="w-full max-w-2xl text-sm text-gray-600 mb-8 space-y-1 z-10 list-none pl-8">
        <li className="flex items-start gap-2"><span style={{ color: "#29abe2" }}>•</span>18 to 64 years old.</li>
        <li className="flex items-start gap-2"><span style={{ color: "#29abe2" }}>•</span>Permanently employed or on 6+ month contract.</li>
        <li className="flex items-start gap-2"><span style={{ color: "#29abe2" }}>•</span>Legally employed &amp; actively working 20+ hours a week in SA.</li>
      </ul>

      {/* Cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 z-10">

        {/* Quick Cost Estimate */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#e0f4fc" }}
          >
            {/* Outlined lightning bolt matching design */}
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
              <path
                d="M16 2L4 18h10l-2 12L24 14H14L16 2Z"
                stroke="#29abe2"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <h2 className="text-base font-bold mb-2" style={{ color: "#1a2e4a" }}>
            Quick Cost Estimate
          </h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Get an estimated cost in seconds with minimal info required. No personal details needed.
          </p>
          <div className="w-full rounded-xl p-4 mt-auto flex flex-col gap-3" style={{ backgroundColor: "#eaf5fb" }}>
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "#1a2e4a" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#29abe2" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Simple and Fast
            </p>
            <Link
              href="/quote/quick"
              className="w-full py-2.5 text-white font-semibold rounded text-sm text-center transition-colors"
              style={{ backgroundColor: "#f5a623" }}
            >
              Select Quick Quote
            </Link>
          </div>
        </div>

        {/* Full Quote */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#e0f4fc" }}
          >
            {/* Clipboard + person + dollar badge matching design */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              {/* Clipboard body */}
              <rect x="4" y="6" width="18" height="22" rx="2" stroke="#29abe2" strokeWidth="1.6" fill="none" />
              {/* Clip at top */}
              <rect x="9" y="4" width="8" height="4" rx="1.5" stroke="#29abe2" strokeWidth="1.4" fill="none" />
              {/* Lines */}
              <line x1="7" y1="13" x2="19" y2="13" stroke="#29abe2" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="7" y1="17" x2="19" y2="17" stroke="#29abe2" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="7" y1="21" x2="14" y2="21" stroke="#29abe2" strokeWidth="1.4" strokeLinecap="round" />
              {/* Person head */}
              <circle cx="25" cy="22" r="3.5" stroke="#29abe2" strokeWidth="1.4" fill="none" />
              {/* Person shoulders */}
              <path d="M18.5 32c0-3.5 2.5-5 6.5-5s6.5 1.5 6.5 5" stroke="#29abe2" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {/* Dollar badge */}
              <circle cx="30" cy="14" r="5" fill="#29abe2" />
              <text x="30" y="17.5" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif">$</text>
            </svg>
          </div>
          <h2 className="text-base font-bold mb-2" style={{ color: "#1a2e4a" }}>
            Full Quote
          </h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Receive a comprehensive quote using the name, gender, birthdate, and salary of each
          </p>
          <div className="w-full rounded-xl p-4 mt-auto flex flex-col gap-3" style={{ backgroundColor: "#eaf5fb" }}>
            <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "#29abe2" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#29abe2" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Comprehensive Coverage
            </p>
            <Link
              href="/quote/full"
              className="w-full py-2.5 font-semibold rounded text-sm text-center transition-colors border"
              style={{ color: "#29abe2", borderColor: "#c5d8e8", backgroundColor: "white" }}
            >
              Select Full Quote
            </Link>
          </div>
        </div>

      </div>

      </div>{/* end main content */}
    </div>
  );
}
