import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContextMenu.css';

export default function SidebarContextMenu({ visible, x, y, items, onClose }) {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [visible, onClose]);

  useEffect(() => {
    if (visible && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (rect.right > vw) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > vh) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [visible, x, y]);

  if (!visible || !items || items.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="ctx-menu"
      style={{ left: x, top: y }}
    >
      {items.map((item, idx) => {
        if (item.divider) {
          return <div key={idx} className="ctx-divider" />;
        }

        return (
          <button
            key={idx}
            className="ctx-item"
            onClick={() => {
              onClose();
              if (item.action) {
                item.action();
              } else if (item.to) {
                navigate(item.to);
              }
            }}
          >
            {item.icon && (
              <svg className="ctx-icon" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: item.icon }} />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
