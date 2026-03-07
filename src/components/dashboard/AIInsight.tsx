
"use client";

import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIInsight() {
    const [insight, setInsight] = useState<string>("시장 데이터를 정밀 분석하고 있습니다...");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchInsight() {
            try {
                const response = await fetch("/api/ai/insights");
                const data = await response.json();
                if (data.insight) {
                    setInsight(data.insight);
                } else if (data.error) {
                    setInsight("분석 데이터를 불러오지 못했습니다. API 키가 유효한지 확인해 주세요.");
                }
            } catch (error) {
                console.error("AI Insight Fetch Error:", error);
                setInsight("AI 엔진 연결에 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchInsight();
    }, []);

    return (
        <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center space-x-2 mb-3">
                <Activity className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">오늘의 인사이트</h3>
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <p className={cn(
                "text-sm leading-relaxed text-blue-900 transition-opacity",
                isLoading ? "opacity-50" : "opacity-100"
            )}>
                {insight}
            </p>
            {isLoading && (
                <div className="mt-3 flex space-x-1">
                    <div className="h-1 w-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-1 w-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-1 w-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            )}
        </div>
    );
}
