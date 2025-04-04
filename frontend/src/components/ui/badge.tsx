import * as React from "react";

export const Badge = ({
    children,
    color = "blue",
}: {
    children: React.ReactNode;
    color?: string;
}) => {
    const colorClasses = {
        blue: "bg-blue-200 border-blue-500",
        green: "bg-green-200 border-green-500",
        red: "bg-red-200 border-red-500",
        yellow: "bg-yellow-200 border-yellow-500",
        purple: "bg-purple-200 border-purple-500",
    };

    return (
        <span
            className={`inline-block px-3 py-1 text-sm font-bold border-2 rounded-md ${
                colorClasses[color as keyof typeof colorClasses]
            }`}
        >
            {children}
        </span>
    );
};
