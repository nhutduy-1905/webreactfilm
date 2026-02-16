import React from "react";
import { useRouter } from "next/router";

interface MobileMenuProps {
    visible: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({visible}) => {
    const router = useRouter();
    
    const menuItems = [
        { label: "Home", href: "/" },
        { label: "Series", href: "/series" },
        { label: "Films", href: "/films" },
        { label: "New & Popular", href: "/new" },
        { label: "My list", href: "/my-list" },
        { label: "Browse by language", href: "/languages" },
    ];

    const handleClick = (href: string) => {
        router.push(href);
    };

    if(!visible){
        return null;
    }

    return (
        <div className="
        bg-black
        absolute
        w-56
        left-0
        top-8
        py-5
        border-2
        border-gray-800
        flex
        flex-col
        ">
            <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                    <div 
                        key={item.label}
                        onClick={() => handleClick(item.href)}
                        className="px-3 text-center text-white hover:underline cursor-pointer"
                    >
                        {item.label}
                    </div>
                ))}
            </div>

        </div>
    )
}

export default MobileMenu
