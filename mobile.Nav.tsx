import { Link, useLocation } from "wouter";

interface MobileNavProps {
  onNewReading: () => void;
}

export default function MobileNav({ onNewReading }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center justify-center py-3 ${location === "/" ? "text-primary" : "text-neutral-400"}`}>
            <span className="material-icons">dashboard</span>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/history">
          <a className={`flex flex-col items-center justify-center py-3 ${location === "/history" ? "text-primary" : "text-neutral-400"}`}>
            <span className="material-icons">history</span>
            <span className="text-xs mt-1">History</span>
          </a>
        </Link>
        <button 
          className="flex flex-col items-center justify-center py-3 relative -mt-6"
          onClick={onNewReading}
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
            <span className="material-icons">add</span>
          </div>
        </button>
        <button className="flex flex-col items-center justify-center py-3 text-neutral-400">
          <span className="material-icons">smart_toy</span>
          <span className="text-xs mt-1">Assistant</span>
        </button>
        <Link href="/profile">
          <a className={`flex flex-col items-center justify-center py-3 ${location === "/profile" ? "text-primary" : "text-neutral-400"}`}>
            <span className="material-icons">person</span>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
