import { createContext, useContext } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const value = {
    language: "English",
    setLanguage: () => {},
    t: {},
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}