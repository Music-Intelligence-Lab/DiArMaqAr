import Book from "./Book";
import Article from "./Article";
export type Source = Book | Article;
export interface SourcePageReference {
    sourceId: string;
    page: string;
}
//# sourceMappingURL=Source.d.ts.map