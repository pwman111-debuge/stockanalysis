
"use client";

import { useState, useEffect } from "react";
import { Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CACHE_KEY = "ai_insight_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1시간 (서버 데이터가 9시/4시에 갱신되므로 더 자주 확인)

export function AIInsight() {
    const [insight, setInsight] = useState<string>("시장 데이터를 분석하여 오늘의 전략을 도출하고 있습니다...");
    const [isLoading, setIsLoading] = useState(true);
    const [generatedAt, setGeneratedAt] = useState<string>("");

    useEffect(() => {
        async function fetchInsight() {
            try {
                // 1. 브라우저 로컬 캐시 확인
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp, displayTime } = JSON.parse(cached);
                    // 1시간 이내라면 서버 요청 없이 캐시 사용
                    if (Date.now() - timestamp < CACHE_TTL) {
                        setInsight(data);
                        setGeneratedAt(displayTime);
                        setIsLoading(false);
                        return;
                    }
                }

                // 2. 캐시가 없거나 만료된 구역에만 API 호출
                const response = await fetch("/api/ai/insights");
                const data = await response.json();
                
                if (data.insight) {
                    setInsight(data.insight);
                    if (data.generatedAt) {
                        const date = new Date(data.generatedAt);
                        const displayTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                        setGeneratedAt(displayTime);
                        
                        // 결과 저장
                        localStorage.setItem(CACHE_KEY, JSON.stringify({
                            data: data.insight,
                            timestamp: Date.now(),
                            displayTime: displayTime
                        }));
                    }
                } else if (data.error) {
                    // 데이터가 없는 경우 (KV가 비어있을 때 등)
                    const cached = localStorage.getItem(CACHE_KEY);
                    if (cached) {
                        const { data: cachedInsight, displayTime } = JSON.parse(cached);
                        setInsight(cachedInsight);
                        setGeneratedAt(displayTime);
                    } else {
                        setInsight("최근 시장 분석 데이터를 불러오는 중입니다.");
                    }
                }
            } catch (error) {
                console.error("AI Insight Fetch Error:", error);
                // 에러 발생 시 캐시가 있다면 캐시라도 보여줌
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data: cachedInsight, displayTime } = JSON.parse(cached);
                    setInsight(cachedInsight);
                    setGeneratedAt(displayTime);
                } else {
                    setInsight("AI 분석 데이터 연결에 실패했습니다.");
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchInsight();
    }, []);


    return (
        <div className="rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100 p-6 shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">오늘의 인사이트</h3>
                    </div>
                    {!isLoading && generatedAt && (
                        <div className="flex items-center text-[10px] text-blue-400 bg-white/50 px-2 py-0.5 rounded-full border border-blue-50">
                            <Clock className="h-3 w-3 mr-1" />
                            {generatedAt} 분석됨
                        </div>
                    )}
                </div>
                
                <p className={cn(
                    "text-sm leading-relaxed text-blue-900 transition-opacity duration-500",
                    isLoading ? "opacity-50" : "opacity-100"
                )}>
                    {insight}
                </p>
                
                {isLoading && (
                    <div className="mt-4 flex space-x-1.5">
                        <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-100/50">
                <p className="text-[10px] text-blue-400/80 font-medium">
                    * 인공지능이 매일 오전 9시, 오후 4시 정밀 시황 분석을 수행합니다.
                </p>
            </div>
        </div>
    );
}

