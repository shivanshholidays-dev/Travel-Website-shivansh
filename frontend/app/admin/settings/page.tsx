'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { settingsApi } from '@lib/api/settings.api';
import { UpdateSettingPayload } from '@lib/types/settings.types';
import { useSettingsStore } from '@store/useSettingsStore';
import { Save, UploadCloud, Link as LinkIcon, Building2, CreditCard, Layout, Info, Briefcase, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@lib/utils/error-handler';
import { getImgUrl } from '@lib/utils/image';

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [qrImageUrl, setQrImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [userIp, setUserIp] = useState('');

    // Helper to render error messages
    const ErrorMsg = ({ name }: { name: string }) => {
        const error = name.split('.').reduce((obj: any, key) => obj?.[key], errors);
        if (!error) return null;
        return <p className="text-danger small mt-1 mb-0" style={{ fontSize: '12px', fontWeight: 600 }}>{error.message || 'Invalid input'}</p>;
    };

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<UpdateSettingPayload>({
        defaultValues: {
            businessDetails: {},
            socialMedia: {},
            paymentDetails: {},
            otherSettings: {},
            heroContent: { heroHighlights: [] },
            heroSliders: [],
            aboutContent: { whyChooseUs: [] },

            careerContent: { benefits: [], jobs: [] },
            faqs: [],
            adminIpWhitelist: []
        }
    });

    const { fields: heroSliderFields, append: appendHeroSlider, remove: removeHeroSlider } = useFieldArray({
        control,
        name: 'heroSliders'
    });

    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({

        control,
        name: 'faqs'
    });

    const { fields: whyChooseUsFields, append: appendWhyChooseUs, remove: removeWhyChooseUs } = useFieldArray({
        control,
        name: 'aboutContent.whyChooseUs'
    });

    const { fields: jobFields, append: appendJob, remove: removeJob } = useFieldArray({
        control,
        name: 'careerContent.jobs'
    });

    const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
        control,
        // @ts-ignore - react-hook-form typing issue with straight arrays of strings
        name: 'careerContent.benefits' as any
    });

    useEffect(() => {
        fetchSettingsData();
        fetchUserIp();
    }, []);

    const fetchUserIp = async () => {
        try
        {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            setUserIp(data.ip);
        } catch (error)
        {
            console.error('Failed to fetch user IP:', error);
        }
    };

    const fetchSettingsData = async () => {
        try
        {
            const data = await settingsApi.getAdminSettings();
            // Strip any legacy fields that are no longer in the schema to prevent validation errors on update
            const {
                gstNumber: _g,
                newsletterEmail: _n,
                companyName: _c,
                websiteUrl: _w,
                cin: _cn,
                tan: _t,
                ...cleanBusinessDetails
            } = (data.businessDetails || {}) as any;
            reset({
                businessDetails: cleanBusinessDetails,
                socialMedia: data.socialMedia || {},
                paymentDetails: data.paymentDetails || {},
                otherSettings: data.otherSettings || {},
                heroContent: data.heroContent || { heroHighlights: [] },
                heroSliders: data.heroSliders || [],
                aboutContent: data.aboutContent || { whyChooseUs: [] },

                careerContent: data.careerContent || { benefits: [], jobs: [] },
                faqs: data.faqs || [],
                adminIpWhitelist: data.adminIpWhitelist || []
            });
            if (data.paymentDetails?.upiQrImageUrl)
            {
                setQrImageUrl(data.paymentDetails.upiQrImageUrl);
            }
        } catch (error)
        {
            toast.error(getErrorMessage(error, 'Failed to load settings'));
        } finally
        {
            setIsLoading(false);
        }
    };

    const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading('Uploading slide image...');
        try
        {
            const res = await settingsApi.uploadHero(formData);
            setValue(`heroSliders.${index}.heroBannerImage`, res.url);
            toast.success('Slide image uploaded!', { id: toastId });
        } catch (error)
        {
            toast.error('Upload failed: ' + getErrorMessage(error), { id: toastId });
        }
    };

    const onSubmit = async (data: UpdateSettingPayload) => {
        setIsSaving(true);
        try
        {
            // Include uploaded QR image URL
            if (qrImageUrl)
            {
                data.paymentDetails = { ...data.paymentDetails, upiQrImageUrl: qrImageUrl };
            }
            const updatedSettings = await settingsApi.updateSettings(data);
            useSettingsStore.getState().setSettings(updatedSettings); // Update global store explicitly
            toast.success('Settings updated successfully');
        } catch (error: any)
        {
            console.error('Update settings error:', error);
            toast.error(getErrorMessage(error, 'Failed to update settings'));
        } finally
        {
            setIsSaving(false);
        }
    };

    const onInvalid = (errors: any) => {
        console.warn('Form validation errors:', errors);
        toast.error('Please fix the highlighted errors before deploying.');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try
        {
            const res = await settingsApi.uploadQr(formData);
            const prefix = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
            setQrImageUrl(prefix + res.url);
            toast.success('QR Code uploaded. Remember to save settings.');
        } catch (error)
        {
            toast.error(getErrorMessage(error, 'Failed to upload image'));
        } finally
        {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    if (isLoading)
    {
        return <div className="p-5 text-center">Loading settings...</div>;
    }

    return (
        <div className="togo-dashboard-booking-sec pt-50 pb-60">
            <div className="container container-1440">
                <div className="d-flex justify-content-between align-items-end mb-40">
                    <div>
                        <h4 className="togo-dashboard-account-title mb-0">Website Settings</h4>
                        <p className="text-muted small mb-0">Manage global business details, social media, and payments.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            onClick={handleSubmit(onSubmit, onInvalid)}
                            disabled={isSaving}
                            className="btn btn-dark d-flex align-items-center gap-2"
                            style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 700 }}
                        >
                            <Save size={18} /> {isSaving ? 'Deploying...' : 'Deploy Changes'}
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <form onSubmit={handleSubmit(onSubmit)}>

                            {/* Business Details */}
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center gap-3 mb-30 pb-20 border-bottom">
                                    <div style={{ padding: '10px', background: '#e8f0fe', color: '#1a73e8', borderRadius: '10px' }}>
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>Business Details</h5>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">UPI ID</label>
                                        <input {...register('businessDetails.upiId', { required: 'UPI ID is required' })} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="businessDetails.upiId" />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">GST Rate (%)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={28}
                                            step={0.01}
                                            {...register('businessDetails.gstRate', {
                                                valueAsNumber: true,
                                                min: { value: 0, message: 'Min GST is 0' },
                                                max: { value: 28, message: 'Max GST is 28' }
                                            })}
                                            className="form-control"
                                            placeholder="e.g. 5"
                                            style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }}
                                        />
                                        <ErrorMsg name="businessDetails.gstRate" />
                                        <small className="text-muted" style={{ fontSize: 12 }}>Enter as percentage (0–28). E.g. 5 = 5% GST applied on bookings.</small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Phone Number</label>
                                        <input {...register('businessDetails.phoneNumber', { required: 'Phone Number is required' })} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="businessDetails.phoneNumber" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Support Email</label>
                                        <input type="email" {...register('businessDetails.supportEmail', {
                                            required: 'Support Email is required',
                                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                                        })} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="businessDetails.supportEmail" />
                                        <small className="text-muted d-block mt-1" style={{ fontSize: 11 }}>Main contact email shown to customers.</small>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Office Address</label>
                                        <textarea {...register('businessDetails.officeAddress', { required: 'Address is required' })} rows={3} className="form-control" style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="businessDetails.officeAddress" />
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center gap-3 mb-30 pb-20 border-bottom">
                                    <div style={{ padding: '10px', background: '#eef2ff', color: '#4f46e5', borderRadius: '10px' }}>
                                        <LinkIcon size={24} />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>Social Media Links</h5>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Facebook</label>
                                        <input {...register('socialMedia.facebook', {
                                            pattern: { value: /^https?:\/\/.+/i, message: 'Must be a valid URL starting with http/https' }
                                        })} className="form-control" placeholder="https://facebook.com/..." style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="socialMedia.facebook" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Instagram</label>
                                        <input {...register('socialMedia.instagram', {
                                            pattern: { value: /^https?:\/\/.+/i, message: 'Must be a valid URL starting with http/https' }
                                        })} className="form-control" placeholder="https://instagram.com/..." style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="socialMedia.instagram" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">LinkedIn</label>
                                        <input {...register('socialMedia.linkedin', {
                                            pattern: { value: /^https?:\/\/.+/i, message: 'Must be a valid URL starting with http/https' }
                                        })} className="form-control" placeholder="https://linkedin.com/in/..." style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="socialMedia.linkedin" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">WhatsApp Link</label>
                                        <input {...register('socialMedia.whatsapp')} className="form-control" placeholder="https://wa.me/..." style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="socialMedia.whatsapp" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment details */}
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center gap-3 mb-30 pb-20 border-bottom">
                                    <div style={{ padding: '10px', background: '#ecfdf5', color: '#10b981', borderRadius: '10px' }}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>Payment Details</h5>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted text-center d-block">UPI QR Image</label>
                                        <div className="d-flex flex-column align-items-center gap-3">
                                            {qrImageUrl && (
                                                <div style={{ width: 150, height: 150, borderRadius: 12, overflow: 'hidden', border: '1px solid #eee', background: '#f8f9fa' }} className="d-flex align-items-center justify-content-center">
                                                    <img src={qrImageUrl} alt="QR" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                </div>
                                            )}
                                            <div>
                                                <input
                                                    type="file"
                                                    id="qr-upload"
                                                    className="d-none"
                                                    accept="image/*"
                                                    onChange={handleFileUpload}
                                                />
                                                <label htmlFor="qr-upload" className="btn btn-primary d-flex align-items-center gap-2" style={{ cursor: 'pointer', borderRadius: '10px', padding: '10px 20px' }}>
                                                    <UploadCloud size={18} /> {isUploading ? 'Uploading...' : 'Upload QR Code'}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Sliders */}
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center justify-content-between mb-30 pb-20 border-bottom">
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{ padding: '10px', background: '#f5f3ff', color: '#7c3aed', borderRadius: '10px' }}>
                                            <Layout size={24} />
                                        </div>
                                        <div>
                                            <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>Homepage Hero Sliders</h5>
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-dark d-flex align-items-center gap-2" style={{ borderRadius: '10px' }} onClick={() => appendHeroSlider({ heroTitle: '', heroSubtitle: '', heroCta: 'Explore Tours', heroCtaUrl: '/tours/grid', heroBannerImage: '', heroHighlights: [] })}>
                                        <Plus size={18} /> Add New Slide
                                    </button>
                                </div>

                                {heroSliderFields.length === 0 && (
                                    <div className="text-center py-5 border rounded bg-light" style={{ borderStyle: 'dashed !important' }}>
                                        <p className="text-muted mb-0">No sliders added yet. Add your first slide to enable the homepage slider.</p>
                                    </div>
                                )}

                                <div className="d-flex flex-column gap-4">
                                    {heroSliderFields.map((field, index) => (
                                        <div key={field.id} className="p-4 border rounded shadow-sm bg-white" style={{ borderLeft: '4px solid #7c3aed' }}>
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h6 className="mb-0 fw-bold">Slide #{index + 1}</h6>
                                                <button type="button" className="btn btn-outline-danger btn-sm px-3" onClick={() => removeHeroSlider(index)}>
                                                    <Trash2 size={16} className="me-1" /> Remove Slide
                                                </button>
                                            </div>
                                            <div className="row g-4">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-uppercase text-muted">Title</label>
                                                    <input {...register(`heroSliders.${index}.heroTitle`)} className="form-control" placeholder="The Adventure Travel Experts" style={{ borderRadius: '10px', padding: '12px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small text-uppercase text-muted">Subtitle</label>
                                                    <input {...register(`heroSliders.${index}.heroSubtitle`)} className="form-control" placeholder="Asia holidays created by specialists" style={{ borderRadius: '10px', padding: '12px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold small text-uppercase text-muted">CTA Text</label>
                                                    <input {...register(`heroSliders.${index}.heroCta`)} className="form-control" style={{ borderRadius: '10px', padding: '12px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold small text-uppercase text-muted">CTA URL</label>
                                                    <input {...register(`heroSliders.${index}.heroCtaUrl`)} className="form-control" style={{ borderRadius: '10px', padding: '12px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold small text-uppercase text-muted">Banner Image</label>
                                                    <div className="d-flex flex-column gap-2">
                                                        <div className="d-flex gap-2">
                                                            <input {...register(`heroSliders.${index}.heroBannerImage`)} className="form-control" placeholder="/assets/img/hero/..." style={{ borderRadius: '10px', padding: '12px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                                            <label className="btn btn-outline-primary d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0 }}>
                                                                <UploadCloud size={20} />
                                                                <input type="file" className="d-none" accept="image/*" onChange={(e) => handleHeroUpload(e, index)} />
                                                            </label>
                                                        </div>
                                                        {field.heroBannerImage && (
                                                            <div className="mt-1" style={{ width: '100%', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #eee' }}>
                                                                <img src={getImgUrl(field.heroBannerImage)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label fw-bold small text-uppercase text-muted">Highlights (Comma Separated)</label>
                                                    <input
                                                        {...register(`heroSliders.${index}.heroHighlights` as any, {
                                                            setValueAs: (v) => { if (Array.isArray(v)) return v; return v ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : [] }
                                                        })}
                                                        className="form-control"
                                                        placeholder="5000+ Happy Travelers, 200+ Tours"
                                                        style={{ borderRadius: '10px', padding: '12px', background: '#f8f9fa', border: '1px solid #eee' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* Other Options */}
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center gap-3 mb-30 pb-20 border-bottom">
                                    <div style={{ padding: '10px', background: '#fdf2f8', color: '#db2777', borderRadius: '10px' }}>
                                        <Layout size={24} />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>General Global Data</h5>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Footer Description</label>
                                        <textarea {...register('otherSettings.footerDescription', { required: 'Footer description is required' })} rows={3} className="form-control" style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee', height: "125px" }} />
                                        <ErrorMsg name="otherSettings.footerDescription" />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-uppercase text-muted">SEO Title</label>
                                        <input {...register('otherSettings.seoMetaTitle', { required: 'SEO Title is required' })} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="otherSettings.seoMetaTitle" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-uppercase text-muted">SEO Description</label>
                                        <input {...register('otherSettings.seoMetaDescription', { required: 'SEO Description is required' })} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="otherSettings.seoMetaDescription" />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small text-uppercase text-muted">WhatsApp No. (Notifications)</label>
                                        <input {...register('otherSettings.whatsappNumberForNotifications', {
                                            required: 'Notification number is required',
                                            pattern: { value: /^\d{10,15}$/, message: 'Invalid phone number format' }
                                        })} className="form-control" placeholder="e.g. 919876543210" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="otherSettings.whatsappNumberForNotifications" />
                                    </div>

                                    {/* WhatsApp Cloud API Settings */}
                                    <div className="col-12 mt-4 pt-4 border-top">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <label className="form-label fw-bold small text-uppercase text-muted mb-0">WhatsApp Cloud API (Meta)</label>
                                            <div className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1" style={{ fontSize: '10px' }}>Integration</div>
                                        </div>
                                        <div className="row g-3 bg-light p-3 rounded border">
                                            <div className="col-12 mb-2">
                                                <div className="form-check form-switch">
                                                    <input {...register('otherSettings.whatsappEnabled')} className="form-check-input" type="checkbox" id="whatsappEnabled" style={{ width: '40px', height: '20px' }} />
                                                    <label className="form-check-label fw-bold ms-2 mt-1" htmlFor="whatsappEnabled">Enable WhatsApp Notifications</label>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-uppercase text-muted">Phone Number ID</label>
                                                <input {...register('otherSettings.whatsappPhoneNumberId')} className="form-control" placeholder="Meta Phone Number ID" style={{ borderRadius: '12px', padding: '14px', background: '#fff', border: '1px solid #ddd' }} />
                                                <ErrorMsg name="otherSettings.whatsappPhoneNumberId" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-uppercase text-muted">Access Token</label>
                                                <input type="password" {...register('otherSettings.whatsappAccessToken')} className="form-control" placeholder="Permanent Access Token" style={{ borderRadius: '12px', padding: '14px', background: '#fff', border: '1px solid #ddd' }} />
                                                <ErrorMsg name="otherSettings.whatsappAccessToken" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 mt-4 pt-3 border-top">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <label className="form-label fw-bold small text-uppercase text-muted mb-0">Admin IP Whitelist (IP Restriction)</label>
                                            <div className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1" style={{ fontSize: '10px' }}>Security</div>
                                        </div>
                                        <textarea
                                            rows={3}
                                            {...register('adminIpWhitelist', {
                                                setValueAs: (v) => {
                                                    if (Array.isArray(v)) return v;
                                                    return v ? v.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean) : []
                                                }
                                            })}
                                            className="form-control"
                                            placeholder="192.168.1.1&#10;10.0.0.1&#10;(One IP per line or comma separated)"
                                            style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }}
                                        />
                                        <div className="mt-2 p-3 rounded" style={{ background: '#fff4f4', border: '1px solid #ffdada' }}>
                                            <p className="text-danger small mb-0" style={{ fontWeight: 600 }}>
                                                <b>CRITICAL WARNING:</b> Incorrect IP will lock you out of the admin panel.
                                                Ensure your current IP is included if you enable this.
                                            </p>
                                            <p className="text-dark small mb-0 mt-1">
                                                Your detected current IP: <span className="badge bg-dark px-2">{userIp || 'Detecting...'}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Us Page Content */}
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center justify-content-between mb-30 pb-20 border-bottom">
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{ padding: '10px', background: '#fffbeb', color: '#d97706', borderRadius: '10px' }}>
                                            <Info size={24} />
                                        </div>
                                        <div>
                                            <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>About Us Page</h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Hero Title</label>
                                        <input {...register('aboutContent.heroTitle', { required: 'Title is required' })} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="aboutContent.heroTitle" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Hero Subtitle</label>
                                        <input {...register('aboutContent.heroSubtitle')} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Mission Statement / Story</label>
                                        <textarea {...register('aboutContent.missionStatement', { required: 'Mission statement is required' })} rows={4} className="form-control" style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="aboutContent.missionStatement" />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted mb-3 d-flex justify-content-between">
                                            Why Choose Us Items
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => appendWhyChooseUs({ title: '', description: '', icon: '' })}>
                                                <Plus size={14} className="me-1" /> Add Item
                                            </button>
                                        </label>
                                        {whyChooseUsFields.map((field, index) => (
                                            <div key={field.id} className="row g-2 mb-3 align-items-center p-3 border rounded">
                                                <div className="col-md-3">
                                                    <input {...register(`aboutContent.whyChooseUs.${index}.title`)} placeholder="Title" className="form-control" />
                                                </div>
                                                <div className="col-md-5">
                                                    <input {...register(`aboutContent.whyChooseUs.${index}.description`)} placeholder="Description" className="form-control" />
                                                </div>
                                                <div className="col-md-3">
                                                    <input {...register(`aboutContent.whyChooseUs.${index}.icon`)} placeholder="Icon class or URL" className="form-control" />
                                                </div>
                                                <div className="col-md-1 text-end">
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeWhyChooseUs(index)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Careers Page Content */}
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center gap-3 mb-30 pb-20 border-bottom">
                                    <div style={{ padding: '10px', background: '#eff6ff', color: '#3b82f6', borderRadius: '10px' }}>
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>Careers Page</h5>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Hero Title</label>
                                        <input {...register('careerContent.heroTitle', { required: 'Title is required' })} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="careerContent.heroTitle" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Hero Subtitle</label>
                                        <input {...register('careerContent.heroSubtitle')} className="form-control" style={{ borderRadius: '12px', padding: '14px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Company Culture Description</label>
                                        <textarea {...register('careerContent.cultureDescription', { required: 'Culture description is required' })} rows={4} className="form-control" style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                        <ErrorMsg name="careerContent.cultureDescription" />
                                    </div>

                                    {/* Benefits */}
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted mb-3 d-flex justify-content-between">
                                            Benefits (Perks)
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => appendBenefit('')}>
                                                <Plus size={14} className="me-1" /> Add Benefit
                                            </button>
                                        </label>
                                        <div className="row g-3">
                                            {benefitFields.map((field, index) => (
                                                <div key={field.id} className="col-md-6">
                                                    <div className="d-flex gap-2">
                                                        <input {...register(`careerContent.benefits.${index}` as any)} placeholder="e.g. Health Insurance" className="form-control" />
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeBenefit(index)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Job Listings */}
                                    <div className="col-12 mt-4">
                                        <label className="form-label fw-bold small text-uppercase text-muted mb-3 d-flex justify-content-between">
                                            Open Job Positions
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => appendJob({ title: '', location: '', type: '', description: '', applyUrl: '' })}>
                                                <Plus size={14} className="me-1" /> Add Job
                                            </button>
                                        </label>
                                        {jobFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border rounded mb-3 bg-light">
                                                <div className="d-flex justify-content-between mb-3">
                                                    <h6 className="mb-0">Job Request #{index + 1}</h6>
                                                    <button type="button" className="btn btn-sm btn-danger px-3 py-1" onClick={() => removeJob(index)}>
                                                        Remove
                                                    </button>
                                                </div>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <input {...register(`careerContent.jobs.${index}.title`, { required: 'Job Title is required' })} placeholder="Job Title (e.g. Tour Guide)" className="form-control" />
                                                        <ErrorMsg name={`careerContent.jobs.${index}.title`} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <input {...register(`careerContent.jobs.${index}.location`, { required: 'Location is required' })} placeholder="Location (e.g. Remote, Delhi)" className="form-control" />
                                                        <ErrorMsg name={`careerContent.jobs.${index}.location`} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <select {...register(`careerContent.jobs.${index}.type`, { required: 'Job Type is required' })} className="form-select">
                                                            <option value="">Job Type...</option>
                                                            <option value="Full Time">Full Time</option>
                                                            <option value="Part Time">Part Time</option>
                                                            <option value="Contract">Contract</option>
                                                        </select>
                                                        <ErrorMsg name={`careerContent.jobs.${index}.type`} />
                                                    </div>
                                                    <div className="col-12">
                                                        <textarea {...register(`careerContent.jobs.${index}.description`)} placeholder="Short Description" rows={2} className="form-control" />
                                                    </div>
                                                    <div className="col-12">
                                                        <input {...register(`careerContent.jobs.${index}.applyUrl`)} placeholder="Application Link (e.g. forms.gle/... or mailto:...)" className="form-control" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* FAQs */}
                            <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center gap-3 mb-30 pb-20 border-bottom">
                                    <div style={{ padding: '10px', background: '#f0fdf4', color: '#16a34a', borderRadius: '10px' }}>
                                        <HelpCircle size={24} />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>Global FAQs (Contact Us Page)</h5>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted mb-3 d-flex justify-content-between">
                                            Frequently Asked Questions
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => appendFaq({ question: '', answer: '' })}>
                                                <Plus size={14} className="me-1" /> Add FAQ
                                            </button>
                                        </label>
                                        {faqFields.map((field, index) => (
                                            <div key={field.id} className="row g-3 mb-3 align-items-start p-3 border rounded">
                                                <div className="col-md-11">
                                                    <input {...register(`faqs.${index}.question`, { required: 'Question is required' })} placeholder="Question" className="form-control mb-2 fw-bold" />
                                                    <ErrorMsg name={`faqs.${index}.question`} />
                                                    <textarea {...register(`faqs.${index}.answer`, { required: 'Answer is required' })} placeholder="Answer" rows={2} className="form-control" />
                                                    <ErrorMsg name={`faqs.${index}.answer`} />
                                                </div>
                                                <div className="col-md-1 text-end">
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeFaq(index)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Policies & Legal */}
                            {/* <div style={{ background: '#fff', borderRadius: '20px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f3f9', marginBottom: '30px' }}>
                                <div className="d-flex align-items-center gap-3 mb-30 pb-20 border-bottom">
                                    <div style={{ padding: '10px', background: '#fef2f2', color: '#dc2626', borderRadius: '10px' }}>
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, fontSize: '18px' }}>Policies & Legal (HTML Supported)</h5>
                                    </div>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Privacy Policy</label>
                                        <textarea {...register('policies.privacyPolicy')} rows={6} className="form-control" placeholder="HTML content allowed..." style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Terms & Conditions</label>
                                        <textarea {...register('policies.termsAndConditions')} rows={6} className="form-control" placeholder="HTML content allowed..." style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Refund Policy</label>
                                        <textarea {...register('policies.refundPolicy')} rows={6} className="form-control" placeholder="HTML content allowed..." style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Cancellation Policy</label>
                                        <textarea {...register('policies.cancellationPolicy')} rows={6} className="form-control" placeholder="HTML content allowed..." style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-uppercase text-muted">Booking Instructions (Shown on Booking Page)</label>
                                        <textarea {...register('policies.bookingInstructions')} rows={4} className="form-control" placeholder="Instructions/Steps for booking..." style={{ borderRadius: '12px', padding: '15px', background: '#f8f9fa', border: '1px solid #eee' }} />
                                    </div>
                                </div>
                            </div> */}

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
