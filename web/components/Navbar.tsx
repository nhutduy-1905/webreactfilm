import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AiOutlineClose } from "react-icons/ai";
import { BsBell, BsChevronDown, BsSearch } from "react-icons/bs";
import AccountMenu from "./AccountMenu";
import MobileMenu from "./MobileMenu";
import NavbarItem from "./NavbarItem";

const Navbar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Always reset to transparent on route load; only darken after user scrolls.
    const handleScroll = () => {
      setShowBackground(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [router.asPath]);

  const toggleMobileMenu = useCallback(() => {
    setShowMobileMenu((prev) => !prev);
  }, []);

  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu((prev) => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery("");
        setSearchResults([]);
      }
      return !prev;
    });
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const q = event.target.value;
    setSearchQuery(q);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleResultClick = useCallback((movieId: string) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/watch/${movieId}`);
  }, [router]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div
        className={`
          h-[68px] md:h-[76px]
          px-4 md:px-16
          flex flex-row items-center
          transition-all duration-500
          ${
            showBackground
              ? "bg-black/90 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
              : "bg-transparent backdrop-blur-0 shadow-none"
          }
        `}
      >
        <img className="h-4 lg:h-7" src="/images/logo.png" alt="logo" />

        <div className="flex-row ml-8 gap-7 hidden lg:flex">
          <NavbarItem label="Home" />
          <NavbarItem label="Series" />
          <NavbarItem label="Films" />
          <NavbarItem label="New & Popular" />
          <NavbarItem label="My List" />
          <NavbarItem label="Browse by Languages" />
        </div>

        <div
          onClick={toggleMobileMenu}
          className="lg:hidden flex flex-row items-center gap-2 ml-8 cursor-pointer relative"
        >
          <p className="text-white text-sm">Browse</p>
          <BsChevronDown className={`text-white transition ${showMobileMenu ? "rotate-180" : "rotate-0"}`} />
          <MobileMenu visible={showMobileMenu} />
        </div>

        <div className="flex flex-row ml-auto gap-7 items-center">
          <div className="relative">
            <div
              className={`flex items-center transition-all duration-300 ${
                showSearch ? "bg-black/75 border border-white/30 rounded-sm" : ""
              }`}
            >
              <div
                onClick={toggleSearch}
                className="text-gray-200 hover:text-gray-300 cursor-pointer transition p-2"
              >
                {showSearch ? <AiOutlineClose /> : <BsSearch />}
              </div>
              {showSearch && (
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Tim phim..."
                  className="bg-transparent text-white text-sm outline-none w-[200px] md:w-[280px] pr-3 py-1"
                />
              )}
            </div>

            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-[300px] md:w-[350px] bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl max-h-[400px] overflow-y-auto z-50">
                {searchResults.map((movie: any) => (
                  <div
                    key={movie.id}
                    onClick={() => handleResultClick(movie.id)}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer transition border-b border-zinc-800 last:border-b-0"
                  >
                    {movie.thumbnailUrl && (
                      <img
                        src={movie.thumbnailUrl}
                        alt=""
                        className="w-16 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {movie.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {movie.genre || ""} {movie.duration ? `• ${movie.duration} phut` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSearch && searchQuery && searchResults.length === 0 && !searching && (
              <div className="absolute top-full right-0 mt-2 w-[300px] bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl p-4 z-50">
                <p className="text-gray-400 text-sm text-center">Khong tim thay phim</p>
              </div>
            )}
          </div>

          <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition">
            <BsBell />
          </div>

          <div
            onClick={toggleAccountMenu}
            className="flex flex-row items-center gap-2 cursor-pointer relative"
          >
            <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-md overflow-hidden">
              <img
                src="/images/default-blue.png"
                alt="profile image"
                className="w-full h-full object-cover block"
              />
            </div>
            <BsChevronDown className={`text-white transition ${showAccountMenu ? "rotate-180" : "rotate-0"}`} />
            <AccountMenu visible={showAccountMenu} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
