"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BookOutlined,
  FormOutlined,
  HomeOutlined,
  MessageOutlined,
  TrophyOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { SunIcon, MoonIcon, Bars3Icon as MenuIcon, XMarkIcon as CloseIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import Live2DWidget from "./Live2DWidget";

export const navigationItems = [
  {
    href: "/showcase",
    label: "成果",
    icon: <TrophyOutlined />,
    title: "成果展示",
    description: "我的项目成果、证书认证与技术实践的集中展示。",
    actionText: "查看成果",
    tags: ["项目", "证书", "实战"],
    themeColor: "amber",
  },
  {
    href: "/notes",
    label: "小记",
    icon: <FormOutlined />,
    title: "阅读小记",
    description: "浏览我的技术小记，分享我的开发经验和学习心得。",
    actionText: "查看小记",
    tags: ["Markdown", "随缘更新", "技术"],
    themeColor: "purple",
  },
  {
    href: "/chat",
    label: "CHAT",
    icon: <MessageOutlined />,
    title: "和我聊聊",
    description: "任何技术问题都可以和我交流，让我们一起探讨编程的乐趣。",
    actionText: "开始对话",
    tags: ["DeepSeek", "AI", "实时对话"],
    themeColor: "green",
  },
  {
    href: "/questions",
    label: "题库",
    icon: <BookOutlined />,
    title: "前端题库",
    description: "精心整理的前端面试题库，助你轻松应对技术面试，提升专业能力。",
    actionText: "开始刷题",
    tags: ["面试题", "React", "Vue"],
    themeColor: "blue",
  },
];

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

function Sidebar({ onLoginOpen }: { onLoginOpen: () => void }) {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && theme === "dark";
  const isExp = !collapsed;

  return (
    // overflow-visible 让 tab 可以超出边界
    <motion.aside
      animate={{ width: collapsed ? 52 : 160 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex flex-col h-screen flex-shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
    >
      {/* Logo 行 — 展开时右侧带收起按钮，折叠时仅显示 H */}
      <div className={`flex items-center h-[52px] flex-shrink-0 ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}>
        <Link href="/" className="text-xl font-bold tracking-tight whitespace-nowrap block">
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            {collapsed ? "H" : "H_dajun"}
          </span>
        </Link>
        {/* 收起按钮 — 仅展开时显示 */}
        {isExp && (
          <motion.button
            onClick={() => setCollapsed(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="收起"
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* 展开按钮行 — 仅折叠时显示，位于 logo 下方 */}
      {collapsed && (
        <div className="flex justify-center py-1">
          <motion.button
            onClick={() => setCollapsed(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="展开"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all duration-200"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        </div>
      )}

      {/* Nav — 顶对齐 */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 pt-2">
        {/* 首页 */}
        <Link
          href="/"
          title={collapsed ? "首页" : undefined}
          className={`flex items-center overflow-hidden rounded-xl text-sm font-medium transition-all duration-200 h-10
            ${collapsed ? "justify-center px-0" : "px-3 gap-3"}
            ${pathname === "/"
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200"
            }`}
        >
          <span className={`text-base flex-shrink-0 ${pathname === "/" ? "text-indigo-500 dark:text-indigo-400" : ""}`}>
            <HomeOutlined />
          </span>
          <AnimatePresence initial={false}>
            {isExp && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap"
              >
                首页
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center overflow-hidden rounded-xl text-sm font-medium transition-all duration-200 h-10
                ${collapsed ? "justify-center px-0" : "px-3 gap-3"}
                ${isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200"
                }`}
            >
              <span className={`text-base flex-shrink-0 ${isActive ? "text-indigo-500 dark:text-indigo-400" : ""}`}>
                {item.icon}
              </span>
              <AnimatePresence initial={false}>
                {isExp && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — 主题 & 登录 & 收起 */}
      <div className={`pb-5 flex flex-col gap-1 px-2 overflow-hidden ${collapsed ? "items-center" : ""}`}>
        {/* 主题切换 */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title="切换主题"
          className={`flex items-center overflow-hidden rounded-xl h-10 text-sm font-medium
            text-gray-500 hover:bg-gray-50 hover:text-gray-700
            dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200
            transition-all duration-200
            ${collapsed ? "justify-center px-0 w-10" : "px-3 gap-3 w-full"}`}
        >
          <span className="flex-shrink-0 w-[18px] h-[18px] relative">
            {mounted && (
              isDark
                ? <MoonIcon className="w-[18px] h-[18px]" />
                : <SunIcon className="w-[18px] h-[18px]" />
            )}
          </span>
          <AnimatePresence initial={false}>
            {isExp && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap"
              >
                {isDark ? "深色模式" : "浅色模式"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* 登录 / 登出 */}
        <button
          onClick={isAuthenticated ? logout : onLoginOpen}
          title={isAuthenticated ? "Sign Out" : "Sign In"}
          className={`flex items-center overflow-hidden rounded-xl h-10 text-sm font-medium
            transition-all duration-200
            ${isAuthenticated
              ? "text-red-400 hover:bg-red-50 hover:text-red-500 dark:text-red-400/70 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200"
            }
            ${collapsed ? "justify-center px-0 w-10" : "px-3 gap-3 w-full"}`}
        >
          <span className="flex-shrink-0 text-base">
            {isAuthenticated ? <LogoutOutlined /> : <UserOutlined />}
          </span>
          <AnimatePresence initial={false}>
            {isExp && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap"
              >
                {isAuthenticated ? "Sign Out" : "Sign In"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────

function MobileTopBar({ onLoginOpen }: { onLoginOpen: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-4 bg-white/90 backdrop-blur dark:bg-gray-950/90 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">H_dajun</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mounted && (isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />)}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            {isMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="md:hidden fixed top-12 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-3 py-2 space-y-0.5"
          >
            <Link href="/" onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <HomeOutlined className="text-base" />首页
            </Link>
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span className="text-base">{item.icon}</span>{item.label}
              </Link>
            ))}
            <button
              onClick={() => { isAuthenticated ? logout() : onLoginOpen(); setIsMenuOpen(false); }}
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              {isAuthenticated ? <LogoutOutlined className="text-base" /> : <UserOutlined className="text-base" />}
              {isAuthenticated ? "Sign Out" : "Sign In"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────

function NavbarInner() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { login } = useAuth();
  return (
    <>
      <Sidebar onLoginOpen={() => setIsLoginModalOpen(true)} />
      <MobileTopBar onLoginOpen={() => setIsLoginModalOpen(true)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={login} />
    </>
  );
}

export function NavbarWrapper() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <>
      <NavbarInner />
      {isAuthenticated && <Live2DWidget />}
    </>
  );
}