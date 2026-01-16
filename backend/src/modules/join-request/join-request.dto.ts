export interface CreateJoinRequestInput {
    organizationId: string;
    message?: string;
}

export interface ReviewJoinRequestInput {
    rejectionReason?: string;
}
