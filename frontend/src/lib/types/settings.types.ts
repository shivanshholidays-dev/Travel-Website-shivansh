export interface BusinessDetails {
    upiId?: string;
    gstRate?: number;
    phoneNumber?: string;
    officeAddress?: string;
    supportEmail?: string;
}

export interface SocialMedia {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
}

export interface PaymentDetails {
    upiQrImageUrl?: string;
}

export interface OtherSettings {
    footerDescription?: string;
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    logoUrl?: string;
    whatsappNumberForNotifications?: string;
    whatsappEnabled?: boolean;
    whatsappPhoneNumberId?: string;
    whatsappAccessToken?: string;
}

export interface PolicyContent {
    privacyPolicy?: string;
    termsAndConditions?: string;
    refundPolicy?: string;
    cancellationPolicy?: string;
    bookingInstructions?: string;
}

export interface HeroContent {
    heroTitle?: string;
    heroSubtitle?: string;
    heroCta?: string;
    heroCtaUrl?: string;
    heroBannerImage?: string;
    heroHighlights?: string[];
}

export interface WhyChooseUsItem {
    title?: string;
    description?: string;
    icon?: string;
}

export interface AboutContent {
    heroTitle?: string;
    heroSubtitle?: string;
    missionStatement?: string;
    whyChooseUs?: WhyChooseUsItem[];
}

export interface JobListing {
    title?: string;
    location?: string;
    type?: string;
    description?: string;
    applyUrl?: string;
}

export interface CareerContent {
    heroTitle?: string;
    heroSubtitle?: string;
    cultureDescription?: string;
    benefits?: string[];
    jobs?: JobListing[];
}

export interface FaqItem {
    question?: string;
    answer?: string;
}

export interface Setting {
    _id: string;
    isGlobal: boolean;
    businessDetails: BusinessDetails;
    socialMedia: SocialMedia;
    paymentDetails: PaymentDetails;
    otherSettings: OtherSettings;
    policies?: PolicyContent;
    heroContent?: HeroContent;
    heroSliders?: HeroContent[];
    aboutContent?: AboutContent;
    careerContent?: CareerContent;
    faqs?: FaqItem[];
    adminIpWhitelist?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface UpdateSettingPayload {
    businessDetails?: BusinessDetails;
    socialMedia?: SocialMedia;
    paymentDetails?: PaymentDetails;
    otherSettings?: OtherSettings;
    policies?: PolicyContent;
    heroContent?: HeroContent;
    heroSliders?: HeroContent[];
    aboutContent?: AboutContent;
    careerContent?: CareerContent;
    faqs?: FaqItem[];
    adminIpWhitelist?: string[];
}

