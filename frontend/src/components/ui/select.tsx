import * as React from "react";

export const Select = ({
    options,
    value,
    onChange,
    placeholder,
}: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 font-bold bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-yellow-400"
    >
        <option value="" disabled>
            {placeholder}
        </option>
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);
