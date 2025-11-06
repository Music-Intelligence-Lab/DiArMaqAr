import { NextResponse } from "next/server";
import { getSources } from "@/functions/import";
import { stringifySource } from "@/models/bibliography/Source";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { safeWriteFile } from "@/app/api/backup-utils";
import path from "path";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import Thesis from "@/models/bibliography/Thesis";
import { parseInArabic } from "@/app/api/arabic-helpers";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/sources
 * 
 * Returns all bibliographic sources (books, articles, theses).
 * 
 * Response includes all source metadata with bilingual support (English/Arabic).
 * Returns comprehensive bibliographic information including publication details,
 * contributors, and type-specific fields (publisher for books, journal for articles, etc.).
 */
export async function GET(request: Request) {
  try {
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
    
    const sources = getSources();
    
    const sourcesData = sources.map((source) => {
      // Common fields from AbstractSource
      // Always return English/transliteration, add Arabic with "Ar" suffix when inArabic=true
      const baseData: any = {
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
        baseData.originalPublicationDate = book.getOriginalPublicationDateEnglish();
        baseData.publisher = book.getPublisherEnglish();
        baseData.place = book.getPlaceEnglish();
        baseData.ISBN = book.getISBN();
      } else if (source.getSourceType() === "Article") {
        const article = source as Article;
        baseData.journal = article.getJournalEnglish();
        baseData.volume = article.getVolumeEnglish();
        baseData.issue = article.getIssueEnglish();
        baseData.pageRange = article.getPageRangeEnglish();
        baseData.DOI = article.getDOI();
      } else if (source.getSourceType() === "Thesis") {
        const thesis = source as Thesis;
        baseData.degreeType = thesis.getDegreeTypeEnglish();
        baseData.university = thesis.getUniversityEnglish();
        baseData.department = thesis.getDepartmentEnglish();
        baseData.databaseIdentifier = thesis.getDatabaseIdentifier();
        baseData.databaseName = thesis.getDatabaseName();
      }

      // Add Arabic versions when inArabic=true
      if (inArabic) {
        baseData.displayNameAr = stringifySource(source, false, null);
        baseData.titleAr = source.getTitleArabic();
        baseData.contributors = source.getContributors().map((c, idx) => ({
          ...baseData.contributors[idx],
          firstNameAr: c.firstNameArabic,
          lastNameAr: c.lastNameArabic,
        }));
        baseData.editionAr = source.getEditionArabic();
        baseData.publicationDateAr = source.getPublicationDateArabic();
        
        if (source.getSourceType() === "Book") {
          const book = source as Book;
          baseData.originalPublicationDateAr = book.getOriginalPublicationDateArabic();
          baseData.publisherAr = book.getPublisherArabic();
          baseData.placeAr = book.getPlaceArabic();
        } else if (source.getSourceType() === "Article") {
          const article = source as Article;
          baseData.journalAr = article.getJournalArabic();
          baseData.volumeAr = article.getVolumeArabic();
          baseData.issueAr = article.getIssueArabic();
          baseData.pageRangeAr = article.getPageRangeArabic();
        } else if (source.getSourceType() === "Thesis") {
          const thesis = source as Thesis;
          baseData.degreeTypeAr = thesis.getDegreeTypeArabic();
          baseData.universityAr = thesis.getUniversityArabic();
          baseData.departmentAr = thesis.getDepartmentArabic();
        }
      }

      return baseData;
    });

    const response = NextResponse.json({
      sources: sourcesData,
      meta: {
        total: sourcesData.length,
      },
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching sources:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

/**
 * PUT /api/sources
 * 
 * Updates the bibliographic sources database.
 * Accepts an array of source objects and writes them to data/sources.json.
 * 
 * Request Body: Array of source objects (from convertToJSON())
 */
export async function PUT(request: Request) {
  try {
    const sources = await request.json();
    
    if (!Array.isArray(sources)) {
      const errorResponse = NextResponse.json(
        { error: "Invalid request: body must be an array of sources" },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // CRITICAL: Prevent data loss - reject empty arrays
    if (sources.length === 0) {
      const errorResponse = NextResponse.json(
        { 
          error: "Cannot save empty array",
          message: "Refusing to save empty array to prevent data loss. If you want to clear all data, use a delete endpoint or explicitly confirm.",
          hint: "This endpoint requires at least one source object"
        },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Get the path to data/sources.json
    const dataPath = path.join(process.cwd(), "data", "sources.json");

    // Write with backup
    const writeResult = safeWriteFile(dataPath, sources, true);

    if (!writeResult.success) {
      throw new Error(writeResult.error || "Failed to write file");
    }

    const response = NextResponse.json({
      message: "Sources updated successfully",
      count: sources.length,
      backupCreated: writeResult.backupPath !== null,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error updating sources:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update sources" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

