'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@lib/api/settings.api';
import { PolicyContent } from '@lib/types/settings.types';
import toast from 'react-hot-toast';
import RichTextEditor from '@components/admin/RichTextEditor';
import { Save, AlertCircle } from 'lucide-react';

const POLICY_TABS = [
    { id: 'privacyPolicy', label: 'Privacy Policy' },
    { id: 'termsAndConditions', label: 'Terms & Conditions' },
    { id: 'refundPolicy', label: 'Refund Policy' },
    { id: 'cancellationPolicy', label: 'Cancellation Policy' },
    { id: 'bookingInstructions', label: 'Booking Instructions' },
];

export default function AdminPoliciesPage() {
    const [activeTab, setActiveTab] = useState<keyof PolicyContent>('privacyPolicy');
    const [content, setContent] = useState<PolicyContent>({});

    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery({
        queryKey: ['admin', 'settings'],
        queryFn: settingsApi.getSettings,
    });

    useEffect(() => {
        if (response?.policies)
        {
            setContent(response.policies);
        }
    }, [response]);

    const mutation = useMutation({
        mutationFn: (updatedPolicies: PolicyContent) => {
            const payload = {
                businessDetails: response?.businessDetails,
                socialMedia: response?.socialMedia,
                paymentDetails: response?.paymentDetails,
                otherSettings: response?.otherSettings,
                policies: updatedPolicies
            };
            return settingsApi.updateSettings(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
            toast.success('Policies saved successfully');
        },
        onError: () => {
            toast.error('Failed to save policies');
        }
    });

    const handleSave = () => {
        mutation.mutate(content);
    };

    if (isLoading) return <div className="p-5 text-center"><span className="spinner-border text-primary" /></div>;

    const ActiveTabLabel = POLICY_TABS.find(t => t.id === activeTab)?.label;

    return (
        <div className="container-fluid p-4" style={{ maxWidth: '1400px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Policy Management</h4>
                    <p className="text-muted mb-0 small">Manage public policies and booking instructions shown to users.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                    style={{ borderRadius: '8px', fontWeight: 600 }}>
                    {mutation.isPending ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
                    Save All Policies
                </button>
            </div>

            <div className="row g-4 h-100">
                <div className="col-12 col-md-3">
                    <div className="bg-white rounded p-3 shadow-sm h-100">
                        <div className="d-flex flex-column gap-2">
                            {POLICY_TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as keyof PolicyContent)}
                                    className={`btn text-start p-3 border-0 rounded ${activeTab === tab.id ? 'bg-primary text-white fw-bold shadow-sm' : 'bg-light text-dark hover-bg-gray'}`}
                                    style={{ transition: 'all 0.2s', fontSize: '14px' }}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-light rounded text-muted small d-flex align-items-start gap-2">
                            <AlertCircle size={16} className="mt-1 flex-shrink-0" />
                            <span>These pages are publicly visible and are linked directly from the Booking page. Ensure all content is accurate and legally verified.</span>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-9 d-flex flex-column h-100">
                    <div className="bg-white rounded shadow-sm flex-grow-1 d-flex flex-column h-100 p-0 overflow-hidden" style={{ minHeight: '600px' }}>
                        <div className="p-3 border-bottom bg-light">
                            <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                Editing: <span className="text-primary">{ActiveTabLabel}</span>
                            </h6>
                        </div>
                        <div className="flex-grow-1 p-0 h-100">
                            <RichTextEditor
                                value={content[activeTab] || ''}
                                onChange={(val) => setContent(prev => ({ ...prev, [activeTab]: val }))}
                                placeholder={`Write the ${ActiveTabLabel} here...`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
