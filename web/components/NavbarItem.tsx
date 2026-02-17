import React from "react";
import { useRouter } from "next/router";

interface NavbarItemProps {
    label: string;
}

const NavbarItem: React.FC<NavbarItemProps> = ({label}) => {
    const router = useRouter();
    
    const getHref = () => {
        switch(label) {
            case "Home":
                return "/";
            case "Series":
                return "/series";
            case "Films":
                return "/films";
            case "New & Popular":
                return "/new";
            case "My List":
                return "/my-list";
            case "Browse by Languages":
                return "/languages";
            default:
                return "/";
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push(getHref());
    };

    const isActive = router.pathname === getHref();

    return (
        <div
            onClick={handleClick}
            className={`
                cursor-pointer inline-block origin-left transform-gpu will-change-transform transition-all duration-200
                ${isActive ? "text-red-500 font-semibold" : "text-white/90"}
                hover:text-red-500 hover:[transform:perspective(720px)_translate3d(0,-6px,56px)_scale(1.15)] hover:[text-shadow:0_8px_20px_rgba(239,68,68,0.45)]
            `}
        >
           {label}
        </div>
    )
}

export default NavbarItem
