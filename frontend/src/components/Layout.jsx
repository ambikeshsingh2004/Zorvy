import { Link, useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { name: 'Dashboard', path: '/' },
  { name: 'Records', path: '/records' },
];

export default function Layout({ user, setUser, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const links = ['ADMIN', 'ANALYST'].includes(user?.role)
    ? [...NAV, { name: 'User Analytics', path: '/user-analytics' }, { name: 'Global Analytics', path: '/global-analytics' }, ...(user?.role === 'ADMIN' ? [{ name: 'Access Control', path: '/users' }] : [])]
    : NAV;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-white/[0.04] px-8 h-20 flex items-center justify-between shrink-0">
        
        {/* Left Side: Navigation Links */}
        <div className="flex items-center h-full">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3 mr-12">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-rose-500 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold font-syne">Z</span>
            </div>
          </div>

          <nav className="flex space-x-8 h-full">
            {links.map((item) => {
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center h-full text-sm font-semibold transition-colors duration-200 ${
                    isActive ? 'text-orange-500' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Profile & Actions */}
        <div className="flex items-center space-x-8">

          {/* API Docs Button */}
          <a
            href={`${window.location.protocol}//${window.location.hostname}${window.location.port && window.location.port !== '80' && window.location.port !== '443' ? ':5000' : ''}/api-docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-medium text-zinc-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
            </svg>
            API Docs
          </a>
          
          {/* Subtle info toggle (matching the ENG placeholder in screenshot) */}
          <div className="flex items-center text-sm font-semibold text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
            {user?.role} <span className="ml-1 opacity-50">▾</span>
          </div>

          {/* Profile Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#18181A] border border-white/5 flex items-center justify-center text-orange-400 text-sm font-bold shadow-inner">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-200">{user?.name}</span>
              <button onClick={handleLogout} className="text-left text-[11px] text-zinc-500 hover:text-rose-400 transition-colors">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-10 max-w-[1440px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
