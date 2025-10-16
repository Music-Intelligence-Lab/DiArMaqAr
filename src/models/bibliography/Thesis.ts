import { AbstractSource, Contributor } from "./AbstractSource";

/**
 * Represents a thesis or dissertation source in the bibliography system.
 * 
 * This class extends AbstractSource to provide thesis-specific metadata including
 * degree type (Master's, PhD, etc.), university/institution, department, and
 * database identifiers. All thesis-specific fields support bilingual English/Arabic
 * content to accommodate international Arabic music theory research.
 * 
 * Theses and dissertations are commonly used to reference recent academic research,
 * unpublished works, and specialized studies on tuning systems, maqamat, and ajnas
 * in Arabic music theory.
 */
export default class Thesis extends AbstractSource {
  /** Type of degree (e.g., "Master's thesis", "PhD dissertation") in English */
  private degreeTypeEnglish: string;
  
  /** Type of degree in Arabic */
  private degreeTypeArabic: string;
  
  /** University or institution name in English */
  private universityEnglish: string;
  
  /** University or institution name in Arabic */
  private universityArabic: string;
  
  /** Department name in English (optional) */
  private departmentEnglish: string;
  
  /** Department name in Arabic (optional) */
  private departmentArabic: string;
  
  /** Database identifier (e.g., ProQuest ID) */
  private databaseIdentifier: string;
  
  /** Name of the database (e.g., "ProQuest", "PQDT") */
  private databaseName: string;

  /**
   * Creates a new Thesis instance with comprehensive bibliographic metadata.
   * 
   * @param id - Unique identifier for this thesis
   * @param titleEnglish - Thesis title in English
   * @param titleArabic - Thesis title in Arabic
   * @param contributors - Array of contributors (typically the author)
   * @param editionEnglish - Edition information in English (rarely used for theses)
   * @param editionArabic - Edition information in Arabic (rarely used for theses)
   * @param publicationDateEnglish - Year of completion/submission in English
   * @param publicationDateArabic - Year of completion/submission in Arabic
   * @param degreeTypeEnglish - Type of degree in English (e.g., "Master's thesis", "PhD dissertation")
   * @param degreeTypeArabic - Type of degree in Arabic
   * @param universityEnglish - University/institution name in English
   * @param universityArabic - University/institution name in Arabic
   * @param departmentEnglish - Department name in English
   * @param departmentArabic - Department name in Arabic
   * @param databaseIdentifier - Database identifier (e.g., ProQuest ID)
   * @param databaseName - Name of the database
   * @param url - URL to access the thesis online
   * @param dateAccessed - Date when the online thesis was accessed
   */
  constructor(
    id: string,
    titleEnglish: string,
    titleArabic: string,
    contributors: Contributor[],
    editionEnglish: string,
    editionArabic: string,
    publicationDateEnglish: string,
    publicationDateArabic: string,
    degreeTypeEnglish: string,
    degreeTypeArabic: string,
    universityEnglish: string,
    universityArabic: string,
    departmentEnglish: string,
    departmentArabic: string,
    databaseIdentifier: string,
    databaseName: string,
    url: string,
    dateAccessed: string
  ) {
    super(
      id,
      titleEnglish,
      titleArabic,
      "Thesis",
      contributors,
      editionEnglish,
      editionArabic,
      publicationDateEnglish,
      publicationDateArabic,
      url,
      dateAccessed
    );

    this.degreeTypeEnglish = degreeTypeEnglish;
    this.degreeTypeArabic = degreeTypeArabic;
    this.universityEnglish = universityEnglish;
    this.universityArabic = universityArabic;
    this.departmentEnglish = departmentEnglish;
    this.departmentArabic = departmentArabic;
    this.databaseIdentifier = databaseIdentifier;
    this.databaseName = databaseName;
  }

  // Getters for thesis-specific fields
  getDegreeTypeEnglish(): string {
    return this.degreeTypeEnglish;
  }

  getDegreeTypeArabic(): string {
    return this.degreeTypeArabic;
  }

  getUniversityEnglish(): string {
    return this.universityEnglish;
  }

  getUniversityArabic(): string {
    return this.universityArabic;
  }

  getDepartmentEnglish(): string {
    return this.departmentEnglish;
  }

  getDepartmentArabic(): string {
    return this.departmentArabic;
  }

  getDatabaseIdentifier(): string {
    return this.databaseIdentifier;
  }

  getDatabaseName(): string {
    return this.databaseName;
  }

  // Setters for thesis-specific fields
  setDegreeTypeEnglish(degreeTypeEnglish: string): void {
    this.degreeTypeEnglish = degreeTypeEnglish;
  }

  setDegreeTypeArabic(degreeTypeArabic: string): void {
    this.degreeTypeArabic = degreeTypeArabic;
  }

  setUniversityEnglish(universityEnglish: string): void {
    this.universityEnglish = universityEnglish;
  }

  setUniversityArabic(universityArabic: string): void {
    this.universityArabic = universityArabic;
  }

  setDepartmentEnglish(departmentEnglish: string): void {
    this.departmentEnglish = departmentEnglish;
  }

  setDepartmentArabic(departmentArabic: string): void {
    this.departmentArabic = departmentArabic;
  }

  setDatabaseIdentifier(databaseIdentifier: string): void {
    this.databaseIdentifier = databaseIdentifier;
  }

  setDatabaseName(databaseName: string): void {
    this.databaseName = databaseName;
  }

  /**
   * Converts this thesis to a plain JavaScript object for serialization.
   * 
   * Used for JSON export and data persistence. Creates a flat object containing
   * all thesis metadata including both base fields and thesis-specific fields.
   * 
   * @returns Plain object representation suitable for JSON serialization
   */
  toJSON(): Record<string, unknown> {
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
      degreeTypeEnglish: this.degreeTypeEnglish,
      degreeTypeArabic: this.degreeTypeArabic,
      universityEnglish: this.universityEnglish,
      universityArabic: this.universityArabic,
      departmentEnglish: this.departmentEnglish,
      departmentArabic: this.departmentArabic,
      databaseIdentifier: this.databaseIdentifier,
      databaseName: this.databaseName,
      url: this.url,
      dateAccessed: this.dateAccessed,
    };
  }

  /**
   * Creates a Thesis instance from a plain JavaScript object.
   * 
   * Static factory method for deserialization from JSON. Reconstructs
   * a full Thesis object from stored data, ensuring proper type conversion
   * and default values for missing fields.
   * 
   * @param json - Plain object containing thesis data
   * @returns New Thesis instance with data from the JSON object
   */
  static fromJSON(json: any): Thesis {
    return new Thesis(
      json.id || "",
      json.titleEnglish || "",
      json.titleArabic || "",
      json.contributors || [],
      json.editionEnglish || "",
      json.editionArabic || "",
      json.publicationDateEnglish || "",
      json.publicationDateArabic || "",
      json.degreeTypeEnglish || "",
      json.degreeTypeArabic || "",
      json.universityEnglish || "",
      json.universityArabic || "",
      json.departmentEnglish || "",
      json.departmentArabic || "",
      json.databaseIdentifier || "",
      json.databaseName || "",
      json.url || "",
      json.dateAccessed || ""
    );
  }
}
