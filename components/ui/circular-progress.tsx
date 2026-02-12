"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number
    size?: number
    strokeWidth?: number
    showValue?: boolean
}

export function CircularProgress({
    value,
    size = 80,
    strokeWidth = 8,
    showValue = true,
    className,
    ...props
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    // Color based on value
    const getColor = (val: number) => {
        if (val >= 80) return "hsl(var(--success))"
        if (val >= 60) return "hsl(var(--primary))"
        if (val >= 40) return "hsl(var(--warning))"
        return "hsl(var(--destructive))"
    }

    const color = getColor(value)

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)} {...props}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold" style={{ color }}>
                        {value}%
                    </span>
                </div>
            )}
        </div>
    )
}
