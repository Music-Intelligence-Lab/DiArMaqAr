"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractSource = void 0;
class AbstractSource {
    constructor(id, titleEnglish, titleArabic, sourceType, contributors, editionEnglish, editionArabic, publicationDateEnglish, publicationDateArabic, url, dateAccessed) {
        this.id = id;
        this.titleEnglish = titleEnglish;
        this.titleArabic = titleArabic;
        this.sourceType = sourceType;
        this.contributors = contributors;
        this.editionEnglish = editionEnglish;
        this.editionArabic = editionArabic;
        this.publicationDateEnglish = publicationDateEnglish;
        this.publicationDateArabic = publicationDateArabic;
        this.url = url;
        this.dateAccessed = dateAccessed;
    }
    getId() {
        return this.id;
    }
    getTitleEnglish() {
        return this.titleEnglish;
    }
    getTitleArabic() {
        return this.titleArabic;
    }
    getSourceType() {
        return this.sourceType;
    }
    getContributors() {
        return this.contributors;
    }
    getEditionEnglish() {
        return this.editionEnglish;
    }
    getEditionArabic() {
        return this.editionArabic;
    }
    getPublicationDateEnglish() {
        return this.publicationDateEnglish;
    }
    getPublicationDateArabic() {
        return this.publicationDateArabic;
    }
    getUrl() {
        return this.url;
    }
    getDateAccessed() {
        return this.dateAccessed;
    }
    /**
     * Returns only the “shared” fields. Subclasses will override and spread in their own extras.
     */
    convertToJSON() {
        return {
            id: this.id,
            titleEnglish: this.titleEnglish,
            titleArabic: this.titleArabic,
            sourceType: this.sourceType,
            contributors: this.contributors,
            editionEnglish: this.editionEnglish,
            editionArabic: this.editionArabic,
            publicationDateEnglish: this.publicationDateEnglish,
            publicationDateArabic: this.publicationDateArabic,
            url: this.url,
            dateAccessed: this.dateAccessed,
        };
    }
}
exports.AbstractSource = AbstractSource;
//# sourceMappingURL=AbstractSource.js.map