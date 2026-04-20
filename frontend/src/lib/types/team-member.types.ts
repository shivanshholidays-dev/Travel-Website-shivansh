export interface SocialLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
}

export interface TeamMember {
    _id: string;
    name: string;
    designation: string;
    bio?: string;
    image?: string;
    socialLinks?: SocialLinks;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type CreateTeamMemberPayload = Pick<TeamMember, 'name' | 'designation'> &
    Partial<Pick<TeamMember, 'bio' | 'image' | 'socialLinks' | 'order' | 'isActive'>>;

export type UpdateTeamMemberPayload = Partial<CreateTeamMemberPayload>;
