import Link from 'next/link';
import { Home, TrendingUp, LineChart, Lightbulb, BarChart3, GraduationCap } from 'lucide-react';

export const metadata = {
    title: '페이지를 찾을 수 없습니다 (404)',
    description: '요청하신 페이지를 찾을 수 없습니다. 제네시스 주식 리포트의 최신 시황 분석과 종목 리포트를 확인해 보세요.',
    robots: { index: false, follow: true },
};

const popularLinks = [
    { href: '/market', label: '실시간 시황 분석', icon: LineChart },
    { href: '/analysis', label: '종목 리포트', icon: BarChart3 },
    { href: '/picks', label: '유망 종목', icon: TrendingUp },
    { href: '/insight', label: '마켓 인사이트', icon: Lightbulb },
    { href: '/picks/feedback', label: '투자 성과 리포트', icon: TrendingUp },
    { href: '/education', label: '투자 교육', icon: GraduationCap },
];

export default function NotFound() {
    return (
        <div className="max-w-3xl mx-auto py-16 px-4 text-center">
            <p className="text-6xl font-extrabold text-primary tracking-tight">404</p>
            <h1 className="mt-4 text-2xl font-bold text-foreground">
                페이지를 찾을 수 없습니다
            </h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
                요청하신 주소가 변경되었거나 삭제되었을 수 있습니다.
                <br className="hidden sm:block" />
                아래에서 최신 분석 리포트를 바로 확인해 보세요.
            </p>

            <Link
                href="/"
                className="mt-8 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
                <Home className="w-4 h-4" />
                홈으로 돌아가기
            </Link>

            <div className="mt-12">
                <h2 className="text-sm font-semibold text-muted-foreground mb-4">
                    인기 콘텐츠 바로가기
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {popularLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href + label}
                            href={href}
                            className="flex items-center gap-2 p-4 rounded-xl bg-accent/50 border border-border text-left text-sm font-medium text-foreground hover:border-primary/40 hover:bg-accent transition-colors"
                        >
                            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
