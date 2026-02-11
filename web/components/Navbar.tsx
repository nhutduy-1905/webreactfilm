import React, {useCallback, useEffect, useState, useRef} from "react";
import NavbarItem from "./NavbarItem"
import MobileMenu from "./MobileMenu"
import AccountMenu from "./AccountMenu"
import {BsChevronDown, BsSearch, BsBell} from "react-icons/bs"
import {AiOutlineClose} from "react-icons/ai"
import { useRouter } from "next/router";

const TOP_OFFSET: number = 66;


const Navbar: React.FC = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showBackground, setShowBackground] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();


    useEffect(() => {
        const handleScroll = () => {
            if(window.scrollY > TOP_OFFSET){
                setShowBackground(true);
            } else {
                setShowBackground(false);
            }
        }

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }

    }, [])

    const toggleMobileMenu = useCallback(() => {
        setShowMobileMenu((prevState) => !prevState);
    }, [])

    const toggleAccountMenu = useCallback(() => {
        setShowAccountMenu((prevState) => !prevState);
    }, [])

    const toggleSearch = useCallback(() => {
        setShowSearch((prev) => {
            if (!prev) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
            } else {
                setSearchQuery('');
                setSearchResults([]);
            }
            return !prev;
        });
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
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
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearching(false);
            }
        }, 300);
    }, []);

    const handleResultClick = useCallback((movieId: string) => {
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        router.push(`/watch/${movieId}`);
    }, [router]);

    return (
        <nav className=" w-full fixed z-40">
            <div className={`
                px-4
                md:px-16
                py-6
                flex
                flex-row
                items-center
                transition
                duration-500
                ${showBackground ? 'bg-zinc-900 bg-opacity-90' : '' }
                `}>
                <img className="h-4 lg:h-7" src="/images/logo.png" alt="logo" />
                <div className="
                    flex-row
                    ml-8
                    gap-7
                    hidden
                    lg:flex
                ">
                    <NavbarItem label="Home" />
                    <NavbarItem label="Series" />
                    <NavbarItem label="Films" />
                    <NavbarItem label="New & Popular" />
                    <NavbarItem label="My List" />
                    <NavbarItem label="Browse by Languages" />
                </div>
                <div  onClick={toggleMobileMenu} className="lg:hidden flex flex-row items-center gap-2 ml-8 cursor-pointer relative">
                    <p className="text-white text-sm">Browse</p>
                    <BsChevronDown className={`text-white transition ${showMobileMenu ? 'rotate-180' : 'rotate-0'}`}/>
                    <MobileMenu visible={showMobileMenu} />
                </div>
                <div className="flex flex-row ml-auto gap-7 items-center">
                    <div className="relative">
                        <div className={`flex items-center transition-all duration-300 ${showSearch ? 'bg-black bg-opacity-75 border border-white' : ''}`}>
                            <div onClick={toggleSearch} className="text-gray-200 hover:text-gray-300 cursor-pointer transition p-2">
                                {showSearch ? <AiOutlineClose /> : <BsSearch />}
                            </div>
                            {showSearch && (
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Tìm phim..."
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
                                            <img src={movie.thumbnailUrl} alt="" className="w-16 h-10 object-cover rounded" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                                            <p className="text-gray-400 text-xs">{movie.genre || ''} {movie.duration ? `• ${movie.duration} phút` : ''}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {showSearch && searchQuery && searchResults.length === 0 && !searching && (
                            <div className="absolute top-full right-0 mt-2 w-[300px] bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl p-4 z-50">
                                <p className="text-gray-400 text-sm text-center">Không tìm thấy phim</p>
                            </div>
                        )}
                    </div>
                    <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition">
                        <BsBell />
                    </div>
                    <div onClick={toggleAccountMenu}className="flex flex-row items-center gap-2 cursor-pointer relative">
                        <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-md overflow-hidden">
                            <img src="/images/default-blue.png" alt="profile image" />
                        </div>
                        <BsChevronDown className={`text-white transition ${showAccountMenu? 'rotate-180' : 'rotate-0'}`}/>
                        <AccountMenu visible={showAccountMenu}/>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;