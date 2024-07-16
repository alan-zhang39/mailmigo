export enum GenerationType {
	SUMMARY = "summary",
	CASE_STUDY = "case_study",
}

export interface Generation {
	type: GenerationType;
	uid: string;
	orgId: string;
	documentId: string;
	taskId: string;
	timestamp: number;
}
