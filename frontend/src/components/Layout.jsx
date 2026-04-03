import { Link, useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { name: 'Dashboard', path: '/', icon: '▦' },
  { name: 'Records', path: '/records', icon: '≡' },
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

  const links = user?.role === 'ADMIN'
    ? [...NAV, { name: 'Users', path: '/users', icon: '◉' }]
    : NAV;

  const currentPage = links.find(l => l.path === location.pathname);

  const roleColors = {
    ADMIN: 'bg-violet-50 text-violet-700 border-violet-100',
    ANALYST: 'bg-sky-50 text-sky-700 border-sky-100',
    VIEWER: 'bg-[#EEEDE8] text-[#6B6B6B] border-[#E8E8E4]',
  };

  return (
    <div className="flex h-screen bg-[#F7F6F3] overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-56 bg-white border-r border-[#E8E8E4] flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#E8E8E4]">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <span className="font-bold text-[#0A0A0A] text-sm tracking-tight">ZorvFinance</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-semibold text-[#ABABAB] uppercase tracking-widest px-2 mb-2">Navigation</p>
          {links.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#6B6B6B] hover:bg-[#F0EFE9] hover:text-[#0A0A0A]'
                }`}
              >
                <span className="text-base w-4 text-center">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-[#E8E8E4]">
          <div className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E8E8E4]">
            <div className="flex items-center space-x-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-[#0A0A0A] truncate">{user?.name}</p>
                <p className="text-[10px] text-[#ABABAB] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleColors[user?.role]}`}>
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] font-semibold text-[#ABABAB] hover:text-rose-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-[#E8E8E4] px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-black text-[#0A0A0A] tracking-tight" style={{fontFamily: 'Syne, sans-serif'}}>
              {currentPage?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#ABABAB]">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
