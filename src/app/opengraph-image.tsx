import { ImageResponse } from 'next/og';

export const alt = '제네시스 주식 리포트';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    // Use fetch with import.meta.url to read local assets in Next.js Edge/Node environments
    const imageData = await fetch(
        new URL('../../public/images/hero-wisdom.png', import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to right, #0f172a, #1e293b, #0f172a)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '80px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
                    <div style={{ color: '#3b82f6', fontSize: 32, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px' }}>
                        KRX Intelligence
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', color: 'white', fontSize: 76, fontWeight: 'bolder', lineHeight: 1.1 }}>
                        <span>제네시스</span>
                        <span style={{ color: '#60a5fa' }}>주식 리포트</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 36, marginTop: '24px', lineHeight: 1.4 }}>
                        코스피·코스닥 실시간 지표 및<br />
                        시황 기반 투자 인사이트
                    </div>
                </div>
                <div style={{ display: 'flex', position: 'relative', right: '-40px' }}>
                    {/* @ts-ignore */}
                    <img src={imageData} width="520" height="520" style={{ objectFit: 'contain' }} />
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
