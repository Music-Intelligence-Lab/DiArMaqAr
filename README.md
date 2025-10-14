# DiArMaqAr - the Digital Arabic Maqām Archive

A comprehensive bilingual browser-based application and repository designed for musicians, composers, developers, and scholars engaged with Arabic maqām theory.

## Overview

The Digital Arabic Maqām Archive represents a significant advancement in computational musicology, providing the first comprehensive platform for interactive maqām analysis and exploration. Developed by **Dr. Khyam Allami** and **Ibrahim El Khansa** in the **Music Intelligence Lab** at the **American University of Beirut**, this application employs a culturally specific approach that prioritizes Arabic theoretical frameworks and epistemological systems.

The application integrates an archive of historically documented tanāghīm (tuning systems), ajnās (tetrachords), maqāmāt (melodic modes), suyūr (melodic performance pathways), and intiqālāt (modulation practices) within a unified digital framework, establishing verified reference data for education, performance, composition, software development, machine learning applications, and instrument design.

The implementation operates entirely within Arabic theoretical frameworks and epistemological systems. All operations are grounded in the historical Arab-Ottoman-Persian note naming convention (rāst, dugāh, segāh etc.), with tuning-system-sensitive transposition capabilities that maintain intervallic integrity across all maqāmāt and ajnās. 
- Users can audition the data with real-time audio synthesis, hearing precise intonational relationships of the maqāmāt and their ajnās across different tuning systems.
- Musicians and composers gain access to the first algorithmic implementation of Sāmī al-Shawwā's 1946 modulation guidelines, enabling systematic explorations of intiqālāt.
- Developers and researchers can access structured, computationally queryable data through both the interactive interface and programmatic means such as JSON exports and API endpoints.

By providing rigorously sourced, computationally accessible reference data with transparent provenance, the archive addresses a critical infrastructure gap across multiple domains: computational musicology, music information retrieval systems, training datasets for AI/ML applications, digital instrument interfaces, pedagogical tools, and compositional resources. The browser-based platform requires no specialized software or technical expertise for basic use, while offering programmatic access for advanced applications. This dual accessibility establishes ground truth data serving creative, educational, and research purposes across diverse communities of practice.

## Technical Architecture

### Core Technologies
- **Frontend**: Next.js 15+ with React 19+
- **Language**: TypeScript for comprehensive type safety
- **Styling**: SCSS with modular component architecture
- **Audio Engine**: Custom Web Audio API implementation
- **Music Notation**: VexFlow for staff notation rendering
- **Documentation**: TypeDoc for API documentation generation

## Links

- **Live Application**: [https://arabic-maqam-archive.netlify.app/](https://arabic-maqam-archive.netlify.app/)
