"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    setMounted(true);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return <div className="w-[54px] h-[27px] rounded-full bg-surface-container-high" />;
  }

  return (
    <label className="theme-switch">
      <input
        className="theme-switch__input"
        type="checkbox"
        role="switch"
        checked={dark}
        onChange={toggle}
      />
      <span className="theme-switch__icon">
        <span className="theme-switch__icon-part theme-switch__icon-part--1" />
        <span className="theme-switch__icon-part theme-switch__icon-part--2" />
        <span className="theme-switch__icon-part theme-switch__icon-part--3" />
        <span className="theme-switch__icon-part theme-switch__icon-part--4" />
        <span className="theme-switch__icon-part theme-switch__icon-part--5" />
        <span className="theme-switch__icon-part theme-switch__icon-part--6" />
        <span className="theme-switch__icon-part theme-switch__icon-part--7" />
        <span className="theme-switch__icon-part theme-switch__icon-part--8" />
        <span className="theme-switch__icon-part theme-switch__icon-part--9" />
        <span className="theme-switch__icon-part theme-switch__icon-part--10" />
        <span className="theme-switch__icon-part theme-switch__icon-part--11" />
      </span>
      <span className="theme-switch__sr">Dark Mode</span>
    </label>
  );
}
