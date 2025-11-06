import { NextResponse } from "next/server";
import { getSources } from "@/functions/import";
import { stringifySource } from "@/models/bibliography/Source";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import Thesis from "@/models/bibliography/Thesis";
import { parseInArabic } from "@/app/api/arabic-helpers";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/sources/[id]
 *
 * Returns details of a single bibliographic source by ID.
 *
 * Query Parameters:
 * - inArabic: true|false (default: false) - Include Arabic language fields
 *
 * Response includes source metadata with bilingual support (English/Arabic).
 * Returns comprehensive bibliographic information including publication details,
 * contributors, and type-specific fields (publisher for books, journal for articles, etc.).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await context.params;
    const { searchParams } = new URL(request.url);

    // Parse inArabic parameter
    let inArabic = false;
    try {
      inArabic = parseInArabic(searchParams);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Invalid inArabic parameter",
            hint: "Use ?inArabic=true or ?inArabic=false"
          },
          { status: 400 }
        )
      );
    }

    // Check if sourceId is empty or invalid
    if (!sourceId || sourceId.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "No source ID provided",
            hint: "Please specify a source ID",
            example: `/api/sources/source_ibn_sina_1037`
          },
          { status: 400 }
        )
      );
    }

    const sources = getSources();

    // Find the source by ID
    const source = sources.find((s) => s.getId() === sourceId);

    if (!source) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Source '${sourceId}' not found`,
            hint: "Use /api/sources to see all available sources"
          },
          { status: 404 }
        )
      );
    }

    // Common fields from AbstractSource
    // Always return English/transliteration, add Arabic with "Ar" suffix when inArabic=true
    const sourceData: any = {
      id: source.getId(),
      displayName: stringifySource(source, true, null), // Always English
      sourceType: source.getSourceType(),
      title: source.getTitleEnglish(),
      contributors: source.getContributors().map(c => ({
        type: c.type,
        firstName: c.firstNameEnglish,
        lastName: c.lastNameEnglish,
      })),
      edition: source.getEditionEnglish(),
      publicationDate: source.getPublicationDateEnglish(),
      url: source.getUrl(),
      dateAccessed: source.getDateAccessed(),
      version: source.getVersion(),
    };

    // Add type-specific fields (always English)
    if (source.getSourceType() === "Book") {
      const book = source as Book;
      sourceData.originalPublicationDate = book.getOriginalPublicationDateEnglish();
      sourceData.publisher = book.getPublisherEnglish();
      sourceData.place = book.getPlaceEnglish();
      sourceData.ISBN = book.getISBN();
    } else if (source.getSourceType() === "Article") {
      const article = source as Article;
      sourceData.journal = article.getJournalEnglish();
      sourceData.volume = article.getVolumeEnglish();
      sourceData.issue = article.getIssueEnglish();
      sourceData.pageRange = article.getPageRangeEnglish();
      sourceData.DOI = article.getDOI();
    } else if (source.getSourceType() === "Thesis") {
      const thesis = source as Thesis;
      sourceData.degreeType = thesis.getDegreeTypeEnglish();
      sourceData.university = thesis.getUniversityEnglish();
      sourceData.department = thesis.getDepartmentEnglish();
      sourceData.databaseIdentifier = thesis.getDatabaseIdentifier();
      sourceData.databaseName = thesis.getDatabaseName();
    }

    // Add Arabic versions when inArabic=true
    if (inArabic) {
      sourceData.displayNameAr = stringifySource(source, false, null);
      sourceData.titleAr = source.getTitleArabic();
      sourceData.contributors = source.getContributors().map((c, idx) => ({
        ...sourceData.contributors[idx],
        firstNameAr: c.firstNameArabic,
        lastNameAr: c.lastNameArabic,
      }));
      sourceData.editionAr = source.getEditionArabic();
      sourceData.publicationDateAr = source.getPublicationDateArabic();

      if (source.getSourceType() === "Book") {
        const book = source as Book;
        sourceData.originalPublicationDateAr = book.getOriginalPublicationDateArabic();
        sourceData.publisherAr = book.getPublisherArabic();
        sourceData.placeAr = book.getPlaceArabic();
      } else if (source.getSourceType() === "Article") {
        const article = source as Article;
        sourceData.journalAr = article.getJournalArabic();
        sourceData.volumeAr = article.getVolumeArabic();
        sourceData.issueAr = article.getIssueArabic();
        sourceData.pageRangeAr = article.getPageRangeArabic();
      } else if (source.getSourceType() === "Thesis") {
        const thesis = source as Thesis;
        sourceData.degreeTypeAr = thesis.getDegreeTypeArabic();
        sourceData.universityAr = thesis.getUniversityArabic();
        sourceData.departmentAr = thesis.getDepartmentArabic();
      }
    }

    const response = NextResponse.json({
      source: sourceData
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching source:", error);
    const errorResponse = NextResponse.json(
      {
        error: "Failed to fetch source",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
