"use strict";
// book.ts
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSource_1 = require("./AbstractSource");
class Book extends AbstractSource_1.AbstractSource {
    constructor(id, titleEnglish, titleArabic, contributors, editionEnglish, editionArabic, publicationDateEnglish, publicationDateArabic, originalPublicationDateEnglish, originalPublicationDateArabic, publisherEnglish, publisherArabic, placeEnglish, placeArabic, ISBN, url, dateAccessed) {
        super(id, titleEnglish, titleArabic, "Book", // discriminator
        contributors, editionEnglish, editionArabic, publicationDateEnglish, publicationDateArabic, url, dateAccessed);
        this.originalPublicationDateEnglish = originalPublicationDateEnglish;
        this.originalPublicationDateArabic = originalPublicationDateArabic;
        this.publisherEnglish = publisherEnglish;
        this.publisherArabic = publisherArabic;
        this.placeEnglish = placeEnglish;
        this.placeArabic = placeArabic;
        this.ISBN = ISBN;
    }
    getOriginalPublicationDateEnglish() {
        return this.originalPublicationDateEnglish;
    }
    getOriginalPublicationDateArabic() {
        return this.originalPublicationDateArabic;
    }
    getPublicationDateEnglish() {
        return this.publicationDateEnglish;
    }
    getReleaseDateArabic() {
        return this.publicationDateArabic;
    }
    getPublisherEnglish() {
        return this.publisherEnglish;
    }
    getPublisherArabic() {
        return this.publisherArabic;
    }
    getPlaceEnglish() {
        return this.placeEnglish;
    }
    getPlaceArabic() {
        return this.placeArabic;
    }
    getISBN() {
        return this.ISBN;
    }
    /**
     * Include shared fields + all Book-specific fields.
     */
    convertToJSON() {
        return {
            ...super.convertToJSON(),
            originalPublicationDateEnglish: this.originalPublicationDateEnglish,
            originalPublicationDateArabic: this.originalPublicationDateArabic,
            publisherEnglish: this.publisherEnglish,
            publisherArabic: this.publisherArabic,
            placeEnglish: this.placeEnglish,
            placeArabic: this.placeArabic,
            ISBN: this.ISBN,
        };
    }
    static fromJSON(json) {
        return new Book(json.id, json.titleEnglish, json.titleArabic, json.contributors, json.editionEnglish, json.editionArabic, json.publicationDateEnglish, json.publicationDateArabic, json.originalPublicationDateEnglish, json.originalPublicationDateArabic, json.publisherEnglish, json.publisherArabic, json.placeEnglish, json.placeArabic, json.ISBN, json.url, json.dateAccessed);
    }
}
exports.default = Book;
//# sourceMappingURL=Book.js.map