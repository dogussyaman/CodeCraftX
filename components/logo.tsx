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
            className={cn(
                "flex items-center gap-2 select-none h-9",
                className
            )}
        >
            {/* Icon – logo ile yazı oranı uyumlu */}
            <Image
                src="/logo.png"
                alt="CodeCraftX logo"
                width={28}
                height={28}
                className="block shrink-0 h-7 w-7 object-contain"
                priority={false}
            />

            {/* Text – logo ile aynı hizada */}
            {showText && (
                <span className="text-lg font-semibold tracking-tight text-foreground leading-none align-middle">
                    Code<span className="font-bold">CraftX</span>
                </span>
            )}
        </Link>
    )
}
