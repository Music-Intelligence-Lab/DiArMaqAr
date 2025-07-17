export type SourceType = "Book" | "Article";
export type ContributorType = "Author" | "Editor" | "Translator" | "Reviewer" | "Investigator";
export interface Contributor {
    type: ContributorType;
    firstNameEnglish: string;
    lastNameEnglish: string;
    firstNameArabic: string;
    lastNameArabic: string;
}
export declare abstract class AbstractSource {
    protected id: string;
    protected titleEnglish: string;
    protected titleArabic: string;
    protected sourceType: SourceType;
    protected contributors: Contributor[];
    protected editionEnglish: string;
    protected editionArabic: string;
    protected publicationDateEnglish: string;
    protected publicationDateArabic: string;
    protected url: string;
    protected dateAccessed: string;
    constructor(id: string, titleEnglish: string, titleArabic: string, sourceType: SourceType, contributors: Contributor[], editionEnglish: string, editionArabic: string, publicationDateEnglish: string, publicationDateArabic: string, url: string, dateAccessed: string);
    getId(): string;
    getTitleEnglish(): string;
    getTitleArabic(): string;
    getSourceType(): SourceType;
    getContributors(): Contributor[];
    getEditionEnglish(): string;
    getEditionArabic(): string;
    getPublicationDateEnglish(): string;
    getPublicationDateArabic(): string;
    getUrl(): string;
    getDateAccessed(): string;
    /**
     * Returns only the “shared” fields. Subclasses will override and spread in their own extras.
     */
    convertToJSON(): object;
}
//# sourceMappingURL=AbstractSource.d.ts.map