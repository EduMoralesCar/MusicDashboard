import React, { useRef, useEffect, useState } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Buscar artista...', suggestions = [], onSelectSuggestion }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handle = (e) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('click', handle);
        return () => document.removeEventListener('click', handle);
    }, []);

    useEffect(() => {
        setOpen(Boolean(suggestions && suggestions.length && value));
    }, [suggestions, value]);

    return (
        <div className="mb-3 position-relative" ref={ref} style={{minWidth:200}}>
            <input
                className="form-control"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setOpen(Boolean(suggestions && suggestions.length && value))}
            />

            {open && (
                <div className="list-group position-absolute" style={{zIndex:2000, width: '100%'}}>
                    {suggestions.map((s) => (
                        <button
                            key={s.id || s.mbid || s.nombre}
                            type="button"
                            className="list-group-item list-group-item-action text-start"
                            onClick={() => {
                                onSelectSuggestion && onSelectSuggestion(s);
                                setOpen(false);
                            }}
                        >
                            {s.nombre || s.name}
                        </button>
                    ))}
                    {suggestions.length === 0 && (
                        <div className="list-group-item text-muted">Sin sugerencias</div>
                    )}
                </div>
            )}
        </div>
    );
}