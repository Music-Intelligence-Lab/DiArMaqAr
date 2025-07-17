import { AbstractSource, Contributor } from "./AbstractSource";
export default class Book extends AbstractSource {
    private originalPublicationDateEnglish;
    private originalPublicationDateArabic;
    private publisherEnglish;
    private publisherArabic;
    private placeEnglish;
    private placeArabic;
    private ISBN;
    constructor(id: string, titleEnglish: string, titleArabic: string, contributors: Contributor[], editionEnglish: string, editionArabic: string, publicationDateEnglish: string, publicationDateArabic: string, originalPublicationDateEnglish: string, originalPublicationDateArabic: string, publisherEnglish: string, publisherArabic: string, placeEnglish: string, placeArabic: string, ISBN: string, url: string, dateAccessed: string);
    getOriginalPublicationDateEnglish(): string;
    getOriginalPublicationDateArabic(): string;
    getPublicationDateEnglish(): string;
    getReleaseDateArabic(): string;
    getPublisherEnglish(): string;
    getPublisherArabic(): string;
    getPlaceEnglish(): string;
    getPlaceArabic(): string;
    getISBN(): string;
    /**
     * Include shared fields + all Book-specific fields.
     */
    convertToJSON(): object;
    static fromJSON(json: any): Book;
}
//# sourceMappingURL=Book.d.ts.map