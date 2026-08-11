import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("tracepaper_theme") || "System Default"
  );

  const [language, setLanguage] = useState(
    localStorage.getItem("tracepaper_language") || "English"
  );

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "Dark") {
      root.classList.add("dark");
    } else if (theme === "Light") {
      root.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      root.classList.toggle("dark", systemDark);
    }

    localStorage.setItem("tracepaper_theme", theme);
  }, [theme]);

  // Save language
  useEffect(() => {
    localStorage.setItem("tracepaper_language", language);
  }, [language]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}