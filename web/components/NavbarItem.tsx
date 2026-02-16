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

    return (
        <div 
            onClick={handleClick}
            className="
                text-white cursor-pointer hover:text-gray-300 transition
            "
        >
           {label}
        </div>
    )
}

export default NavbarItem
