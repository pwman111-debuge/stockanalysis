'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleRefresh = async () => {
        setLoading(true);
        setStatus('idle');
        try {
            const res = await fetch('/api/market/refresh');
            if (res.ok) {
                setStatus('success');
                // 페이지 전체를 새로고침하여 최신 데이터 반영
                window.location.reload();
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRefresh}
            disabled={loading}
            title="네이버 증권에서 최신 데이터 수집"
            className={`
                inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold
                border transition-all duration-200
                ${status === 'error'
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : status === 'success'
                        ? 'border-green-300 bg-green-50 text-green-600'
                        : 'border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/50'}
                disabled:cursor-not-allowed disabled:opacity-60
            `}
        >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '수집 중...' : status === 'success' ? '완료!' : status === 'error' ? '실패' : '새로고침'}
        </button>
    );
}
