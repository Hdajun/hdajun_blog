"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BookOutlined, FormOutlined, MessageOutlined } from "@ant-design/icons";
import { ThemeToggle } from "./ThemeToggle";
import { Bars3Icon as MenuIcon } from "@heroicons/react/24/outline";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import Live2DWidget from "./Live2DWidget";

export const navigationItems = [
  {
    href: "/notes",
    label: "小记",
    icon: <FormOutlined className="text-xl" />,
    title: "阅读小记",
    description: "浏览我的技术小记，分享我的开发经验和学习心得。",
    actionText: "查看小记",
    tags: ["Markdown", "随缘更新", "技术"],
    themeColor: "purple",
  },
  {
    href: "/chat",
    label: "CHAT",
    icon: <MessageOutlined className="text-xl" />,
    title: "和我聊聊",
    description: "任何技术问题都可以和我交流，让我们一起探讨编程的乐趣。",
    actionText: "开始对话",
    tags: ["DeepSeek", "AI", "实时对话"],
    themeColor: "green",
  },
  {
    href: "/questions",
    label: "题库",
    icon: <BookOutlined className="text-xl" />,
    title: "前端题库",
    description: "精心整理的前端面试题库，助你轻松应对技术面试，提升专业能力。",
    actionText: "开始刷题",
    tags: ["面试题", "React", "Vue"],
    themeColor: "blue",
  },
];

// 提取导航链接的样式为可复用的类名
const navLinkStyles = `
  relative
  flex
  items-center
  rounded-lg
  px-3
  py-2
  text-sm
  font-medium
  text-gray-700
  transition-all
  duration-300
  hover:bg-gray-100
  hover:text-800
  dark:text-gray-300
  dark:hover:bg-gray-800
  dark:hover:text-white
`;

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, login, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginSuccess = (token: string) => {
    login(token);
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-[60] transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur shadow-sm dark:bg-gray-900/90"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-14">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="group relative text-xl font-bold tracking-tight"
              >
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-violet-400 group-hover:to-indigo-400">
                  H_dajun
                </span>
                <span className="ml-1 text-gray-700 dark:text-gray-200">
                  _0x01
                </span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* 主导航 - 桌面端 */}
              <nav className="ml-12 hidden space-x-2 md:flex">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkStyles}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* 右侧操作区 - 桌面端 */}
            <div className="hidden items-center space-x-4 md:flex">
              <ThemeToggle />
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="group relative overflow-hidden rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-300 hover:shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="group relative overflow-hidden rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-300 hover:shadow-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <div className="flex items-center md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="ml-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="切换菜单"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* 移动端菜单 */}
          <div
            className={`md:hidden ${
              isMenuOpen ? "block" : "hidden"
            } border-t border-gray-200 dark:border-gray-700`}
          >
            <nav className="flex flex-col space-y-4 py-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium text-gray-900 dark:text-gray-100"
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-sm font-medium text-gray-800 transition-all duration-300 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-sm font-medium text-gray-800 transition-all duration-300 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export function NavbarWrapper() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Navbar />
      {isAuthenticated && <Live2DWidget />}
    </>
  );
}
