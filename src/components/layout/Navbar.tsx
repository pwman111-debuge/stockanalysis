
"use client";

import { Search, UserCircle, Menu } from "lucide-react";
import { useState } from "react";
import { useSidebar } from "./SidebarContext";

export function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const { toggle } = useSidebar();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim() !== "") {
            const query = searchQuery.trim();
            // 종목 코드(6자리 숫자)인 경우 네이버 증권 종목 페이지로 바로 이동
            if (/^\d{6}$/.test(query)) {
                window.open(`https://finance.naver.com/item/main.naver?code=${query}`, "_blank");
            } else {
                // 한글 종목명인 경우 네이버 통합검색(주가)으로 이동하여 인코딩(EUC-KR) 깨짐 및 404 방지
                window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(query + " 주가")}`, "_blank");
            }
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 md:px-8 backdrop-blur">
            <div className="flex items-center space-x-4 flex-1">
                <button 
                    onClick={toggle}
                    className="rounded-md p-2 hover:bg-accent text-muted-foreground"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>
                
                <div className="flex w-full max-w-xl items-center">
                <div className="relative w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="block w-full rounded-full border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="종목명, 코드 또는 테마 검색..."
                    />
                </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end mr-2 text-right">
                    <span className="text-xs font-medium text-foreground">운영자 모드</span>
                    <span className="text-[10px] text-muted-foreground text-success">시스템 정상 작업 중</span>
                </div>
                <button className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    <UserCircle className="h-8 w-8" />
                </button>
            </div>
        </header>
    );
}
