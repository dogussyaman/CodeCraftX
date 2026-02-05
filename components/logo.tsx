import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
    className?: string
    showText?: boolean
    href?: string
}

export function Logo({ className, showText = true, href = "/" }: LogoProps) {
    return (
        <Link
            href={href}
            className={cn("flex items-center gap-2 select-none", className)}
        >
            {/* Icon (symbol-only logo from public) */}
            <Image
                src="/logo.png"
                alt="CodeCraftX logo"
                width={32}
                height={32}
                className="block shrink-0 h-8 w-8"
                priority={false}
            />

            {/* Text */}
            {showText && (
                <div className="relative">
                    <span className="absolute -mt-1 text-xl font-semibold tracking-tight text-foreground leading-none flex items-center">
                        Code<span className="font-bold">CraftX</span>
                    </span>
                </div>
            )}
        </Link>
    )
}
