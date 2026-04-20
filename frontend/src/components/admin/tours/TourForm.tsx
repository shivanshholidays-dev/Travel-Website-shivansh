'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TourCategory, PickupType } from '@lib/constants/enums';
import { getPickupTypeLabel } from '@lib/utils/enum-mappings';
import {
    ChevronRight, ChevronLeft, Save, Plus, Trash2,
    Image as ImageIcon, LayoutGrid, Calendar, HelpCircle,
    Check, X, Globe2, Star, CheckCircle, XCircle,
    Eye, Bookmark, ArrowRight, Minus
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { getImgUrl } from '@/src/lib/utils/image';
import Modal from '@/src/components/ui/Modal';

// ─── Schema ──────────────────────────────────────────────────────────────────

const tourSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    basePrice: z.number().min(0, 'Base price must be positive'),
    minAge: z.number().min(0).optional(),
    maxAge: z.number().min(0).optional(),
    category: z.nativeEnum(TourCategory),
    location: z.string().min(1, 'Location is required'),
    state: z.string().optional(),
    country: z.string().optional(),
    duration: z.string().optional(),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    highlights: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
    faqs: z.array(z.object({
        question: z.string().min(1, 'Question is required'),
        answer: z.string().min(1, 'Answer is required'),
    })).optional(),
    itinerary: z.array(z.object({
        dayNumber: z.number().optional(),
        title: z.string().min(1, 'Day title is required'),
        points: z.array(z.object({
            text: z.string().min(1, 'Activity heading is required'),
            description: z.string().optional(),
        })),
    })).optional(),
    departureOptions: z.array(z.object({
        fromCity: z.string().min(1, 'Route Start is required'),
        toCity: z.string().optional(),
        type: z.nativeEnum(PickupType),
        departureTimeAndPlace: z.string().optional(),
        totalDays: z.number().min(1, 'Days must be at least 1'),
        totalNights: z.number().min(0),
        priceAdjustment: z.number().optional(),
    })).optional(),
    brochureUrl: z.string().optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ArrayFieldListProps {
    value: string[];
    onChange: (v: string[]) => void;
    placeholder: string;
    accent: string;
    bg: string;
    rowIcon: React.ReactNode;
    emptyText: string;
}

function ArrayFieldList({ value, onChange, placeholder, accent, bg, rowIcon, emptyText }: ArrayFieldListProps) {
    const [draft, setDraft] = useState('');
    const items = value || [];

    const commit = () => {
        if (!draft.trim()) return;
        onChange([...items, draft.trim()]);
        setDraft('');
    };

    return (
        <div style={{ border: `1.5px solid ${accent}25`, borderRadius: 12, overflow: 'hidden' }}>
            {/* List */}
            <div style={{ background: bg, minHeight: 120, maxHeight: 240, overflowY: 'auto', padding: '10px 10px 6px' }}>
                {items.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 100 }}>
                        <p style={{ color: '#c4c9d4', fontSize: 12, textAlign: 'center', margin: 0, fontStyle: 'italic' }}>{emptyText}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {items.map((item, i) => (
                            <div key={i} className="array-item-row"
                                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #edf0f4', borderRadius: 8, padding: '8px 10px', transition: 'all 0.15s' }}>
                                <span style={{ color: accent, flexShrink: 0, display: 'flex', marginTop: 1 }}>{rowIcon}</span>
                                <span style={{ flex: 1, fontSize: 13, color: '#1f2937', lineHeight: 1.5, fontWeight: 500 }}>{item}</span>
                                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
                                    className="array-item-delete"
                                    title="Remove"
                                    style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: '2px 4px', display: 'flex', flexShrink: 0, borderRadius: 5, transition: 'color 0.15s', lineHeight: 1 }}>
                                    <X size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Input row */}
            <div style={{ borderTop: `1px solid ${accent}15`, background: '#fff', padding: '9px 10px', display: 'flex', gap: 7 }}>
                <input
                    className="array-draft-input"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
                    placeholder={placeholder}
                    style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '7px 11px', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#111827', background: '#fafafa', transition: 'border-color 0.15s' }}
                />
                <button type="button" onClick={commit}
                    style={{ background: accent, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <Plus size={13} /> Add
                </button>
            </div>
        </div>
    );
}

// ─── Props / Steps ────────────────────────────────────────────────────────────

interface TourFormProps {
    initialData?: any;
    onSubmit: (data: FormData) => Promise<void>;
    isSubmitting: boolean;
    mode: 'create' | 'edit';
    onDeleteImage?: (imageUrl: string) => Promise<void>;
}

const STEPS = [
    { id: 'basic', title: 'Basic Info', icon: LayoutGrid },
    { id: 'features', title: 'Details & Media', icon: ImageIcon },
    { id: 'itinerary', title: 'Itinerary', icon: Calendar },
    { id: 'options', title: 'Options & FAQs', icon: HelpCircle },
];

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function TourForm({ initialData, onSubmit, isSubmitting, mode, onDeleteImage }: TourFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [images, setImages] = useState<File[]>([]);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [brochure, setBrochure] = useState<File | null>(null);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [existingThumbnail, setExistingThumbnail] = useState('');
    const [existingBrochure, setExistingBrochure] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);
    const [imgToDelete, setImgToDelete] = useState<{ url?: string; index?: number; isExisting: boolean } | null>(null);

    const { register, control, handleSubmit, reset, watch, setValue, trigger, formState: { errors } } = useForm<TourFormValues>({
        resolver: zodResolver(tourSchema),
        defaultValues: {
            title: '', description: '', basePrice: 0, minAge: 0, maxAge: 99,
            category: TourCategory.ADVENTURE, location: '', state: '', country: 'India',
            duration: '', isActive: false, isFeatured: false,
            highlights: [], inclusions: [], exclusions: [],
            faqs: [],
            itinerary: [{ dayNumber: 1, title: '', points: [{ text: '', description: '' }] }],
            departureOptions: [],
        },
    });

    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control, name: 'faqs' });
    const { fields: depFields, append: appendDep, remove: removeDep } = useFieldArray({ control, name: 'departureOptions' });
    const { fields: itFields, append: appendIt, remove: removeIt } = useFieldArray({ control, name: 'itinerary' });

    const isEnumVal = (v: any, e: any) => Object.values(e).includes(v);

    // Auto-calculate totalNights = totalDays - 1
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (name?.startsWith('departureOptions.') && name.endsWith('.totalDays'))
            {
                const match = name.match(/departureOptions\.(\d+)\.totalDays/);
                if (match)
                {
                    const idx = parseInt(match[1], 10);
                    const days = value.departureOptions?.[idx]?.totalDays;
                    if (typeof days === 'number' && days > 0)
                    {
                        setValue(`departureOptions.${idx}.totalNights`, days - 1, { shouldValidate: true });
                    }
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    useEffect(() => {
        if (!initialData) return;
        const safeCategory = isEnumVal(initialData.category?.toUpperCase(), TourCategory)
            ? (initialData.category.toUpperCase() as TourCategory) : TourCategory.ADVENTURE;

        reset({
            title: initialData.title || '',
            description: initialData.description || '',
            basePrice: initialData.basePrice || 0,
            minAge: initialData.minAge || 0,
            maxAge: initialData.maxAge || 99,
            category: safeCategory,
            location: typeof initialData.location === 'string' ? initialData.location : initialData.location?.city || '',
            state: initialData.state || '',
            country: initialData.country || 'India',
            duration: initialData.duration || '',
            isActive: initialData.isActive ?? false,
            isFeatured: initialData.isFeatured ?? false,
            highlights: initialData.highlights || [],
            inclusions: initialData.inclusions || [],
            exclusions: initialData.exclusions || [],
            faqs: initialData.faqs || [],
            itinerary: initialData.itinerary?.map((day: any) => ({
                dayNumber: day.dayNumber,
                title: day.title,
                points: day.points?.map((p: any) => ({
                    text: typeof p === 'string' ? p : p.text,
                    description: p.description || '',
                })) || [],
            })) || [],
            departureOptions: initialData.departureOptions?.map((op: any) => ({
                ...op,
                type: isEnumVal(op.type?.toUpperCase(), PickupType) ? op.type.toUpperCase() as PickupType : PickupType.NON_AC_TRAIN,
                totalDays: op.totalDays || 1,
                totalNights: op.totalNights || 0,
                priceAdjustment: op.priceAdjustment || 0,
            })) || [],
        });
        setExistingImages(initialData.images || []);
        setExistingThumbnail(initialData.thumbnailImage || '');
        setExistingBrochure(initialData.brochureUrl || '');
    }, [initialData, reset]);

    const onFormError = (errs: any) => {
        console.error('Form Validation Errors:', errs);
        const keys = Object.keys(errs);
        let hint = '';
        if (keys.some(f => ['title', 'category', 'basePrice', 'location'].includes(f))) hint = " — check Basic Info";
        else if (keys.some(f => ['itinerary'].includes(f))) hint = " — check Itinerary";
        else if (keys.some(f => ['departureOptions', 'faqs'].includes(f))) hint = " — check Options & FAQs";
        toast.error(`Fix validation errors${hint}`, { id: 'v-err' });
    };

    const handleNextStep = async () => {
        if (isNavigating) return;
        setIsNavigating(true);
        try
        {
            const fieldMap: Record<number, any[]> = {
                0: ['title', 'basePrice', 'location', 'category'],
                1: [],
                2: ['itinerary'],
            };
            const isValid = await trigger(fieldMap[currentStep] || []);
            if (isValid)
            {
                setCurrentStep(p => Math.min(p + 1, STEPS.length - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => setIsNavigating(false), 500);
            } else
            {
                toast.error('Fix errors before continuing', { id: 'nav-err' });
                setIsNavigating(false);
            }
        } catch { setIsNavigating(false); }
    };

    const handleFormSubmit: SubmitHandler<TourFormValues> = async (data) => {
        const fd = new FormData();

        // Scalar fields
        Object.entries(data).forEach(([key, val]) => {
            if (['highlights', 'inclusions', 'exclusions', 'faqs', 'itinerary', 'departureOptions', 'isActive', 'isFeatured'].includes(key)) return;
            if (val !== undefined && val !== null) fd.append(key, val.toString());
        });

        fd.append('isActive', data.isActive ? 'true' : 'false');
        fd.append('isFeatured', data.isFeatured ? 'true' : 'false');

        // Arrays
        fd.append('highlights', JSON.stringify((data.highlights || []).filter(s => s.trim())));
        fd.append('inclusions', JSON.stringify((data.inclusions || []).filter(s => s.trim())));
        fd.append('exclusions', JSON.stringify((data.exclusions || []).filter(s => s.trim())));

        const cleanedFaqs = (data.faqs || []).filter(f => f.question?.trim() && f.answer?.trim());
        fd.append('faqs', JSON.stringify(cleanedFaqs));

        const cleanedDep = (data.departureOptions || []).map(op => ({
            ...op,
            fromCity: op.fromCity?.trim() || '',
            toCity: op.toCity?.trim() || '',
            departureTimeAndPlace: op.departureTimeAndPlace?.trim() || '',
        }));
        fd.append('departureOptions', JSON.stringify(cleanedDep));

        const cleanedIt = (data.itinerary || [])
            .filter(day => day.title?.trim())
            .map((day, idx) => ({
                title: day.title.trim(),
                dayNumber: idx + 1,
                points: (day.points || [])
                    .filter(p => p.text?.trim())
                    .map(p => ({
                        text: p.text.trim(),
                        description: p.description?.trim() || '',
                    })),
            }))
            .filter(day => day.points.length > 0);
        fd.append('itinerary', JSON.stringify(cleanedIt));

        if (mode === 'edit') fd.append('images', JSON.stringify(existingImages));
        if (thumbnail) fd.append('thumbnailImage', thumbnail);
        if (brochure) fd.append('brochure', brochure);
        if (images.length > 0) images.forEach(img => fd.append('images', img));

        await onSubmit(fd);
    };

    const { getRootProps: thumbRoot, getInputProps: thumbInput } = useDropzone({
        accept: { 'image/*': [] }, multiple: false,
        onDrop: files => setThumbnail(files[0]),
    });
    const { getRootProps: galleryRoot, getInputProps: galleryInput } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: files => setImages(p => [...p, ...files]),
    });
    const { getRootProps: brochureRoot, getInputProps: brochureInput } = useDropzone({
        accept: { 'application/pdf': [] }, multiple: false,
        onDrop: files => setBrochure(files[0]),
    });

    // ─── Itinerary helpers ────────────────────────────────────────────────────

    const addPoint = (dayIdx: number) => {
        const pts = watch(`itinerary.${dayIdx}.points`) || [];
        setValue(`itinerary.${dayIdx}.points`, [...pts, { text: '', description: '' }]);
    };
    const removePoint = (dayIdx: number, pIdx: number) => {
        const pts = watch(`itinerary.${dayIdx}.points`) || [];
        if (pts.length <= 1) return;
        setValue(`itinerary.${dayIdx}.points`, pts.filter((_, i) => i !== pIdx));
    };

    // ─── Shared styles ────────────────────────────────────────────────────────

    const card: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: 24, marginBottom: 20 };
    const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 };
    // color: real typed value — dark. Placeholder handled via global CSS below (light grey)
    const inputStyle: React.CSSProperties = { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s', color: '#111827', background: '#fff' };
    const errText: React.CSSProperties = { color: '#ef4444', fontSize: 12, fontWeight: 600, marginTop: 4 };

    return (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            {/* Global placeholder fix — inputs show real value dark, placeholder light */}
            <style>{`
                .tour-form-wrap input::placeholder,
                .tour-form-wrap textarea::placeholder,
                .tour-form-wrap .array-draft-input::placeholder {
                    color: #b0b7c3 !important;
                    font-weight: 400 !important;
                    opacity: 1;
                }
                .tour-form-wrap input:not(:placeholder-shown),
                .tour-form-wrap textarea:not(:placeholder-shown) {
                    color: #111827;
                    font-weight: 500;
                }
                .tour-form-wrap select {
                    color: #111827;
                }
                .tour-form-wrap input[type="number"] {
                    color: #111827;
                }
                .tour-form-wrap .array-item-row:hover {
                    border-color: #e5e7eb !important;
                    background: #fafafa !important;
                }
                .tour-form-wrap .array-item-row:hover .array-item-delete {
                    color: #ef4444 !important;
                }
                .tour-form-wrap .subpoint-input::placeholder {
                    color: #b0b7c3 !important;
                    font-weight: 400 !important;
                }
            `}</style>

            {/* ── Step Progress ─────────────────────────────────────────────── */}
            <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '28px 40px' }}>
                <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                    {/* Track bg */}
                    <div style={{ position: 'absolute', height: 2, background: '#e5e7eb', top: 20, left: 40, right: 40, zIndex: 0 }} />
                    {/* Track fill */}
                    <div style={{ position: 'absolute', height: 2, background: '#1a56db', top: 20, left: 40, width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 40px)`, transition: 'all 0.5s ease', zIndex: 0 }} />
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const active = currentStep === idx;
                        const done = currentStep > idx;
                        return (
                            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: 90 }}>
                                <button type="button" onClick={() => idx <= currentStep && setCurrentStep(idx)}
                                    style={{
                                        width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: idx <= currentStep ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', padding: 0,
                                        background: active ? '#1a56db' : done ? '#059669' : '#fff',
                                        color: active || done ? '#fff' : '#9ca3af',
                                        boxShadow: active ? '0 0 0 5px rgba(26,86,219,0.15)' : done ? '0 0 0 4px rgba(5,150,105,0.12)' : '0 0 0 2px #e5e7eb',
                                    }}>
                                    {done ? <Check size={18} strokeWidth={3} /> : <Icon size={17} />}
                                </button>
                                <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? '#111827' : '#6b7280', marginTop: 10, whiteSpace: 'nowrap' }}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Form Body ─────────────────────────────────────────────────── */}
            <div className="tour-form-wrap" style={{ padding: '32px 40px' }}>
                <form onSubmit={handleSubmit(handleFormSubmit, onFormError)} onKeyDown={e => { if (e.key === 'Enter' && (e.target as any).tagName !== 'TEXTAREA') e.preventDefault(); }}>

                    {/* ════════════════════════════════════════════════════════
                        STEP 1 — Basic Info
                    ════════════════════════════════════════════════════════ */}
                    {currentStep === 0 && (
                        <div>
                            <h5 style={{ fontWeight: 800, fontSize: 20, color: '#111827', marginBottom: 28 }}>Basic Tour Details</h5>

                            {/* Title */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ ...sectionLabel }}>Tour Title *</label>
                                <input {...register('title')} style={{ ...inputStyle, fontSize: 16, fontWeight: 600, padding: '13px 16px' }} placeholder="Enter package name" />
                                {errors.title && <p style={errText}>{errors.title.message}</p>}
                            </div>

                            {/* Category + Price */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
                                <div>
                                    <label style={sectionLabel}>Adventure Category</label>
                                    <select {...register('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {Object.values(TourCategory).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={sectionLabel}>Base Price (INR) *</label>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRight: 'none', borderRadius: '9px 0 0 9px', padding: '10px 14px', fontWeight: 700, fontSize: 15, color: '#374151' }}>₹</span>
                                        <input type="number" {...register('basePrice', { valueAsNumber: true })} style={{ ...inputStyle, borderRadius: '0 9px 9px 0' }} />
                                    </div>
                                    {errors.basePrice && <p style={errText}>{errors.basePrice.message}</p>}
                                </div>
                            </div>

                            {/* Location + Duration */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
                                <div>
                                    <label style={sectionLabel}>Starting Point / Location *</label>
                                    <input {...register('location')} style={inputStyle} placeholder="e.g. Manali, HP" />
                                    {errors.location && <p style={errText}>{errors.location.message}</p>}
                                </div>
                                <div>
                                    <label style={sectionLabel}>Total Duration</label>
                                    <input {...register('duration')} style={inputStyle} placeholder="e.g. 5 Days / 4 Nights" />
                                </div>
                            </div>

                            {/* Age + State + Country */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18, marginBottom: 20 }}>
                                <div>
                                    <label style={sectionLabel}>Min Age</label>
                                    <input type="number" {...register('minAge', { valueAsNumber: true })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={sectionLabel}>Max Age</label>
                                    <input type="number" {...register('maxAge', { valueAsNumber: true })} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={sectionLabel}>State</label>
                                    <input {...register('state')} style={inputStyle} placeholder="e.g. Rajasthan" />
                                </div>
                                <div>
                                    <label style={sectionLabel}>Country</label>
                                    <input {...register('country')} style={inputStyle} />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label style={sectionLabel}>Program Summary</label>
                                <textarea {...register('description')} rows={5}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, padding: '13px 16px', minHeight: 140 }}
                                    placeholder="Provide a comprehensive overview of the tour experience..." />
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════
                        STEP 2 — Details & Media
                    ════════════════════════════════════════════════════════ */}
                    {currentStep === 1 && (
                        <div>
                            <h5 style={{ fontWeight: 800, fontSize: 20, color: '#111827', marginBottom: 28 }}>Program Features & Gallery</h5>

                            {/* Three-column array inputs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 36 }}>
                                {/* Highlights */}
                                <div>
                                    <div style={{ ...sectionLabel, color: '#b45309' }}>
                                        <Star size={13} /> Highlights
                                    </div>
                                    <Controller
                                        name="highlights"
                                        control={control}
                                        render={({ field }) => (
                                            <ArrayFieldList
                                                value={field.value || []}
                                                onChange={field.onChange}
                                                placeholder="Add a highlight..."
                                                accent="#d97706"
                                                bg="#fffbeb"
                                                rowIcon={<Star size={12} />}
                                                emptyText="No highlights added"
                                            />
                                        )}
                                    />
                                </div>

                                {/* Inclusions */}
                                <div>
                                    <div style={{ ...sectionLabel, color: '#047857' }}>
                                        <CheckCircle size={13} /> Inclusions
                                    </div>
                                    <Controller
                                        name="inclusions"
                                        control={control}
                                        render={({ field }) => (
                                            <ArrayFieldList
                                                value={field.value || []}
                                                onChange={field.onChange}
                                                placeholder="Add an inclusion..."
                                                accent="#059669"
                                                bg="#f0fdf4"
                                                rowIcon={<Check size={12} />}
                                                emptyText="No inclusions added"
                                            />
                                        )}
                                    />
                                </div>

                                {/* Exclusions */}
                                <div>
                                    <div style={{ ...sectionLabel, color: '#b91c1c' }}>
                                        <XCircle size={13} /> Exclusions
                                    </div>
                                    <Controller
                                        name="exclusions"
                                        control={control}
                                        render={({ field }) => (
                                            <ArrayFieldList
                                                value={field.value || []}
                                                onChange={field.onChange}
                                                placeholder="Add an exclusion..."
                                                accent="#dc2626"
                                                bg="#fff5f5"
                                                rowIcon={<X size={12} />}
                                                emptyText="No exclusions added"
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Media */}
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 28 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 28 }}>
                                    {/* Thumbnail */}
                                    <div>
                                        <div style={sectionLabel}>Main Thumbnail
                                            <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 11, color: '#9ca3af' }}>800×600px recommended</span>
                                        </div>
                                        <div {...thumbRoot()} style={{ height: 230, borderRadius: 14, border: '2px dashed #cbd5e1', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <input {...thumbInput()} />
                                            {thumbnail ? (
                                                <img src={URL.createObjectURL(thumbnail)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                                            ) : existingThumbnail ? (
                                                <img src={getImgUrl(existingThumbnail)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: 24 }}>
                                                    <div style={{ background: '#f1f5f9', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                        <ImageIcon size={26} color="#94a3b8" />
                                                    </div>
                                                    <p style={{ margin: 0, fontWeight: 700, color: '#374151', fontSize: 14 }}>Click to upload</p>
                                                    <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>or drag and drop</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gallery */}
                                    <div>
                                        <div style={sectionLabel}>Gallery Photos</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                                            {/* Upload button */}
                                            <div {...galleryRoot()} style={{ height: 110, borderRadius: 12, border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                                                <input {...galleryInput()} />
                                                <Plus size={24} color="#94a3b8" />
                                            </div>
                                            {/* Existing images */}
                                            {existingImages.map((url, idx) => (
                                                <div key={`ex-${idx}`} style={{ position: 'relative', height: 110, borderRadius: 12, overflow: 'hidden' }}>
                                                    <img src={getImgUrl(url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="gallery" />
                                                    <button type="button" onClick={() => setImgToDelete({ url, index: idx, isExisting: true })}
                                                        className="array-item-delete"
                                                        style={{ position: 'absolute', top: 5, right: 5, background: '#ef4444', color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            ))}
                                            {/* New images */}
                                            {images.map((file, idx) => (
                                                <div key={`new-${idx}`} style={{ position: 'relative', height: 110, borderRadius: 12, overflow: 'hidden', border: '2px solid #1a56db' }}>
                                                    <img src={URL.createObjectURL(file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="new" />
                                                    <button type="button" onClick={() => setImgToDelete({ index: idx, isExisting: false })}
                                                        className="array-item-delete"
                                                        style={{ position: 'absolute', top: 5, right: 5, background: '#111', color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Brochure Upload */}
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 28, marginTop: 28 }}>
                                <div style={sectionLabel}>Tour Brochure (PDF)
                                    <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 11, color: '#9ca3af' }}>Max 5MB recommended</span>
                                </div>
                                <div {...brochureRoot()} style={{ height: 120, borderRadius: 14, border: '2px dashed #cbd5e1', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <input {...brochureInput()} />
                                    {brochure ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ background: '#ecfdf5', color: '#059669', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <CheckCircle size={18} /> {brochure.name}
                                            </div>
                                            <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: 12 }}>Click to change</p>
                                        </div>
                                    ) : existingBrochure ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ background: '#eff6ff', color: '#1a56db', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Eye size={18} /> Existing Brochure Linked
                                            </div>
                                            <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: 12 }}>Click to replace with new PDF</p>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ background: '#f1f5f9', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                                <HelpCircle size={22} color="#94a3b8" />
                                            </div>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#374151', fontSize: 14 }}>Upload PDF Brochure</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════
                        STEP 3 — Itinerary
                    ════════════════════════════════════════════════════════ */}
                    {currentStep === 2 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <h5 style={{ fontWeight: 800, fontSize: 20, color: '#111827', margin: 0 }}>Expedition Roadmap</h5>
                                    <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Build day-by-day itinerary with activities and sub-points</p>
                                </div>
                                <button type="button" onClick={() => appendIt({ dayNumber: itFields.length + 1, title: '', points: [{ text: '', description: '' }] })}
                                    style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Plus size={15} /> Add Day
                                </button>
                            </div>

                            {/* Timeline */}
                            <div style={{ position: 'relative' }}>
                                {/* Vertical line */}
                                {itFields.length > 1 && (
                                    <div style={{ position: 'absolute', left: 19, top: 40, bottom: 40, width: 2, background: 'linear-gradient(to bottom, #1a56db, #7c3aed)', borderRadius: 2, zIndex: 0 }} />
                                )}

                                {itFields.map((field, dayIdx) => (
                                    <div key={field.id} style={{ display: 'flex', gap: 16, marginBottom: 20, position: 'relative', zIndex: 1 }}>
                                        {/* Day badge */}
                                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1a56db, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, boxShadow: '0 2px 8px rgba(26,86,219,0.3)', flexShrink: 0 }}>
                                                {dayIdx + 1}
                                            </div>
                                        </div>

                                        {/* Day card */}
                                        <div style={{ flex: 1, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                                            {/* Day header */}
                                            <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: '#1a56db', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Day {dayIdx + 1}</span>
                                                <input
                                                    {...register(`itinerary.${dayIdx}.title`)}
                                                    style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: 700, fontSize: 15, color: '#111827', outline: 'none', fontFamily: 'inherit' }}
                                                    placeholder="e.g. Arrival in Leh – Acclimatization"
                                                />
                                                {errors.itinerary?.[dayIdx]?.title && <span style={{ color: '#ef4444', fontSize: 11, whiteSpace: 'nowrap' }}>{errors.itinerary[dayIdx]?.title?.message}</span>}
                                                {itFields.length > 1 && (
                                                    <button type="button" onClick={() => removeIt(dayIdx)}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}>
                                                        <Trash2 size={13} /> Remove
                                                    </button>
                                                )}
                                            </div>

                                            {/* Activities */}
                                            <div style={{ padding: '16px 18px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Activities</span>
                                                    <button type="button" onClick={() => addPoint(dayIdx)}
                                                        style={{ background: '#eff6ff', color: '#1a56db', border: '1px solid #bfdbfe', borderRadius: 7, padding: '5px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Plus size={12} /> Activity
                                                    </button>
                                                </div>

                                                {(watch(`itinerary.${dayIdx}.points`) || []).map((_, pIdx) => (
                                                    <div key={pIdx} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                                                        {/* Activity heading row */}
                                                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1a56db', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 7 }}>
                                                                {pIdx + 1}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>Activity Heading *</label>
                                                                <input
                                                                    {...register(`itinerary.${dayIdx}.points.${pIdx}.text`)}
                                                                    style={{ ...inputStyle, fontWeight: 600, fontSize: 13 }}
                                                                    placeholder="e.g. Visit Shanti Stupa"
                                                                />
                                                                {errors.itinerary?.[dayIdx]?.points?.[pIdx]?.text && (
                                                                    <p style={errText}>{errors.itinerary[dayIdx]?.points?.[pIdx]?.text?.message}</p>
                                                                )}
                                                            </div>
                                                            {(watch(`itinerary.${dayIdx}.points`) || []).length > 1 && (
                                                                <button type="button" onClick={() => removePoint(dayIdx, pIdx)}
                                                                    style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: 4, marginTop: 20, borderRadius: 6, display: 'flex' }}>
                                                                    <X size={15} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Activity Description */}
                                                        <div style={{ paddingLeft: 34 }}>
                                                            <div style={{ marginBottom: 6 }}>
                                                                <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                                                            </div>
                                                            <textarea
                                                                {...register(`itinerary.${dayIdx}.points.${pIdx}.description`)}
                                                                style={{ ...inputStyle, fontSize: 13, resize: 'vertical', minHeight: 80, padding: '10px 12px' }}
                                                                placeholder="Provide details for this activity..."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════
                        STEP 4 — Options & FAQs
                    ════════════════════════════════════════════════════════ */}
                    {currentStep === 3 && (
                        <div>
                            <h5 style={{ fontWeight: 800, fontSize: 20, color: '#111827', marginBottom: 28 }}>Logistics & Support</h5>

                            {/* Departure Options */}
                            <div style={{ marginBottom: 36 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ ...sectionLabel, marginBottom: 2 }}>Pricing & Pickup Nodes</div>
                                        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Configure transport modes, routes, and price adjustments</p>
                                    </div>
                                    <button type="button"
                                        onClick={() => appendDep({ fromCity: '', toCity: '', type: PickupType.NON_AC_TRAIN, totalDays: 1, totalNights: 0, priceAdjustment: 0, departureTimeAndPlace: '' })}
                                        style={{ background: '#fff', color: '#1a56db', border: '1.5px solid #bfdbfe', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Plus size={14} /> New Config
                                    </button>
                                </div>

                                {depFields.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #e5e7eb', borderRadius: 14, background: '#f9fafb' }}>
                                        <Globe2 size={36} color="#d1d5db" style={{ marginBottom: 10 }} />
                                        <p style={{ margin: 0, fontWeight: 700, color: '#6b7280' }}>No pickup configs yet</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Click "New Config" to add bus, train, or flight options</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {depFields.map((field, idx) => (
                                            <div key={field.id} style={{ ...card, padding: 18, position: 'relative' }}>
                                                {/* Remove */}
                                                <button type="button" onClick={() => removeDep(idx)}
                                                    style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                                                    <X size={12} />
                                                </button>

                                                {/* Config badge */}
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: '#1a56db', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, marginBottom: 14 }}>
                                                    Config #{idx + 1}
                                                </div>

                                                {/* Row 1 */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                                                    <div>
                                                        <label style={sectionLabel}>Transport Mode</label>
                                                        <select {...register(`departureOptions.${idx}.type`)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                                            {Object.values(PickupType).map(t => <option key={t} value={t}>{getPickupTypeLabel(t)}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={sectionLabel}>Route Start *</label>
                                                        <input {...register(`departureOptions.${idx}.fromCity`)} style={inputStyle} placeholder="e.g. Delhi" />
                                                        {errors.departureOptions?.[idx]?.fromCity && <p style={errText}>{errors.departureOptions[idx]?.fromCity?.message}</p>}
                                                    </div>
                                                    <div>
                                                        <label style={sectionLabel}>Destination (Optional)</label>
                                                        <input {...register(`departureOptions.${idx}.toCity`)} style={inputStyle} placeholder="e.g. Jaipur" />
                                                        {errors.departureOptions?.[idx]?.toCity && <p style={errText}>{errors.departureOptions[idx]?.toCity?.message}</p>}
                                                    </div>
                                                    <div>
                                                        <label style={{ ...sectionLabel, color: '#1a56db' }}>Price Adj. (₹)</label>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span style={{ background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRight: 'none', borderRadius: '9px 0 0 9px', padding: '9px 10px', fontWeight: 700, fontSize: 14 }}>±</span>
                                                            <input type="number" {...register(`departureOptions.${idx}.priceAdjustment`, { valueAsNumber: true })} style={{ ...inputStyle, borderRadius: '0 9px 9px 0' }} placeholder="0" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Row 2 */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12 }}>
                                                    <div>
                                                        <label style={sectionLabel}>Total Days</label>
                                                        <input type="number" {...register(`departureOptions.${idx}.totalDays`, { valueAsNumber: true })} style={inputStyle} />
                                                    </div>
                                                    <div>
                                                        <label style={sectionLabel}>Total Nights (Auto)</label>
                                                        <input type="number" {...register(`departureOptions.${idx}.totalNights`, { valueAsNumber: true })} style={{ ...inputStyle, color: '#6b7280' }} />
                                                    </div>
                                                    <div>
                                                        <label style={sectionLabel}>Departure Schedule & Location</label>
                                                        <input {...register(`departureOptions.${idx}.departureTimeAndPlace`)} style={inputStyle} placeholder="e.g. 6:00 AM – Delhi ISBT Gate #4" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* FAQs */}
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 28, marginBottom: 28 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ ...sectionLabel, marginBottom: 2 }}>FAQ Center</div>
                                        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Anticipate common customer questions</p>
                                    </div>
                                    <button type="button" onClick={() => appendFaq({ question: '', answer: '' })}
                                        style={{ background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Plus size={14} /> Add FAQ
                                    </button>
                                </div>

                                {faqFields.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '36px 20px', border: '2px dashed #e5e7eb', borderRadius: 14, background: '#f9fafb' }}>
                                        <HelpCircle size={36} color="#d1d5db" style={{ marginBottom: 10 }} />
                                        <p style={{ margin: 0, fontWeight: 700, color: '#6b7280' }}>No FAQs added yet</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Click "Add FAQ" to help answer customer questions</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        {faqFields.map((field, idx) => (
                                            <div key={field.id} style={{ ...card, padding: 18, position: 'relative' }}>
                                                <button type="button" onClick={() => removeFaq(idx)}
                                                    style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 6 }}>
                                                    <X size={15} />
                                                </button>
                                                <div style={{ marginBottom: 12, paddingRight: 24 }}>
                                                    <label style={{ ...sectionLabel, color: '#1a56db' }}>Question #{idx + 1}</label>
                                                    <input {...register(`faqs.${idx}.question`)} style={{ ...inputStyle, fontWeight: 600 }} placeholder="e.g. What is the cancellation policy?" />
                                                    {errors.faqs?.[idx]?.question && <p style={errText}>{errors.faqs[idx]?.question?.message}</p>}
                                                </div>
                                                <div>
                                                    <label style={sectionLabel}>Answer</label>
                                                    <textarea {...register(`faqs.${idx}.answer`)} rows={3}
                                                        style={{ ...inputStyle, resize: 'none', fontSize: 13 }}
                                                        placeholder="Provide a clear answer..." />
                                                    {errors.faqs?.[idx]?.answer && <p style={errText}>{errors.faqs[idx]?.answer?.message}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Publishing Status Bar ────────────────────────────── */}
                            <div style={{ borderRadius: 14, background: '#0f172a', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>Publishing Status</p>
                                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>Control visibility on the customer-facing platform</p>
                                </div>
                                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                                    {/* Live toggle */}
                                    <div
                                        onClick={() => setValue('isActive', !watch('isActive'), { shouldDirty: true, shouldValidate: true })}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <Eye size={15} color={watch('isActive') ? '#34d399' : '#64748b'} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: watch('isActive') ? '#34d399' : '#94a3b8', minWidth: 80 }}>
                                            {watch('isActive') ? 'Live on Web' : 'Hidden'}
                                        </span>
                                        <div
                                            style={{ width: 44, height: 24, borderRadius: 12, background: watch('isActive') ? '#059669' : '#334155', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                            <div style={{ position: 'absolute', top: 3, left: watch('isActive') ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        </div>
                                    </div>

                                    <div style={{ width: 1, height: 30, background: '#334155' }} />

                                    {/* Featured toggle */}
                                    <div
                                        onClick={() => setValue('isFeatured', !watch('isFeatured'), { shouldDirty: true, shouldValidate: true })}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
                                    >
                                        <Bookmark size={15} color={watch('isFeatured') ? '#fbbf24' : '#64748b'} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: watch('isFeatured') ? '#fbbf24' : '#94a3b8', minWidth: 110 }}>
                                            {watch('isFeatured') ? 'Featured' : 'Not Featured'}
                                        </span>
                                        <div
                                            style={{ width: 44, height: 24, borderRadius: 12, background: watch('isFeatured') ? '#d97706' : '#334155', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                            <div style={{ position: 'absolute', top: 3, left: watch('isFeatured') ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Navigation Footer ─────────────────────────────────── */}
                    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" onClick={() => { setCurrentStep(p => Math.max(p - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            disabled={currentStep === 0}
                            style={{ background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 22px', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, opacity: currentStep === 0 ? 0 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto', transition: 'all 0.2s' }}>
                            <ChevronLeft size={18} /> Back
                        </button>

                        {currentStep < STEPS.length - 1 ? (
                            <button type="button" onClick={handleNextStep} disabled={isNavigating}
                                style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 30px', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, opacity: isNavigating ? 0.7 : 1, transition: 'all 0.2s' }}>
                                Continue <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button type="submit" disabled={isSubmitting || isNavigating}
                                style={{ background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 30px', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 4px 14px rgba(26,86,219,0.3)', transition: 'all 0.2s' }}>
                                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Publish Experience' : 'Update Experience'}
                                <Save size={17} />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Deletion Confirmation Modal */}
            <Modal
                isOpen={!!imgToDelete}
                onClose={() => setImgToDelete(null)}
                title="Confirm Image Deletion"
                size="sm"
                footer={(
                    <>
                        <button type="button" onClick={() => setImgToDelete(null)}
                            style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="button"
                            onClick={() => {
                                if (!imgToDelete) return;
                                if (imgToDelete.isExisting && imgToDelete.url)
                                {
                                    onDeleteImage?.(imgToDelete.url);
                                } else if (!imgToDelete.isExisting && imgToDelete.index !== undefined)
                                {
                                    setImages(p => p.filter((_, i) => i !== imgToDelete.index));
                                }
                                setImgToDelete(null);
                            }}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
                            Delete Image
                        </button>
                    </>
                )}
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ background: '#fef2f2', color: '#dc2626', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Trash2 size={24} />
                    </div>
                    <p style={{ margin: 0, color: '#111827', fontWeight: 700, fontSize: 16 }}>Are you sure?</p>
                    <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
                        This image will be permanently removed from the tour gallery. This action cannot be undone.
                    </p>

                    {imgToDelete && (
                        <div style={{ marginTop: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', height: 140 }}>
                            <img
                                src={imgToDelete.isExisting && imgToDelete.url ? getImgUrl(imgToDelete.url) : (imgToDelete.index !== undefined && images[imgToDelete.index] ? URL.createObjectURL(images[imgToDelete.index]) : '')}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                alt="To delete"
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
