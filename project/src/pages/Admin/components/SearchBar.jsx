import { useState } from "react";

export default function SearchBar({ placeholder = "Search...", onSearch = () => {}, className = "" }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!onSearch) return;

    if (value.trim() === "") {
      onSearch(""); // reset filter
      return;
    }

    onSearch(value.toLowerCase());
  };

  return (
    <div className="flex w-full max-w-lg mb-4">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className={`flex-1 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${className}`}
      />
    </div>
  );
}
