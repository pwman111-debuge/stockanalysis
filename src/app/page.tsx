
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { TrendingUp, TrendingDown, Users, Activity, ArrowRight, Calendar, Zap, Globe, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getLatestMarketData } from "@/lib/api/market-api";
import { calculateFearGreed } from "@/lib/api/fear-greed";
import { getNextHighImpactEvent, getFlag } from "@/lib/api/economic-calendar";
import { AIInsight } from "@/components/dashboard/AIInsight";
import { RefreshButton } from "@/components/dashboard/RefreshButton";

// Contentlayer가 빌드 시간에 생성 — dynamic import로 안전하게
let allMarketAnalyses: any[] = [];
try {
  const cl = require('contentlayer2/generated');
  allMarketAnalyses = cl.allMarketAnalyses ?? [];
} catch { }

export default async function Home() {
  const marketData = await getLatestMarketData();
  const fearGreed = calculateFearGreed(marketData);
  const nextEvent = await getNextHighImpactEvent();

  // 최근 시황 분석 (Contentlayer MDX에서 최대 3개)
  const recentAnalyses = [...allMarketAnalyses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">시장 대시보드</h1>
          <p className="text-muted-foreground">현재 한국 주식시장의 핵심 지표를 실제 데이터 기반으로 확인하세요.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-sm font-medium">{marketData.lastUpdated}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">네이버 증권 자동 수집</p>
            <RefreshButton />
          </div>
        </div>
      </section>

      {/* Market Indices Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketData.indices.map((idx) => (
          <div key={idx.name} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">{idx.name}</span>
              {idx.status === "up" ? (
                <TrendingUp className="h-4 w-4 text-kr-up" />
              ) : (
                <TrendingDown className="h-4 w-4 text-kr-down" />
              )}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{idx.value}</span>
              <div className={cn("flex flex-col items-end text-xs font-semibold", idx.status === "up" ? "text-kr-up" : "text-kr-down")}>
                <span>{idx.change}</span>
                <span>{idx.percent}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Investor Supply Section */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              수급 현황 (당일)
            </h2>
          </div>
          <div className="space-y-4">
            {marketData.supply.map((inv) => (
              <div key={inv.name} className="flex items-center justify-between">
                <span className="text-sm text-foreground font-medium">{inv.name}</span>
                <div className="flex items-center">
                  <span className={cn("text-sm font-bold", inv.status === "up" ? "text-kr-up" : "text-kr-down")}>
                    {inv.value}
                  </span>
                  <div className={cn("ml-2 h-2 w-16 rounded-full bg-muted")}>
                    <div className={cn("h-full rounded-full transition-all", inv.status === "up" ? "bg-kr-up" : "bg-kr-down")} style={{ width: inv.value.includes('+') ? '70%' : '40%' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[11px] text-muted-foreground">* 코스피 시장 기준, 단위: 억원</p>
        </div>

        {/* ① Latest Market Analysis Section — 실제 MDX 연동 */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              최근 시황 분석
            </h2>
            <Link href="/market" className="text-xs font-medium text-primary hover:underline flex items-center">
              전체보기 <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentAnalyses.length > 0 ? (
              recentAnalyses.map((post, idx) => (
                <div key={post._id ?? idx} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link href={post.url} className="font-medium hover:text-primary transition-colors text-sm">
                        {post.title}
                      </Link>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(post.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '')}
                        </span>
                        <div className="flex space-x-1">
                          {post.tags?.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[9px] font-medium text-muted-foreground uppercase border border-border/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {post.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{post.summary}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                시황 분석 글이 아직 없습니다. <code className="text-xs">content/market-analysis/</code>에 MDX 파일을 추가하세요.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* AI Insight */}
        <AIInsight />

        {/* ② Fear & Greed 지수 — 실시간 산출 */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
            <Zap className="mr-1.5 h-4 w-4" />
            Fear &amp; Greed Index
          </h3>
          <div className="flex items-center space-x-4">
            <div className={cn(
              "h-14 w-14 rounded-full border-4 flex items-center justify-center font-bold text-lg",
              fearGreed.score > 60 ? "border-green-400 text-green-600" :
                fearGreed.score > 40 ? "border-yellow-400 text-yellow-600" :
                  "border-red-400 text-red-600"
            )}>
              {fearGreed.score}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold flex items-center gap-1.5">
                <span>{fearGreed.emoji}</span>
                {fearGreed.label} ({fearGreed.labelEn})
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {fearGreed.description}
              </p>
            </div>
          </div>
          {/* Mini breakdown */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { label: '모멘텀', val: fearGreed.breakdown.momentum },
              { label: '변동성', val: fearGreed.breakdown.volatility },
              { label: '수급', val: fearGreed.breakdown.foreignFlow },
              { label: '환율', val: fearGreed.breakdown.currencyStability },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", item.val > 15 ? "bg-green-400" : item.val > 8 ? "bg-yellow-400" : "bg-red-400")}
                    style={{ width: `${(item.val / 25) * 100}%` }} />
                </div>
                <p className="text-[10px] font-bold mt-0.5">{item.val}/25</p>
              </div>
            ))}
          </div>
        </div>

        {/* ③ 경제 캘린더 — 자동 이벤트 표시 */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              경제 캘린더
            </h3>
            {nextEvent ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg" title={nextEvent.countryName}>
                    {getFlag(nextEvent.country)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                    중요
                  </span>
                </div>
                <p className="text-sm font-bold leading-tight">{nextEvent.title}</p>
                <p className="text-xs text-muted-foreground">
                  {nextEvent.date} {nextEvent.time ? `${nextEvent.time} KST` : ''}
                </p>
                {nextEvent.description && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                    {nextEvent.description}
                  </p>
                )}
                {(nextEvent.actual || nextEvent.forecast || nextEvent.previous) && (
                  <div className="flex gap-4 mt-2 text-[11px]">
                    {nextEvent.actual && (
                      <span className="text-muted-foreground">발표: <strong className="text-green-600">{nextEvent.actual}</strong></span>
                    )}
                    {nextEvent.forecast && (
                      <span className="text-muted-foreground">예측: <strong className="text-primary">{nextEvent.forecast}</strong></span>
                    )}
                    {nextEvent.previous && (
                      <span className="text-muted-foreground">이전: <strong>{nextEvent.previous}</strong></span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">예정된 주요 이벤트가 없습니다.</p>
            )}
          </div>
          <Link href="/calendar" className="mt-4 text-xs font-semibold text-primary hover:underline flex items-center">
            전체 일정 보기 <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
