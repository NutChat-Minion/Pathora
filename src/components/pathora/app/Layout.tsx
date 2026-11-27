import {
  Bell,
  Bookmark,
  CalendarDays,
  ChevronDown,
  Compass,
  FileText,
  GraduationCap,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Plane,
  Settings,
  Sparkles,
  Stamp,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { LanguageSwitcher, useT } from "./i18n";
import { useJourney } from "./store";

const navGroups = [
  {
    id: "plan",
    step: "01",
    label: "nav.plan",
    description: "nav.planDesc",
    links: [
      ["nav.dashboard", "/app", LayoutDashboard],
      ["nav.explore", "/app/explore", Compass],
      ["nav.saved", "/saved", Bookmark],
    ],
  },
  {
    id: "prepare",
    step: "02",
    label: "nav.prepare",
    description: "nav.prepareDesc",
    links: [
      ["nav.roadmap", "/prepare", Sparkles],
      ["nav.applications", "/applications", FileText],
    ],
  },
  {
    id: "connect",
    step: "03",
    label: "nav.connect",
    description: "nav.connectDesc",
    links: [
      ["nav.community", "/community", MessageCircle],
      ["nav.buddy", "/study-buddy", UsersRound],
    ],
  },
  {
    id: "move",
    step: "04",
    label: "nav.move",
    description: "nav.moveDesc",
    links: [
      ["nav.predeparture", "/pre-departure", CalendarDays],
      ["nav.visa", "/visa", Stamp],
      ["nav.housing", "/accommodation", House],
      ["nav.travel", "/travel-together", Plane],
    ],
  },
] as const;

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`brand ${light ? "text-white" : "text-navy"}`}>
      <span className="brand-mark">
        <span />
        <GraduationCap size={21} strokeWidth={2.4} />
      </span>
      Pathora
    </Link>
  );
}

export function RequireAuth() {
  const { status } = useJourney();
  const { t } = useT();
  const location = useLocation();
  if (status === "loading") {
    return (
      <div className="app-page">
        <div className="panel" role="status">
          <p>{t("common.loadingJourney")}</p>
        </div>
      </div>
    );
  }
  if (status === "anonymous") {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return <AppLayout />;
}

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { status } = useJourney();
  const { t } = useT();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const section = document.getElementById(location.hash.slice(1));
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, location.pathname]);

  return (
    <div>
      <header className="public-header">
        <Brand />
        <button
          className="icon-button mobile-only"
          onClick={() => setOpen(!open)}
          aria-label={t("nav.toggleMenu")}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "public-nav open" : "public-nav"}>
          <div className="public-nav-center">
            <Link to="/explore">{t("nav.exploreShort")}</Link>
            <Link to="/explore?type=University">{t("nav.universities")}</Link>
            <Link to="/explore?type=Scholarship">{t("nav.scholarships")}</Link>
            <Link to="/pricing">{t("nav.pricing")}</Link>
          </div>
          <div className="public-nav-actions">
            <LanguageSwitcher />
            {status === "ready" ? (
              <Link to="/app" className="btn btn-primary">
                {t("nav.dashboard")}
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-signin">
                  {t("nav.signIn")}
                </Link>
                <Link to="/login?mode=register" className="btn btn-primary">
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <Outlet />
      <footer className="footer">
        <div>
          <Brand light />
          <p>{t("nav.tagline")}</p>
        </div>
        <div>
          <strong>{t("nav.footerExplore")}</strong>
          <Link to="/explore">{t("nav.scholarships")}</Link>
          <Link to="/explore">{t("nav.universities")}</Link>
          <Link to="/pricing">{t("nav.pricing")}</Link>
        </div>
        <div>
          <strong>Pathora</strong>
          <Link to="/about">{t("nav.about")}</Link>
          <Link to="/support">{t("nav.support")}</Link>
          <Link to="/partners">{t("nav.partners")}</Link>
        </div>
        <div>
          <strong>{t("nav.trust")}</strong>
          <span>{t("nav.trust1")}</span>
          <span>{t("nav.trust2")}</span>
        </div>
      </footer>
    </div>
  );
}

export function AppLayout() {
  const { t } = useT();
  const [mobile, setMobile] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { displayName: preferredName, user, signOut } = useJourney();
  const navigate = useNavigate();
  const location = useLocation();
  const activeGroup = navGroups.find((group) =>
    group.links.some(([, to]) =>
      to === "/app" ? location.pathname === to : location.pathname.startsWith(to),
    ),
  )?.id;
  const [openGroup, setOpenGroup] = useState<string>("");
  const displayName = preferredName || user?.email || t("nav.defaultName");
  const initials =
    displayName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PS";

  const closeNavigation = () => {
    setMobile(false);
    setOpenGroup("");
  };

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="app-navbar-primary">
          <Brand />
          <div className="top-actions">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <div className="notification-menu">
              <button
                className="icon-button"
                aria-label={t("nav.notifications")}
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={20} />
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="notification-heading">
                    <div>
                      <strong>{t("nav.notifications")}</strong>
                    </div>
                  </div>
                  <p className="px-4 pb-4 text-[13px] text-[#756d7e]">{t("nav.noNotifications")}</p>
                </div>
              )}
            </div>
            <NavLink
              to="/settings"
              className="icon-button"
              aria-label={t("nav.settings")}
            >
              <Settings size={20} />
            </NavLink>
            <NavLink to="/profile" className="navbar-user" aria-label={t("nav.myProfile")}>
              <span className="avatar">{initials}</span>
              <span>
                <strong>{displayName}</strong>
                <small>{t("nav.student")}</small>
              </span>
            </NavLink>
            <button
              className="icon-button navbar-menu-toggle"
              onClick={() => setMobile(!mobile)}
              aria-expanded={mobile}
              aria-label={t("nav.toggleNav")}
            >
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <nav className={mobile ? "app-navbar-links open" : "app-navbar-links"}>
          <div className="navbar-journey">
            {navGroups.map((group) => {
              const expanded = openGroup === group.id;
              return (
                <div
                  className={`navbar-group ${expanded ? "open" : ""} ${activeGroup === group.id ? "current" : ""}`}
                  key={group.id}
                >
                  <button
                    className="navbar-group-toggle"
                    onClick={() => setOpenGroup(expanded ? "" : group.id)}
                    aria-expanded={expanded}
                  >
                    <span className="navbar-step">{group.step}</span>
                    <span>{t(group.label)}</span>
                    <ChevronDown size={14} />
                  </button>
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-heading">
                      <strong>{t(group.label)}</strong>
                      <small>{t(group.description)}</small>
                    </div>
                    {group.links.map(([label, to]) => (
                      <NavLink
                        key={label}
                        to={to}
                        end={to === "/app"}
                        onClick={closeNavigation}
                      >
                        {t(label)}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="navbar-account-links">
            <LanguageSwitcher className="sm:hidden" />
            <NavLink to="/profile" onClick={closeNavigation}>
              {t("nav.profile")}
            </NavLink>
            <NavLink to="/app/pricing" onClick={closeNavigation}>
              {t("nav.billing")}
            </NavLink>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-[10px] px-3 text-[9px] font-bold text-[#716879] hover:text-[#9d3f68]"
              onClick={async () => {
                closeNavigation();
                await signOut();
                navigate("/", { replace: true });
              }}
            >
              <LogOut size={14} /> {t("nav.signOut")}
            </button>
          </div>
        </nav>
      </header>
      <main className="app-main">
        <div className="page-transition" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
