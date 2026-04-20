'use client';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@lib/api/settings.api';
import DOMPurify from 'dompurify';
import Breadcrumb from '@/src/components/shared/Breadcrumb';

export default function RefundPolicyPage() {
    const { data: policies, isLoading } = useQuery({
        queryKey: ['public', 'policies'],
        queryFn: settingsApi.getPolicies,
    });

    return (
        <main className="bg-light pb-5">
            <Breadcrumb
                title="Refund Policy"
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Refund Policy' }
                ]}
            />

            <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow" style={{ border: '1px solid #f1f3f9' }}>
                            {isLoading ? (
                                <div className="d-flex justify-content-center py-5">
                                    <span className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
                                </div>
                            ) : (
                                <div
                                    className="policy-content"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policies?.refundPolicy || '<p class="text-muted text-center py-5">Content not available yet.</p>') }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .policy-content {
                    color: #4a5568;
                    line-height: 1.8;
                    font-size: 16.5px;
                }
                .policy-content h1, 
                .policy-content h2, 
                .policy-content h3, 
                .policy-content h4 {
                    color: #1a202c;
                    font-weight: 700;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                }
                .policy-content h1:first-child,
                .policy-content h2:first-child,
                .policy-content h3:first-child {
                    margin-top: 0;
                }
                .policy-content h2 { font-size: 28px; }
                .policy-content h3 { font-size: 22px; }
                .policy-content p {
                    margin-bottom: 1.25rem;
                }
                .policy-content ul, 
                .policy-content ol {
                    margin-bottom: 1.25rem;
                    padding-left: 1.5rem;
                }
                .policy-content li {
                    margin-bottom: 0.5rem;
                }
                .policy-content a {
                    color: #FD4621;
                    text-decoration: none;
                    font-weight: 500;
                }
                .policy-content a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </main>
    );
}
