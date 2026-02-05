import React from 'react';

export const NavbarItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => {
  return (
    <a
      href='#'
      className={\px-4 py-2 transition \\}
    >
      {label}
    </a>
  );
};

export default NavbarItem;
