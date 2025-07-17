import { AbstractSource, Contributor } from "./AbstractSource";
export default class Article extends AbstractSource {
    private journalEnglish;
    private journalArabic;
    private volumeEnglish;
    private volumeArabic;
    private issueEnglish;
    private issueArabic;
    private pageRangeEnglish;
    private pageRangeArabic;
    private DOI;
    constructor(id: string, titleEnglish: string, titleArabic: string, contributors: Contributor[], editionEnglish: string, editionArabic: string, publicationDateEnglish: string, publicationDateArabic: string, journalEnglish: string, journalArabic: string, volumeEnglish: string, volumeArabic: string, issueEnglish: string, issueArabic: string, pageRangeEnglish: string, pageRangeArabic: string, DOI: string, url: string, dateAccessed: string);
    getJournalEnglish(): string;
    getJournalArabic(): string;
    getVolumeEnglish(): string;
    getVolumeArabic(): string;
    getIssueEnglish(): string;
    getIssueArabic(): string;
    getPageRangeEnglish(): string;
    getPageRangeArabic(): string;
    getDOI(): string;
    /**
     * Include shared fields + all Article-specific fields.
     */
    convertToJSON(): object;
    static fromJSON(json: any): Article;
}
//# sourceMappingURL=Article.d.ts.map