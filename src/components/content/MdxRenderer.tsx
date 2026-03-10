"use client";

import { useMDXComponent } from 'next-contentlayer2/hooks';

// MDX 컴포넌트 커스텀 스타일 정의
const mdxComponents = {
    h1: (props: any) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
    p: (props: any) => <p className="leading-7 mb-4 text-slate-700" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
    li: (props: any) => <li className="text-slate-700" {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-primary bg-muted/30 p-4 italic my-6 text-slate-600" {...props} />,
    code: (props: any) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
    pre: (props: any) => <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-6" {...props} />,
};

interface MdxRendererProps {
    code: string;
}

export function MdxRenderer({ code }: MdxRendererProps) {
    const Component = useMDXComponent(code);
    return <Component components={mdxComponents} />;
}
