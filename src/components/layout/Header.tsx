"use client";

import { usePageTitle } from "./PageTitleProvider";

export function Header() {
  const { title } = usePageTitle();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 capitalize">
          {title}
        </h1>
        <div className="flex items-center space-x-4">
          {/* We'll add user menu here later */}
        </div>
      </div>
    </header>
  );
}
