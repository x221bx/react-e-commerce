import { useState, useEffect, useMemo } from "react";
import { navItems, navCategories } from "../utils/constants";

export const useSettingsNavigation = () => {
  const [activeSection, setActiveSection] = useState("personal");
  const [activeCategory, setActiveCategory] = useState("general");

  const filteredNavItems = useMemo(
    () => navItems.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const activeCategoryCopy = useMemo(
    () => navCategories.find((category) => category.id === activeCategory) ?? navCategories[0],
    [activeCategory]
  );

  useEffect(() => {
    const currentSection = navItems.find((item) => item.id === activeSection);
    if (currentSection && currentSection.category !== activeCategory) {
      setActiveCategory(currentSection.category);
    }
  }, [activeSection, activeCategory]);

  const handleCategoryChange = (categoryId) => {
    if (categoryId === activeCategory) return;
    setActiveCategory(categoryId);
    const firstSection = navItems.find((item) => item.category === categoryId);
    if (firstSection) {
      scrollToSection(firstSection.id);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);

    if (typeof document === "undefined") {
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return {
    activeSection,
    activeCategory,
    filteredNavItems,
    activeCategoryCopy,
    setActiveSection,
    handleCategoryChange,
    scrollToSection,
  };
};
