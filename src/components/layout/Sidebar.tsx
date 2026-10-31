
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
    LayoutDashboard,
    Zap,
    ClipboardCheck,
    SlidersHorizontal,
    Gauge,
    Briefcase
} from "lucide-react";

type MenuItem = {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
    isNew?: boolean;
    external?: boolean;
};

const menuItems: MenuItem[] = [
    { name: "대시보드", href: "/", icon: LayoutDashboard },
    { name: "시황 분석", href: "/market", icon: TrendingUp },
    { name: "시장 신호등", href: "/signal", icon: Gauge },
    { name: "제네시스 모의 포트폴리오", href: "/portfolio", icon: Briefcase },
    { name: "마켓 인사이트", href: "/insight", icon: Zap },
    { name: "주식 스크리너", href: "https://screener.genesis-report.com", icon: SlidersHorizontal, isNew: true, external: true },
    { name: "투자 성과 리포트", href: "/picks/feedback", icon: ClipboardCheck },
    { name: "종목 리포트", href: "/analysis", icon: BarChart3 },
    { name: "경제 캘린더", href: "/calendar", icon: Calendar },
    { name: "투자 교육", href: "/education", icon: BookOpen },
    { name: "유망 종목 기록", href: "/picks", icon: Search },
];

import { useSidebar } from "./SidebarContext";
import { X } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, setIsOpen } = useSidebar();
    // 가장 구체적인 메뉴 하나만 활성화 (/picks/feedback이 /picks까지 켜지 않도록)
    const activeHref = menuItems
        .filter((item) => !item.external && (pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))))
        .sort((a, b) => b.href.length - a.href.length)[0]?.href;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-white transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col px-3 py-4 relative">
                    {/* Close button for mobile */}
                    <button
                        className="absolute right-4 top-4 rounded-md p-1 lg:hidden hover:bg-accent"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="mb-10 flex items-center px-2">
                        <div className="mr-3 h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="font-bold text-background">GR</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            Genesis Report
                        </span>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = item.href === activeHref;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    {...(item.external ? { target: "_blank", rel: "noopener" } : {})}
                                    className={cn(
                                        "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : item.isNew
                                                ? "text-foreground bg-sky-50 hover:bg-sky-100 border border-sky-200"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn("mr-3 h-5 w-5", isActive ? "" : item.isNew ? "text-sky-500" : "text-muted-foreground group-hover:text-accent-foreground")} />
                                    <span className="flex-1">{item.name}</span>
                                    {item.isNew && (
                                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-sky-500 text-white shadow-sm">
                                            NEW
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto border-t border-border pt-4">
                        <p className="px-3 py-2 text-[10px] text-muted-foreground text-center">
                            © {new Date().getFullYear()} 제네시스 주식 리포트
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
