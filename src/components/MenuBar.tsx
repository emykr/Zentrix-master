import React, { useState } from 'react';
import { t } from '@utils/LangLoader';

interface MenuItem {
  label: string;
  onClick?: () => void;
  items?: MenuItem[];
}

interface MenuBarProps {
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onExport?: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onNew,
  onOpen,
  onSave,
  onExport
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menus: Record<string, MenuItem[]> = {
    [t('menu.file')]: [
      { label: t('menu.file.new'), onClick: onNew },
      { label: t('menu.file.open'), onClick: onOpen },
      { label: t('menu.file.save'), onClick: onSave },
      { label: t('menu.file.export'), onClick: onExport }
    ],
    [t('menu.edit')]: [
      { label: t('menu.edit.undo') },
      { label: t('menu.edit.redo') },
      { label: t('menu.edit.cut') },
      { label: t('menu.edit.copy') },
      { label: t('menu.edit.paste') }
    ],
    [t('menu.view')]: [
      { label: t('menu.view.zoomIn') },
      { label: t('menu.view.zoomOut') },
      { label: t('menu.view.fitToScreen') },
      { label: t('menu.view.actualSize') }
    ],
    [t('menu.help')]: [
      { label: t('menu.help.shortcuts') },
      { label: t('menu.help.about') }
    ]
  };

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    item.onClick?.();
    setActiveMenu(null);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-gray-800 text-white z-50">
      <div className="flex items-center h-8">
        {Object.entries(menus).map(([menuName, items]) => (
          <div 
            key={menuName} 
            className="relative"
            onMouseEnter={() => setActiveMenu(menuName)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              className={`px-4 h-full text-sm hover:bg-gray-700 focus:outline-none whitespace-nowrap ${
                activeMenu === menuName ? 'bg-gray-700' : ''
              }`}
              onClick={() => handleMenuClick(menuName)}
            >
              {menuName}
            </button>
            {activeMenu === menuName && (
              <div className="absolute left-0 top-full bg-gray-800 min-w-[200px] shadow-lg border border-gray-700 rounded-b overflow-hidden">
                {items.map((item, index) => (
                  <button
                    key={index}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleMenuItemClick(item)}
                    disabled={!item.onClick}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  };

  export default MenuBar;