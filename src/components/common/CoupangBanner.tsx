import { pickCoupangProducts } from '@/lib/coupang-products';

interface CoupangBannerProps {
  seed: string;
  keywords?: string[];
  variant: 'mid' | 'bottom';
  className?: string;
}

export function CoupangBanner({ seed, keywords = [], variant, className = '' }: CoupangBannerProps) {
  const products = pickCoupangProducts(seed, keywords, 2);
  if (products.length === 0) return null;

  const product = variant === 'mid' ? products[0] : products[products.length > 1 ? 1 : 0];

  return (
    <div className={`my-6 px-4 md:px-0 ${className}`}>
      <div className="border-t border-border pt-5">
        <p className="text-[11px] font-bold text-red-500 mb-2">
          * 이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
        <p className="text-sm text-slate-600 mb-3 leading-relaxed">
          <strong className="text-slate-900">{product.name}</strong> — {product.desc}
        </p>
        <div dangerouslySetInnerHTML={{ __html: product.htmlSnippet }} />
      </div>
    </div>
  );
}
