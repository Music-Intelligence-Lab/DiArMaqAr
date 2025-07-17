"use strict";
// article.ts
Object.defineProperty(exports, "__esModule", { value: true });
const AbstractSource_1 = require("./AbstractSource");
class Article extends AbstractSource_1.AbstractSource {
    constructor(id, titleEnglish, titleArabic, contributors, editionEnglish, editionArabic, publicationDateEnglish, publicationDateArabic, journalEnglish, journalArabic, volumeEnglish, volumeArabic, issueEnglish, issueArabic, pageRangeEnglish, pageRangeArabic, DOI, url, dateAccessed) {
        super(id, titleEnglish, titleArabic, "Article", // discriminator
        contributors, editionEnglish, editionArabic, publicationDateEnglish, publicationDateArabic, url, dateAccessed);
        this.journalEnglish = journalEnglish;
        this.journalArabic = journalArabic;
        this.volumeEnglish = volumeEnglish;
        this.volumeArabic = volumeArabic;
        this.issueEnglish = issueEnglish;
        this.issueArabic = issueArabic;
        this.pageRangeEnglish = pageRangeEnglish;
        this.pageRangeArabic = pageRangeArabic;
        this.DOI = DOI;
    }
    getJournalEnglish() {
        return this.journalEnglish;
    }
    getJournalArabic() {
        return this.journalArabic;
    }
    getVolumeEnglish() {
        return this.volumeEnglish;
    }
    getVolumeArabic() {
        return this.volumeArabic;
    }
    getIssueEnglish() {
        return this.issueEnglish;
    }
    getIssueArabic() {
        return this.issueArabic;
    }
    getPageRangeEnglish() {
        return this.pageRangeEnglish;
    }
    getPageRangeArabic() {
        return this.pageRangeArabic;
    }
    getDOI() {
        return this.DOI;
    }
    /**
     * Include shared fields + all Article-specific fields.
     */
    convertToJSON() {
        return {
            ...super.convertToJSON(),
            journalEnglish: this.journalEnglish,
            journalArabic: this.journalArabic,
            volumeEnglish: this.volumeEnglish,
            volumeArabic: this.volumeArabic,
            issueEnglish: this.issueEnglish,
            issueArabic: this.issueArabic,
            pageRangeEnglish: this.pageRangeEnglish,
            pageRangeArabic: this.pageRangeArabic,
            DOI: this.DOI,
        };
    }
    static fromJSON(json) {
        return new Article(json.id, json.titleEnglish, json.titleArabic, json.contributors, json.editionEnglish, json.editionArabic, json.publicationDateEnglish, json.publicationDateArabic, json.journalEnglish, json.journalArabic, json.volumeEnglish, json.volumeArabic, json.issueEnglish, json.issueArabic, json.pageRangeEnglish, json.pageRangeArabic, json.DOI, json.url, json.dateAccessed);
    }
}
exports.default = Article;
//# sourceMappingURL=Article.js.map