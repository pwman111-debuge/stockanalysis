
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    TrendingUp,
    Search,
    BookOpen,
    Calendar,
    LayoutDashboard
} from "lucide-react";

const menuItems = [
    { name: "대시보드", href: "/", icon: LayoutDashboard },
    { name: "시황 분석", href: "/market", icon: TrendingUp },
    { name: "유망 종목", href: "/picks", icon: Search },
    { name: "종목 리포트", href: "/analysis", icon: BarChart3 },
    { name: "경제 캘린더", href: "/calendar", icon: Calendar },
    { name: "투자 교육", href: "/education", icon: BookOpen },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-white">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-10 flex items-center px-2">
                    <div className="mr-3 h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="font-bold text-background">KI</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        KRX Intel
                    </span>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "" : "text-muted-foreground group-hover:text-accent-foreground")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-border pt-4">
                    <p className="px-3 py-2 text-[10px] text-muted-foreground text-center">
                        © {new Date().getFullYear()} KRX Intelligence
                    </p>
                </div>
            </div>
        </aside>
    );
}
