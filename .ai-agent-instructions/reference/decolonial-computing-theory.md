# Decolonial Computing Theory

**PURPOSE**: Comprehensive theoretical frameworks for understanding computing as modern/colonial phenomenon, with applications to Arabic music technology.

**LOAD**: When designing systems involving cultural knowledge, questioning Western defaults, or articulating theoretical foundations.

---

## Introduction: The Colonial Matrix of Computing

Computing is not neutral infrastructure awaiting diverse content. Its architectures, default settings, classification systems, and underlying epistemologies bear structural traces of colonialism. The MIDI protocol defaulting to twelve-tone equal temperament, Digital Audio Workstations imposing 4/4 time signatures, music software treating Western staff notation as the universal representation—these are not arbitrary technical choices but manifestations of what Aníbal Quijano termed the "coloniality of power."

This document synthesizes theoretical frameworks essential for recognizing and challenging computational colonialism, with particular attention to music technology. The insights gathered here inform every design decision in the Digital Arabic Maqām Archive: why we reject "microtonal" terminology, why tuning systems have starting notes rather than "root notes," why maqām theory requires independent ascending and descending sequences rather than reversible scales.

---

## Part I: Foundational Frameworks

### 1.1 Coloniality of Power: Beyond Political Decolonization

Quijano's foundational distinction separates colonialism—the historical political administration of territories—from coloniality—the ongoing structures of power that survive formal decolonization. The colonial matrix operates across four interrelated domains:

**Control of Economy**: Historical resource extraction continues through data appropriation, platform capitalism, algorithmic labor exploitation. When Facebook offered "Free Basics" internet in developing nations, routing all traffic through their proxy servers while harvesting metadata, the pattern replicated colonial trading companies extracting resources under rhetoric of development.

**Control of Authority**: Tech platforms exercise sovereignty beyond nation-states through terms of service, content moderation, infrastructure ownership. Google's ability to delist entire nations from search results, Apple's power to remove applications from billions of devices—these represent new forms of imperial authority operating through code rather than military force.

**Control of Gender and Sexuality**: Algorithmic systems encode heteronormative assumptions, regulate bodies through biometric technologies, perpetuate gender hierarchies through interface design. Voice assistants defaulting to feminine voices for service roles, facial recognition systems trained predominantly on white male faces—technology reproduces existing hierarchies while claiming objectivity.

**Control of Knowledge and Subjectivity**: Most critical for computing—epistemic hierarchies privilege Western knowledge while suppressing non-Western epistemologies. This operates not through explicit prohibition but through structural design: software architectures that make certain representations "natural" and others require workarounds, default settings that make Western frameworks invisible while rendering others exotic additions, documentation that treats Western concepts as universal and non-Western concepts as specialized edge cases.

Quijano's argument: "En primer término, la descolonización epistemológica, para dar paso luego a una nueva comunicación inter-cultural, a un intercambio de experiencias y de significaciones, como la base de otra racionalidad que pueda pretender, con legitimidad, a alguna universalidad." First, epistemological decolonization—then intercultural communication, exchange of experiences and meanings, as basis for another rationality that can legitimately claim universality. Not replacing one universal with another, but transforming the very possibility of universality.

### 1.2 Geo-Politics and Body-Politics of Knowledge

Walter Mignolo fundamentally challenges the myth of disembodied, universal knowledge production. Western philosophy positions itself as the view from nowhere—the Cartesian cogito ergo sum abstracts thought from body, place, history. This "zero-point epistemology" claims access to universal truth while actual knowledge production remains located in European institutions, languages, theoretical frameworks.

**The Colonial Difference**: "The space where coloniality of power is enacted. It is also the space where the restitution of subaltern knowledge is taking place and where border thinking is emerging." Not a geographic boundary but epistemic rupture—where Western knowledge systems encounter others they cannot assimilate. The colonial difference creates hierarchies: knowledge produced in European universities versus "traditional knowledge," "music theory" versus "musical practices," "scientific measurement" versus "subjective experience."

**Epistemic Delinking**: Moving from theo-politics (theological knowledge) and ego-politics (Cartesian/Enlightenment knowledge) to geo-politics and body-politics of knowledge. As Mignolo states: "Delinking means to change the terms and not just the content of the conversation." Not adding non-Western perspectives to Western frameworks, but transforming the frameworks themselves.

"I am where I think. The ethnic location of the thinking subject has been one of the silences of Western epistemology. By the same token, the geopolitical location of the thinking subject has been obliterated." When Alexander Ellis invented the cent system specifically to compare non-Western tuning systems to twelve-tone equal temperament, he positioned European tuning as the unmarked standard, the measure of all others. His geo-political location—Victorian England at empire's height—shaped his epistemological framework. Yet his system presents itself as neutral, scientific, objective measurement.

**Border Thinking**: Epistemology emerging from the colonial difference—thinking from borders/margins of the modern/colonial world-system. Not simply reversing the hierarchy (privileging non-Western over Western) but thinking from the space of tension itself. Border thinking recognizes Western knowledge traditions without granting them universal status, engages non-Western epistemologies without romanticizing them, works in the friction between multiple rationalities.

### 1.3 The Fabrication of History and Epistemicide

Ramón Grosfoguel documents "Four Genocides/Epistemicides of the Long 16th Century"—systematic destruction not just of people but of knowledge systems:

- Against Muslims and Jews in the conquest of Al-Andalus (1492)
- Against Indigenous peoples in the Americas (post-1492)  
- Against Africans through enslavement and racialization
- Against women through European witch-hunts

This pattern: colonial power operates not just through material extraction but through systematic suppression, marginalization, or destruction of non-Western knowledge systems. What Quijano calls the "repression of colonized knowledge production models."

Consider music theory history. Almost all Anglo-European literature on tuning theory from the second half of the 20th century minimizes or excludes ancient Mesopotamian, Egyptian, Chinese, and other non-European histories, crediting Pythagoras and the Greeks for everything. Yet since the 1960s, twenty ancient cuneiform tablets concerning music have been found and translated. Tablet CBS 10996 features the exact tuning system credited to Pythagoras and the seven principal modes credited to the Greeks, dating to ca. 2000-1500 BCE—"approximately one millennium" before comparable texts from Greece or China.

By 1957, approximately 500,000 cuneiform tablets had been extracted from Iraq to American, British, and European museums, with only 300 mathematical texts translated—yet sufficient for Neugebauer's assessment: "proof that the 'Pythagorean' theorem was known more than a thousand years before Pythagoras." The knowledge existed. The evidence existed. Yet literature continued attributing these discoveries to Greeks.

Iamblichus records that Pythagoras's teacher Thales advised him to study in Egypt. Pythagoras sailed first to Sidon (modern Lebanon) "because it was his native country," where he "was initiated into all the mysteries of Byblos and Tyre" before continuing to Egypt, where he "passed twenty-two years in the sanctuaries of temples, studying astronomy and geometry." Captured by Cambyses's soldiers, he was "carried off to Babylon" where "overjoyed" he "associated with the Magi who instructed him in their venerable knowledge." After twelve years in Babylon, "about the fifty-sixth year of his age, he returned to Samos."

This documented biography positions Pythagoras's knowledge as derivative of Egyptian and Babylonian learning rather than original Greek genius. Yet the myth persists—amplified by Nicomachus's second-century BCE legend of Pythagoras discovering harmonic ratios while walking past a blacksmith shop, hearing hammers produce octaves, fifths, and fourths. A story perpetuated as fact, legend, or uncritically repeated to this day.

Martin Bernal in *Black Athena* argues 18th-19th century Anglo-European scholars systematically fabricated ancient Greece as purely European origin story, erasing Egyptian and Phoenician influences. Philip Ewell terms the result the "white racial frame" of 20th century music theory. The impact extends beyond historiography: this supremacist positioning of Anglo-European music theory creates disproportionate labor for those working outside it, restricting imaginary possibilities and requiring constant confrontation with imposed frameworks.

Perhaps we should refer to Pythagoras of Sidon and Babylonian tuning.

### 1.4 Western Universalism as Epistemic Violence

Francis Bacon's 1620 assertion exemplifies epistemic colonialism: "The best division of human learning is that derived from the three faculties of the rational soul... Wherefore from these three fountains... there can be no others." The claim that "there can be no others" universalizes European knowledge frameworks while erasing other epistemologies.

Quijano identifies two founding myths of Eurocentrism: First, the idea of human civilization as trajectory departing from nature and culminating in Europe; second, viewing differences between Europe and non-Europe as natural (racial) differences rather than consequences of power history. These myths position European knowledge as advanced, universal, objective science while non-European knowledge becomes traditional, local, subjective belief.

Hany Rashwan critiques literary theory's similar operation in Arabic and ancient Egyptian studies: "The Euro-American growth of studying the AE culture was partly driven by a strong desire to explore Biblical narratives' validity... serving Biblical studies was one of the main motivations that lay behind the growth of Western interest in the civilizations of ancient Near Eastern disciplines in general." Scholarly "objectivity" masks religious and colonial motivations. Western frameworks position themselves as neutral analytical tools while actually serving particular theological and political agendas.

The colonial double bind in knowledge production: "Either African philosophy is so similar to Western philosophy that it makes no distinctive contribution and effectively disappears; or it is so different that its credentials to be genuine philosophy will always be in doubt." This applies across domains—is it "science" or "traditional knowledge"? "Medicine" or "folk healing"? "Music theory" or just "practice"? The categories themselves enforce hierarchy.

### 1.5 Transmodernity and Pluriversality

Enrique Dussel's transmodernity moves beyond both modernity and postmodernity to recognize that modernity is a planetary phenomenon to which "excluded barbarians" have contributed. Not succession (premodern → modern → postmodern) but co-constitution—liberation from modernity's exteriority rather than emancipation within its framework.

Mignolo's pluriversality: "A world where many worlds fit" (Zapatista motto). Not relativism, not multiple isolated universals, but a universal project of recognizing multiple rationalities, epistemologies, ontologies. Against Žižek's defense of "fundamental European legacy," Mignolo responds: "I no longer feel like enrolling in a new abstract universal project that claims a fundamental European legacy."

Applied to technology: not adding non-Western features to Western software, but questioning whether Western software architectures themselves encode particular ontologies that prevent genuine pluriversality. Can a system structured around Western music theory's fundamental categories (scales, harmonic progressions, measured rhythm) genuinely accommodate maqām theory? Or does accommodation require transformation of the system itself?

---

## Part II: Decolonial Computing as Theoretical Framework

### 2.1 Computing as Modern/Colonial Phenomenon

Syed Mustafa Ali provides the most comprehensive articulation of decolonial computing, synthesizing Charles Mills' oppositional critical race theory with Latin American decolonial scholarship:

"Computing is a modern/colonial phenomenon. Insofar as computing is a modern phenomenon, and modernity is founded upon and remains entangled with colonialism and its facilitating structural logics—what decolonial theorists refer to as 'coloniality'—then it might be that computing continues to bear the 'legacy systemic' traces of colonialism."

Not metaphor but structural analysis. If modernity remains entangled with colonialism, and computing is modern, then computing is colonial. This operates at multiple levels:

**Epistemological**: Computing privileges particular ways of knowing—quantification over qualitative understanding, formalization over contextual interpretation, universal categories over situated knowledge. The very notion that knowledge can be "encoded" assumes knowledge as discrete, transmissible units rather than embedded, embodied, relational understanding.

**Architectural**: System designs reflect their creators' cultural assumptions. MIDI's structure—128 discrete pitches per octave, triggered by key-on/key-off messages, organized around Western keyboard layout—encodes particular musical ontology. The protocol isn't neutral infrastructure awaiting diverse musical content; it's culturally specific framework imposing constraints on what music can be represented.

**Operational**: Default settings, template files, preset parameters—these aren't conveniences but ideological statements. When Ableton Live opens with 4/4 time signature, 120 BPM tempo, twelve-tone equal temperament tuning, it's not offering "blank slate with helpful starting point." It's positioning Western musical frameworks as natural, universal, default—while alternative frameworks become specialized, exotic, requiring explicit customization.

**Linguistic**: Programming languages, API documentation, error messages, user interfaces—computing operates almost exclusively in English, with occasional translations. The language barrier isn't just practical inconvenience but epistemological gate-keeping. Technical concepts developed in English carry cultural assumptions embedded in the language itself. When English lacks terms for non-Western musical concepts, those concepts become difficult to implement, document, discuss.

Ali's methodological requirement: "Practitioners and researchers adopting a decolonial computing perspective are required, at a minimum, to: Firstly, consider their geo-political and body-political orientation when designing, building, researching or theorizing about computing phenomena; and secondly, embrace the 'decolonial option' as an ethics, attempting to think through what it might mean to design and build computing systems with and for those situated at the peripheries of the world system."

### 2.2 Algorithmic Racism and Surveillance Colonialism

Ali extends decolonial analysis to critique of critical algorithm studies as remaining Eurocentric despite progressive intentions. He proposes "surveillance colonialism" over "surveillance capitalism" to foreground racialized-colonial rather than purely economic analysis.

The distinction matters. "Surveillance capitalism" positions data extraction as primarily economic exploitation—corporations monetizing user behavior, attention as commodity, platform labor. This captures important dynamics but obscures racial and colonial dimensions. "Surveillance colonialism" recognizes:

**Racialized targeting**: Facial recognition systems trained predominantly on white faces producing higher error rates for people of color. Not technical accident but consequence of whose bodies are deemed important to recognize accurately.

**Colonial extraction**: Data harvesting in Global South mirrors historical resource extraction—raw materials (user data) extracted from colonies (developing nations), processed in metropole (Silicon Valley), sold as finished products (targeted advertising, algorithmic services) back to colonies at markup.

**Imperial sovereignty**: Tech platforms exercise sovereign power in colonized territories—determining what content appears, what speech is allowed, what transactions occur—while formal governments have limited regulatory capacity.

This analysis reveals how racism and colonialism structure computing at fundamental level, not just as bias in particular algorithms but as organizing logic of the field.

### 2.3 Postcolonial Computing in HCI

Lilly Irani, Paul Dourish, Kavita Philip and colleagues established postcolonial computing in HCI, proposing four key analytical shifts:

**1. Generative models of culture**: Culture as dynamic, not taxonomic. Rejecting Hofstede's essentializing frameworks common in HCI that treat cultures as fixed sets of dimensions (individualism vs. collectivism, power distance, uncertainty avoidance). This taxonomic approach reifies stereotypes, assumes cultures are internally homogeneous, positions Western culture as unmarked norm against which others are measured.

**2. Development as historical program**: Recognizing colonial histories shaping "development" discourse in ICT4D (Information and Communication Technologies for Development). Development isn't neutral technical assistance but continuation of colonial "civilizing mission"—positioning Global South as lacking, needing intervention, requiring Western expertise and technology to "catch up."

**3. Uneven economic relations**: Persistent asymmetries from colonialism structure technology production and consumption. Hardware manufactured in Global South under exploitative labor conditions, software designed in Global North for Global North markets then exported, tech support outsourced to English-speaking formerly colonized nations, rare earth minerals for electronics extracted from conflict zones.

**4. Cultural epistemologies**: Different ways of knowing embedded in technology—HCI methods are not culturally universal. User research techniques, design methodologies, evaluation frameworks developed in Western contexts carry cultural assumptions about individual agency, privacy, ownership, progress that don't translate universally.

Dourish & Mainwaring's analysis of "ubicomp's colonial impulse" demonstrates how ubiquitous computing assumes universal deployability and replicates colonial logics of expansion. The overriding question "What might we build tomorrow?" blinds us to "questions of our ongoing responsibilities for what we built yesterday."

Lilly Irani's *Chasing Innovation* shows how "innovation" discourse in India renders development as entrepreneurship, sorting nations into innovators and others. Exposes cultural politics of high-tech work and Silicon Valley's global influence through hackathons and platform dependence.

Critical distinction: Postcolonial computing focuses on opening/transforming existing academic frameworks, while decolonial computing emphasizes epistemic delinking and thinking beyond Western epistemology entirely. Postcolonial works within the Western academy to challenge its assumptions; decolonial seeks to delink from those frameworks altogether.

### 2.4 Data Colonialism: Contemporary Appropriation Through Extraction

Nick Couldry & Ulises Mejias provide foundational theorization arguing data extraction parallels historic colonialism's function in appropriating resources for capital accumulation:

"Data colonialism combines the predatory extractive practices of historical colonialism with the abstract quantification methods of computing... Just as industrial capitalism would not have happened without the prior appropriation under historical colonialism of vast territories, their 'natural' resources and bodies, so we are today witnessing the first stage of another long-term double development: the colonial appropriation of life in general and its annexation to capital."

**Data relations**: New types of human relations enabling extraction of data for commodification. Not just economic transactions but social interactions, movement patterns, emotional responses, attention flows—all converted into extractable, commodifiable data.

**Social quantification sector**: Corporations capturing everyday acts and translating them into quantifiable data. Facebook doesn't sell advertising; it sells quantified human behavior patterns. Google doesn't provide free services; it extracts behavioral surplus for prediction markets.

**Naturalization of data capture**: How extraction is made to seem "just there" (like terra nullius). Terms of service positioned as inevitable rather than chosen arrangement. "If you're not paying for the product, you are the product" treated as natural law rather than deliberate business model.

**Data as raw material fiction**: "Data is the new oil" obscures appropriation. Oil exists in ground, waiting to be extracted. Data is produced through social relations, requiring infrastructure that shapes what data emerges. The "raw material" framing erases labor, social relations, power dynamics involved in data production.

"The result degrades life, first by exposing it continuously to monitoring and surveillance (through which data is extracted) and second by thus making human life a direct input to capitalist production."

The parallel to music: when platforms like Spotify extract listening data—what songs, when, how long, skip patterns, playlist creation—they're not just measuring existing behavior. They're creating infrastructure that produces particular kinds of data, shapes listening practices around platform affordances, and converts musical engagement into raw material for recommendation algorithms that further shape listening.

### 2.5 Algorithmic Colonialism: Control Through Digital Ecosystems

Abeba Birhane demonstrates how Western tech monopolies' control of African digital infrastructure shares characteristics with traditional colonialism, but driven by corporate agendas using "state-of-the-art algorithms" rather than military force:

"Algorithmic colonialism, driven by profit maximization at any cost, assumes that the human soul, behaviour, and action is raw material free for the taking. Knowledge, authority, and power to sort, categorize, and order human activity rests with the technologist, for which we are merely data producing 'human natural resources'."

Six features of digital colonialism (Toussaint Nothias):

**1. Unequal concentration of power** (economic, geographical): Five tech companies (Google, Amazon, Facebook, Apple, Microsoft) control vast majority of digital infrastructure, cloud computing, operating systems, browsers, social platforms. Power concentrated in Silicon Valley, Seattle, few other locations.

**2. Violence and harm** (hardware, software, infrastructure layers): From rare earth mining violence, to labor exploitation in hardware manufacturing, to algorithmic discrimination, to infrastructure vulnerabilities enabling surveillance and repression.

**3. Extraction** (data, labor, natural resources): User data extracted for profit, platform labor (content moderation, delivery drivers, warehouse workers) exploited through algorithmic management, natural resources extracted for hardware production.

**4. Dependency** (technological lock-in, market control): Platform effects create winner-take-all dynamics. Operating system dominance locks users into ecosystems. File formats, APIs, development tools create dependencies difficult to escape.

**5. Cultural imperialism** (one-size-fits-all, English default): Platforms designed for Western users exported globally. English assumed as universal language. Western cultural assumptions (individualism, privacy as individual right, copyright) embedded in architecture.

**6. Benevolence** (discourse of progress masking exploitation): "Connecting the world," "democratizing access," "empowering entrepreneurs"—rhetoric masks extraction and control. Facebook's Free Basics positioned as charitable giving internet access, actually creating walled garden routing all traffic through Facebook servers.

Michael Kwet's analysis: US multinationals exercise imperial control at the architecture level through monopolistic control of software, hardware, and network connectivity. "If South Africans integrate Big Tech products into their society, the United States will obtain enormous power over their economy and create technological dependencies that will lead to perpetual resource extraction."

---

## Part III: Applications to Music Technology

### 3.1 The Technical Architecture of Musical Colonialism

When critics argue "MIDI is Eurocentric," defenders respond "MIDI is just protocol—neutral infrastructure." Both miss the point. MIDI's relationship to musical colonialism operates through what José Claudio S. Castanheira terms "technocoloniality"—the standardized technical environment controlling both production mechanisms and creative flows, representing serious obstacle to diversity of sonic/musical manifestations.

Consider the facts: MIDI Tuning Standard (MTS)—ultra-high-resolution specification for tuning allowing both octave-repeating and non-octave-repeating tunings to resolution of 0.0061 of a cent—was ratified January 1992, later updated 1999. Developed with composers Robert Rich and Carter Scholz following Rich's personal lobbying of Dave Smith. MTS divides the octave into 196,608 equal parts, essentially covering all melodic needs of all musics from across the world (with maximum 128 notes).

The caveat: Due to the MIDI protocol not being compulsory in its entirety, any elements can be used or ignored. As MTS was included as part of rarely-used SysEx messages, it only ever found its way into limited hardware synthesizers, and some that use SysEx dropped MTS entirely.

Thirty years later, most commercial music software still doesn't implement MTS. Not because it's technically difficult—the specification exists, the math is straightforward, the processing overhead minimal. The reason: developers and manufacturers did not consider it important enough to include.

One could argue insufficient consumer demand, no market to exploit. This conclusion is unsatisfying, especially considering how developers' imagination led to technically complex timbral possibilities like FM synthesis, producing products like the Yamaha DX7 (first released 1983) which majorly influenced artists and led to large-scale production serving a market that the technologies themselves created.

**Wendy Carlos's 1987 vision**: On the cusp of this development, after releasing her complex tuning-focused album *Beauty in the Beast* (1986), Carlos published "Tuning: At the Crossroad" in *Computer Music Journal*, stating: "This is the first time instrumentation exists that is both powerful enough and convenient enough to make practical the notion: any possible timbre, in any possible tuning, with any possible timing, sort of a 'three T's of music.' That places us at a crossroads, to figure out just how to use all of this newly available control. And we'll discover that the three 'T's' are really tied together."

Carlos's perspective and her compositions—incredibly labor intensive at the time—clearly highlighted what seemed possible through emerging technologies, not only for herself but for music makers worldwide. The technology existed. The vision existed. The implementation didn't happen.

### 3.2 The Rhythm Parallel: Roger Linn and Meaningful Interface Design

A parallel scenario regarding *time* occurred with Roger Linn's LM-1 drum machine, followed by the MPC60 sampler/sequencer. Dan Charnas explicitly relates Linn's development to J Dilla's masterful approach to rhythm and groove, highlighting how forward-thinking design created possibilities for Dilla to find his artistic voice and influence many genres of African-American music and beyond.

Linn realized that recording users' real-time playing and better reflecting their timing required creating a finer grid: instead of sixteen divisions per measure, his new number was 192 per measure. When Linn designed the AKAI MPC60 (released 1989), he introduced a grid of 96 divisions per 1/4 note, equaling 384 divisions per measure.

However, the finer grid alone didn't allow J Dilla to transform hip-hop—it was how grid use was implemented: inclusion of playable pads on the main surface allowing users to play and record beats with far less quantization rather than programming them, the pads being an update to the original LM-1 concept and design.

The comparison to the MPC60 highlights the importance of design and interface. The technical capability (fine timing grid) existed in both cases—MIDI Tuning Standard for pitch, MPC timing resolution for rhythm. What differed was interface design. Linn created interface that made the capability musically accessible. MIDI manufacturers left MTS buried in SysEx messages without user-facing controls.

### 3.3 Scala Files and the Tokenization of Tuning

A major influence has been the Scala software and Scala file format, considered the "de facto standard" and most widely used for tuning dissemination across hardware and software devices. Due to the open-access Scala scale archive (over 5000 Scala files), many designers and developers implement tuning by allowing Scala file import without providing their own, avoiding inappropriate labeling but without dealing with the main problem.

Scala files, though human-readable and easily editable, rarely provide contextual information on how tunings should be used—many without sources or poorly cited. By contextual information: basic musicological details needed to enable meaningful interaction with content. Though an argument exists that it's not a digital file's role to teach complex musicology, a counter-argument poses that it's possible to deal with a fundamental musical element like tuning according to its own logics, rendering it meaningfully and providing path to entry rather than barrier.

One partial solution: the '.kbm' Keyboard Mapping file format defining which pitch classes of the tuning system relate to which keys on keyboard or piano roll. Another potential solution: AnaMark tuning file format '.tun' and its '.msf' variant containing multiple subsets. However, .kbm and .msf usage is not widely implemented or available, and none are included in the Scala scale archive.

Many software and hardware manufacturers have included tuning capabilities, often shipped with pre-loaded historical and modern tuning files from varied musical cultures—but presented as scales. When any tuning is loaded, it's impossible to know how it's supposed to be used. There's often no documentation on what these tunings/scales are, what their values are, or which keyboard note they should be played from. Maximum information found is short manual blurbs, usually trivial, with problematic naming.

Tunings are loaded and spread across the 12-tone piano keyboard/piano roll starting from Middle C/MIDI note 60, regardless of divisions number or logic of intended usage. Result: any loaded tuning immediately feels unusable outside exoticism or othering scope, rendering inclusion tokenistic and lacking meaningful interaction method, unlike Linn's MPC60 pads.

The tokenization operates at multiple levels. First, reducing tuning systems to Scala files—lists of interval ratios or cent values—strips away theoretical context, historical development, cultural practices, performance traditions. Second, presenting these decontextualized files as "world music scales" in software presets packages non-Western musics as consumable diversity—exotic flavors to sample rather than coherent musical systems with internal logic. Third, the interface design—loading files onto 12-tone keyboard layout—forces non-Western tuning systems to conform to Western instrumental paradigms.

This mirrors what Glissant would call filiative approach—laying things on a line to see and compare them to something else (twelve-tone equal temperament as reference)—rather than Relational method which requires practical understanding for details to be heard and observed. It represents markedly different worldview.

### 3.4 Default Settings as Colonial Violence

Kofi Agawu articulates the role of Christian Anglo-Germanic hymnody within the triangulation of "music, race and empire": "In domesticating hymns whose texts were originally in German or English for local consumption, melodies often disregarded the natural declamation of indigenous singing, imposed a regime of regular and symmetrical periodicity, and rode roughshod over the intonational contours prescribed by speech tones. All of this amounts to musical violence of a very high order, a violence whose psychic and psychological impacts remain to be properly explored."

Agawu's diagnosis echoes Fanon on colonialism's destruction: "Colonialism is not simply content to impose its rule upon the present and the future of a dominated country. Colonialism is not satisfied merely with holding a people in its grip and emptying the native's brain of all form and content. By a kind of perverse logic, it turns to the past of the oppressed people, and distorts it, disfigures and destroys it."

Agawu's commentary on tonality applies equally to tuning—a subtler element in music making. The "high order of musical violence" triangulated by Agawu is equally applicable to twelve-tone equal temperament (12EDO) and its related perspectives, disseminated since the late 19th century through supremacist Anglo-European musical and sonic theory, instruments, and modern technologies at the core of contemporary music making.

When Digital Audio Workstation opens with 12-tone equal temperament, 4/4 time signature, A=440Hz reference pitch—these aren't helpful defaults but ideological impositions. Tom Faber and Khyam Allami: "Unassuming as they may seem, these technologies are far from neutral. Like social media platforms, dating apps, and all data-driven algorithms, music production tools have the unconscious biases of their creators baked into their architecture. If a musician opens a new composition and they are given a 4/4 beat and equal tempered tuning by default, it is implied that other musical systems do not exist, or at least that they are of less value."

The violence operates through naturalization. Defaults appear as neutral starting points rather than choices. They position Western frameworks as universal, unmarked, standard—while alternatives become specialized, exotic, requiring explicit customization. This creates asymmetric labor: musicians working within Western frameworks receive infrastructure support; those working outside must constantly work around imposed limitations.

### 3.5 Tuning as Prism for Coloniality: The 1932 Cairo Congress

Arabic scholars and practitioners, working with Turkish and European counterparts at the 1932 Cairo Congress, were unable to reach consensus to unify the Arab tonality system into a specific series of intervals, while also refusing the imposition of a 24-EDO system. Though lamented by Europeans as detrimental to the "evolution and orchestration" of Arabic music, this can be read as an act of Relational and opaque resistance to colonial logics being implied.

The Congress proceedings reveal tensions between European desire for standardization—systematic, measurable, notatable—and Arab practitioners' insistence on preserving regional variations, performer flexibility, modal subtleties. European participants used sonomètre (monochord) measuring string length in centimeters rather than ratios, imposing particular approach to knowledge production.

Ultimately many colonial logics were either imposed on, adopted or inherited by Arabic music throughout the 20th century, evident in theory books from the second half of the 20th century: defining maqāmāt as scales, adoption of barely modified naïve staff notation, development of Eurocentric curricula, and most importantly impact on conceptualization and practice of tuning through music technology.

### 3.6 Alexander Ellis and the Cent: Filiative Measurement as Colonial Framework

The impact of Alexander Ellis's invention of the 'cent' as unit of pitch measurement, and perpetuation of his perspectives through both the cent and his translation of Helmholtz's *Die Lehre von den Tonempfindungen* (1863)/*On the Sensations of Tone*, reveals the epistemological stakes:

"When the 'interval numbers', that is the pitch numbers of two notes, have been found (or the 'interval ratio') it is necessary, in order to have a proper conception of the interval itself by comparison with a piano or other instrument tuned in intentionally equal temperament, to determine the number of cents or hundredths of an equal Semitone, in that interval."

Ellis's reason for creating cents was specifically to compare other tuning systems to 12EDO. Helmholtz's original German book uses ratios exclusively because the cents system hadn't been invented yet. Though valuable as unit and method, from a Glissantian perspective the cents system represents a filiative approach of laying things on a line to see and compare them to something else, rather than the Relational method of ratios which requires practical understanding for details to be heard and observed.

The impact of this filiation appears in almost all literature on tuning since Ellis's publication. With specific reference to Arabic music scholarship, it is found almost exclusively in all works by Arab and Anglo-European scholars—except Allāh Wīrdī—all of whom convert ratios from original manuscripts into cents without including original ratios in their publications.

This same Anglo-European filiative worldview was imposed on the 1932 Cairo Congress where all measurements and experiments were conducted on a sonomètre (monochord) using centimeters as measuring unit for string length rather than ratios.

The epistemological shift is subtle but profound. Ratios express relationships between pitches—3:2 for perfect fifth, 4:3 for perfect fourth. Understanding requires hearing these relationships, tuning intervals by ear, developing embodied knowledge of harmonic relationships. Cents express deviations from equal temperament—700 cents for perfect fifth (same as 12EDO), 702 cents for just perfect fifth (2 cents "out of tune"). Understanding requires calculators, measurements, comparison to reference standard.

Ratios are Relational—knowledge emerges through engagement with the system itself. Cents are filiative—knowledge derives from comparison to external standard. The choice of measurement system isn't technical detail but epistemological framework with political implications.

---

## Part IV: Critical Race Theory and Technology Studies

### 4.1 The New Jim Code and Algorithms of Oppression

Ruha Benjamin's "New Jim Code": "The employment of new technologies that reflect and reproduce existing inequities but that are promoted and perceived as more objective or progressive than the discriminatory systems of a previous era." Automation hides, speeds, and deepens discrimination while appearing neutral.

Safiya Umoja Noble's *Algorithms of Oppression* demonstrates how commercial search engines and platforms encode and amplify racial and gender hierarchies through algorithmic systems. Technology companies replicate "the power structures of the western countries where they are built, complete with all the sexism and racism that are built into those structures."

The material infrastructure connection: "Coltan, short for columbite-tantalite, is a mineral... needed for computers and electronics... the bloody 'conflict mineral' wars over its control—the rape, violence, and loss of human life involved—are largely invisible byproducts to digital tech users in the West."

Ihudiya Finda Ogbonnaya-Ogburu et al. adapt critical race theory for HCI:

"Racism is pervasive in everyday socio-technical systems... the HCI community is prone to 'interest convergence', where concessions to inclusion require benefits to those in power... the neoliberal underpinnings of the technology industry itself propagate racism."

**Interest convergence**: Inclusion only occurring when benefiting those in power—explains why diversity initiatives often fail to transform structures. When tech companies add "diverse" preset packs to software, they expand market reach while maintaining Western architectural dominance. Inclusion serves growth, not transformation.

### 4.2 White Supremacy Culture in Tech Spaces

Tema Okun's framework identifies 15 characteristics of white supremacy culture directly applicable to tech:

**Perfectionism**: "There is no relationship between perfectionism and excellence. Perfectionism is the belief that we can be perfect or perform perfectly. The question has to be asked: according to who?"

**Objectivity**: "The belief that there is such a thing as being objective or 'neutral'; the belief that emotions are inherently destructive, irrational, and should not play a role in decision-making."

**Worship of the Written Word**: "If it's not in a memo, it doesn't exist; if it's not grammatically 'correct,' it has no value; if it's not properly cited according to academic rules that many people don't know or have access to, it's not legitimate."

**Urgency**: "Makes it difficult to take time to be inclusive, encourage democratic and/or thoughtful decision-making, to think and act long-term... privileges those who process information quickly."

**Quantity Over Quality**: "Things that can be counted are more highly valued than things that cannot... little or no value attached to process in the internalized belief that if it can't be measured, it has no value."

Applications to tech: Urgency culture ("move fast and break things"), worship of code and documentation, objectivity myths in STEM claiming neutrality, quantity over quality in metrics-driven culture, individualism in "10x engineer" mythology.

Kelly Cross on engineering: "White supremacy has influenced engineering through the lens of violence... White supremacy is ingrained in engineering through both hidden epistemology (myth of meritocracy) and blatant racist behaviors of exclusion."

---

## Part V: Decolonial Methodologies for Practice

### 5.1 Linda Tuhiwai Smith: Research as Ceremony

Opening line of *Decolonizing Methodologies*: "The word itself, 'research', is probably one of the dirtiest words in the indigenous world's vocabulary."

Western research paradigms are "inextricably linked to European imperialism and colonialism." Research has served as tool of colonial administration, extracting data without benefit to communities while representing colonized as objects not subjects.

Kaupapa Māori research principles:
- Research by Māori, for Māori, with Māori
- Different epistemological tradition
- Anti-positivist stance
- Concerned with social justice
- Relevant to community
- Research should make positive difference

"We have a different epistemological tradition which frames the way we see the world, the way we organize ourselves in it, the questions we ask and the solutions we seek."

Applied to technology: Data sovereignty and control over research processes. When building systems working with cultural knowledge, who controls the data? Who decides what questions get asked? Who benefits from the technology? These aren't peripheral concerns but foundational requirements.

### 5.2 Arturo Escobar: Designs for the Pluriverse

**Ontological design principle**: "Design designs; that is, design designs other designs and these designs, in turn, design us." Every design action has implications for making of life.

**Autonomous design**: Eschewing commercial/modernizing aims for collaborative, place-based approaches. Design practice delinked from capitalist/modernist aims.

**18 propositions for pluriversalizing technology** (selection):

"Pluriversalizing technology needs to be approached from the premise that life is constituted by the radical interdependence of everything that exists"

"Pluriversalizing technology places in parentheses the modern notions of object and project, opening possibilities for non-object centered and non-projectual technological designing praxis"

"Pluriversalizing technology contributes to dismantle the mandate of masculinity that is at the core of the object-driven ontology of modernity. It practices a feminist and anti-racist politics that pragmatically privileges collective and communitizing modes of making and acting centered on care"

"Returning technology to being part of Life by placing it at the service of multiple ways of worlding, rather than leaving it in its dominating instance, is a clearer imperative today than ever before"

This final proposition captures the stakes: technology currently serves domination, world-making in service of capital accumulation and colonial expansion. Pluriversalizing technology requires returning it to service of Life—multiple ways of worlding, multiple ontologies, genuine pluriverse.

### 5.3 Kim TallBear: Turning the Gaze

Key methodological move: "Turning the gaze" from studying Indigenous peoples to studying white scientists and their knowledge practices.

"And then it struck me. Wait a minute, who cares what we think about genetic work? The real problem is what non-Native people think about it... So that's when I decided I'm actually an anthropologist of white people."

**Indigenous STS**: "Refuses the purported divide between scientific and Indigenous knowledges, yet it does not conflate knowledge traditions. It understands them as potentially sharing methods while deriving in practice from different worldviews."

Applied to music technology: Instead of studying how Arabic music could be represented in Western software, study Western software and its epistemological assumptions. What worldview does DAW architecture encode? What ontology of music does MIDI protocol assume? What does it mean that music technology development happens almost exclusively in Silicon Valley, Europe, Japan?

### 5.4 Sandra Harding: Standpoint Epistemology

"In feminist hands, the standpoint strategy directed researchers to begin thinking about any and every project from the standpoint of women's lives instead of from the conceptual frameworks of research disciplines or of the social institutions that such disciplines serve."

**Epistemic modernization**: "The process by which the agendas, concepts, and methods of scientific research are opened up to the scrutiny, influence, and participation of users, patients, nongovernmental organizations (NGOs), social movements, ethnic minority groups, women and other social groups that represent perspectives on knowledge that may be different from those of economic and political elites and those of mainstream scientists."

Practical implications: Start from marginalized standpoints when designing technology. Question whose knowledge is privileged. Document counter-histories. Create participatory structures for technology governance.

Applied to maqām archive: Begin from standpoint of Arab musicians confronting Western music software, not from standpoint of Western developers adding "world music" features. What does software architecture look like designed from Arabic maqām theory as foundation rather than extension?

### 5.5 Pluriversal Technologies Framework

Paola Velasco-Herrejón, Thomas Bauwens, and Martin Calisto Friant define pluriversal technologies: "Technologies that embrace ontological and epistemological diversity by being co-designed, co-produced and co-owned by the inhabitants of the socio-cultural territory in which they are embedded."

Three core components:

**Co-design**: Design practices where all human and more-than-human forms of knowledge considered equal; democratically combined for socio-ecological well-being; using low-tech, modular, repairable, locally-sourced technologies

**Co-production**: Decentralized production preserving local sociocultural practices; can be built, operated, maintained locally; collaborative production; prioritize self-sufficiency in basic needs

**Co-ownership**: Communal control and collective governance; inclusive democratic decision-making; recognition of Mother Nature's rights; open-source knowledge; social and solidarity economies

Example: Achuar Solar Canoes in Ecuadorian Amazon—solar-powered canoes combining Indigenous boat designs with solar technology; co-designed by Achuar people with engineers; locally built; community co-owned; open-source patents; sustainable transport for 9 communities, 1200 people along 67km of river.

Applied to software: Not "designed for Arab musicians" but "co-designed with Arab musicians." Not open-source code maintained by Western developers but shared ownership and governance. Not adding Arabic music features to Western DAW but creating architecture that can accommodate multiple musical ontologies.

---

## Part VI: Toward Decolonial Music Technology

### 6.1 What Decolonization Demands

Luis Chávez & Nomi Skelchy argue against using "decolonization" as metaphor in ethnomusicology:

"Decolonization demands a level of political engagement different from other social justice projects... refers to a radical transformation in relations of power, worldviews, and, in an academic context, our role as scholars and our relationship to the university system as an industry."

Linda Tuhiwai Smith: "Decolonization, once viewed as the formal process of handing over the instruments of government, is now recognized as a long-term process involving the bureaucratic, cultural, linguistic and psychological divesting of colonial power."

Classification systems in ethnomusicology stem from colonial comparative musicology. "The impulse to theorize in ethnomusicology has contributed to the abstraction of decolonization from practical applications." Need for collaborative, co-authored projects that decenter researcher as "all-knowing specialist."

Robin Attas uses analytical sketches of A Tribe Called Red's music to critique "white colonial Eurocentric norms of music analysis as currently practiced in music theory." Demonstrates how analytical tools and theoretical frameworks (often encoded into software) perpetuate colonial norms.

### 6.2 Beyond Tokenism: The Leimma and Apotome Example

Having articulated theoretical critiques, Leimma and Apotome demonstrate practical implementation of decolonial design principles. Browser-based tools developed by Khyam Allami in collaboration with Counterpoint Studio (Tero Parviainen and Samer Ghadry), these address technical and epistemological problems documented above.

**The Historical Tools Argument**: "Seeing that the ancient Babylonians could explore complex notions and associations of tuning with a nine-stringed harp and explain them on a small clay tablet in Cuneiform, or that the ancient Chinese could explore such ideas with the simple method of adding and removing thirds from bamboo pipes, or that the Greeks could do the same with a monochord and Arab theorists with the oud, it baffled me that such simple pragmatic tools were not available using modern 21st century technologies."

This positions modern music technology as *regressive* compared to ancient tools in terms of cultural inclusivity and pedagogical clarity. If Babylonians in 2000 BCE could document complex tuning systems on clay tablets, contemporary digital tools should exceed rather than restrict this capability.

**Choice as Default**: Leimma's fundamental design principle—"choice being the default proposition, as opposed to presenting a flat default state that the user would then customise." This inverts the standard DAW paradigm where 12EDO tuning, 4/4 time, and A=440Hz reference pitch are imposed defaults requiring customization.

Three-stage interface follows dimensionality principle:
- **Point** (zero dimensions): User selects reference pitch—any MIDI note assigned any Hz value
- **Line** (one dimension): Octave as ruler; divisions inputted as ratios, cents, or experimentally by clicking/dragging
- **Circle** (two dimensions): Tuning system as wheel; segments mapped to MIDI notes with visual root/tonic distinction

This progression "inspire[s] agency in the user" through sequential choices rather than customization of imposed defaults. The morphing animations between pages reinforce the metaphor pedagogically.

**Indigenous Practice Informing Technical Architecture**: The reference pitch selection is "inspired by maqāmic ensemble practice wherein a singer would decide which maqām is to be performed and on which istiqrār (grounding pitch), and would then decide what that pitch should be in order for the remaining instruments to tune to it as a reference."

The technical architecture embeds indigenous musical practice rather than imposing Western concert pitch (A=440Hz) as fixed default. This exemplifies Escobar's principle that "design designs"—the tool's architecture enacts particular ontologies and privileges particular epistemologies.

**Glissantian Giving-On-And-With in Practice**: "In the spirit of Glissantian giving-on-and-with, I did not want to centre, or only cater for, the maqām tradition that my work revolves around. Instead I was interested in the challenge of creating transcultural tools that would address musical cultures equally, and provide intuitive access to tuning exploration for musicians, composers, researchers and educators."

This operationalizes Glissant's Relation theory: not privileging one system (even the developer's own) but creating blank slate enabling multiple musical ontologies. The tool's transcultural ambition refuses the colonial binary of "us" vs. "them"—it serves the pluriverse.

**Apotome: Generative Environment Bypassing Learned Habits**: "The reason behind choosing to create a generative environment, as opposed to a sequencer, was to provide a means for making music outside of cultural conventions and personal melodic preferences. It is a tool to inspire experimental ideas and stimulate the imaginary, as much as it is a standalone creative platform."

The generative approach bypasses learned Western melodic habits, enabling genuine exploration of unfamiliar tuning systems. Probabilistic parameters adjusted via sliders create music that neither composer nor listener could predict from their culturally-trained expectations.

**Ethical Data Practice**: "Counterpoint and I decided early on not to collect any data other than what was necessary for functionality. This was part of a respectful privacy policy."

This rejects the surveillance capitalism / data colonialism model standard in music software. Contrast to typical commercial DAWs that harvest usage data, behavioral analytics, and increasingly integrate AI systems trained on user-generated content without compensation.

The project demonstrates feasibility of decolonial computing in practice—showing that "blank slate approach," "repatriation of power," and "epistemological transformation" are not abstract ideals but achievable design goals.

### 6.3 The Question Technology Cannot Answer

Robin James in *The Sonic Episteme* examines 21st century sound conceptions and ways they support white supremacist and capitalist patriarchy. In concluding arguments, James notes skepticism toward the idea that: "sound or sounds can be a model for revolutionary ontologies and epistemologies that completely eradicate ongoing relations of domination. First, these relations are systemic, and completely revolutionising those relations means revolutionising the systems that rest on them—and this involves more than just changing the object or mode of our theorising."

This captures essential limitation: technology alone cannot decolonize. Leimma and Apotome, for all their theoretical sophistication and design elegance, operate within systems of platform capitalism, digital infrastructure controlled by global tech monopolies, academic-artistic institutions shaped by colonial histories. Creating blank slate tuning tools doesn't transform economic relations, doesn't redistribute power, doesn't repair historical violence.

Yet technology matters. Not because it can revolutionize systems, but because it shapes possibilities. Default settings determine what's easy and what requires effort. Interface design determines who can participate. Architectural choices determine what knowledge systems can be represented. These aren't peripheral concerns but material conditions structuring cultural production.

The question isn't whether technology can decolonize—it cannot. The question is whether those building technology will recognize their complicity in ongoing colonialism and make different choices. The question is whether institutions funding technology development will support pluriversal designs or continue privileging colonial architectures. The question is whether musicians, composers, and listeners will demand transformation or accept tokenistic inclusion.

Decolonization requires wholesale transformation of relations of power, worldviews, and institutional structures. Technology is one site of struggle among many. But it's the site we're working in, and its stakes are real: whose knowledge systems survive into the future, whose musical ontologies find computational representation, whose ways of worlding receive infrastructural support.

---

## Part III: Technocoloniality in Music Software Practice

### 3.1 Default Settings as Colonial Imposition

When users open software and receive 4/4 time, 12-TET tuning, and A=440Hz without choice, it implies that other musical systems either do not exist or are of less value. These defaults are not neutral technical choices but encode specific cultural assumptions about what constitutes "normal" music making.

### 3.2 MIDI Tuning Standard: Thirty Years of Willful Neglect

MTS specification ratified January 1992, developed with composers Robert Rich and Carter Scholz following Rich's personal lobbying of Dave Smith. Allows ultra-high-resolution tuning (0.0061 cent resolution, essentially dividing the octave into 196,608 equal parts) for both octave-repeating and non-octave-repeating systems. Covers all melodic needs of all musics from across the world with maximum 128 notes.

**The caveat**: Due to MIDI protocol not being compulsory in its entirety, any elements can be used or ignored. As MTS was included as part of rarely-used SysEx messages, it only ever found its way into limited hardware synthesizers, and some that use SysEx dropped MTS entirely.

**No single reason explains** why MTS was not more widely adopted. Conclusion: developers and manufacturers did not consider it important enough to include. Due to capitalist supply and demand nature of the still-emerging music technology market, MTS likely lacked sufficient consumer demand and therefore no market to exploit.

This conclusion is unsatisfying, especially considering how developers' imagination led to technically complex timbral possibilities like FM synthesis, producing products like the Yamaha DX7 (first released 1983) which majorly influenced artists and led to large-scale production serving a market that the technologies themselves created.

### 3.3 Wendy Carlos's 1987 Vision Unfulfilled

On the cusp of MTS development, after releasing her complex tuning-focused album *Beauty in the Beast* (1986), Carlos published "Tuning: At the Crossroad" in *Computer Music Journal*, stating:

"This is the first time instrumentation exists that is both powerful enough and convenient enough to make practical the notion: any possible timbre, in any possible tuning, with any possible timing, sort of a 'three T's of music.' That places us at a crossroads, to figure out just how to use all of this newly available control. And we'll discover that the three 'T's' are really tied together."

Carlos's perspective and her compositions—incredibly labor intensive at the time—clearly highlighted what seemed possible through emerging technologies, not only for herself but for music makers worldwide. To date, no single reason explains why this vision was not realized.

### 3.4 Contrast: Roger Linn and Meaningful Interface Design

A similar scenario regarding *time* occurred with Roger Linn's LM-1 drum machine, followed by the MPC60 sampler/sequencer. Linn realized that recording users' real-time playing and better reflecting their timing required creating a finer grid: instead of sixteen divisions per measure, his new number was 192 per measure. When Linn designed the AKAI MPC60 (released 1989), he introduced a grid of 96 divisions per 1/4 note, equaling 384 divisions per measure.

However, the finer grid alone didn't allow J Dilla to transform hip-hop—it was how grid use was implemented: inclusion of playable pads on the main surface allowing users to play and record beats with far less quantization rather than programming them. The pads were an update to the original LM-1 concept and design.

The comparison to the MPC60 highlights the importance of design and interface. The question then: is technology itself the problem, or the remnants of colonial logics perpetuating such problems?

### 3.5 Scala Files and the Tokenization of Tuning

A major influence has been the Scala software and Scala file format, considered the "de facto standard" and most widely used for tuning dissemination across hardware and software devices. Due to the open-access Scala scale archive (over 5000 Scala files), many designers and developers implement tuning by allowing Scala file import without providing their own, avoiding inappropriate labeling but without dealing with the main problem.

Scala files, though human-readable and easily editable, rarely provide contextual information on how tunings should be used—many without sources or poorly cited. By contextual information: basic musicological details needed to enable meaningful interaction with content.

One partial solution: the '.kbm' Keyboard Mapping file format defining which pitch classes of the tuning system relate to which keys on keyboard or piano roll. Another potential solution: AnaMark tuning file format '.tun' and its '.msf' variant containing multiple subsets. However, .kbm and .msf usage is not widely implemented or available, and none are included in the Scala scale archive.

Many software and hardware manufacturers have included tuning capabilities, often shipped with pre-loaded historical and modern tuning files from varied musical cultures—but presented as scales. When any tuning is loaded, it's impossible to know how it's supposed to be used. There's often no documentation on what these tunings/scales are, what their values are, or which keyboard note they should be played from.

Tunings are loaded and spread across the 12-tone piano keyboard/piano roll starting from Middle C/MIDI note 60, regardless of divisions number or logic of intended usage. Result: any loaded tuning immediately feels unusable outside exoticism or othering scope, rendering inclusion tokenistic and lacking meaningful interaction method, unlike Linn's MPC60 pads.

### 3.6 The Repressed Possibilities

This highlights repressed possibilities existing within myriad musical cultures precisely because of perpetuation of such asymmetries, and how technologies continue imposing compromise while supposedly democratizing access to them and to individual expression afforded through them.

Jose Claudio S. Castanheira has highlighted "technocoloniality": "the standardized technical environment, controlling both production mechanisms and creative flows, represents a serious obstacle to diversity of sonic/musical manifestations. The globalized structure of sound production processes favors a specific type of commodity, stimulating its circulation on large scale as a demand of late capitalism, within vertically defined parameters of transnational conglomerates. Peripheral or DIY practices are, by several means, put aside, attacked or absorbed by mainstream technical solutions."

Robin James's *Sonic Episteme* (2019) examines 21st century sound conceptions and ways they support white supremacist and capitalist patriarchy: "sound or sounds can be a model for revolutionary ontologies and epistemologies that completely eradicate ongoing relations of domination. First, these relations are systemic, and completely revolutionising those relations means revolutionising the systems that rest on them—and this involves more than just changing the object or mode of our theorising."

### 3.7 The 1932 Cairo Congress: Colonial Resistance Through Opacity

Arabic scholars and practitioners, working with Turkish and European counterparts, were unable to reach consensus to unify the Arab tonality system into a specific series of intervals, while also refusing the imposition of a 24-EDO system. Though lamented by Europeans as detrimental to the "evolution and orchestration" of Arabic music, this can be read as an act of Relational and opaque resistance to colonial logics being implied.

Ultimately many of these logics were either imposed on, adopted, or inherited by Arabic music throughout the 20th century, evident in theory books from the second half of the 20th century: defining maqāmāt as scales (Al-Hilu 1961, Abbās 1986), adoption of barely modified naïve staff notation (Ghoṣn 1984, Al-Rejab 1985), development of Eurocentric curricula (Farah 2006), and most importantly impact on conceptualization and practice of tuning through music technology.

**Little-known Arab scholarship**: The Syrian Mikhā'īl Allāh Wīrdī's *The Philosophy of Oriental Music* (1949) provides one of the most extensive modern overviews of tuning in Arabic, including a unique proposition for an alternative staff notation system. The Egyptian Youssef Shawki's *Measuring the Arabic Music Scale* (1969) reviews Arabic tuning between 1894 and 1969, subdivided into three parts: before the 1932 Cairo Congress, the proceedings, and after the Congress to 1969.

### 3.8 Alexander Ellis and the Cent: Filiative Measurement as Colonial Framework

The impact of Alexander Ellis's invention of the 'cent' as unit of pitch measurement, and perpetuation of his perspectives through both the cent and his translation of Helmholtz's *Die Lehre von den Tonempfindungen* (1863)/*On the Sensations of Tone*, reveals the epistemological stakes:

"When the 'interval numbers', that is the pitch numbers of two notes, have been found (or the 'interval ratio' [...]) it is necessary, in order to have a proper conception of the interval itself by comparison with a piano or other instrument tuned in intentionally equal temperament, to determine the number of cents or hundredths of an equal Semitone, in that interval."

Ellis's reason for creating cents was specifically to compare other tuning systems to 12-EDO. Helmholtz's original German book uses ratios exclusively because the cents system hadn't been invented yet.

Though valuable as unit and method, from a Glissantian perspective the cents system represents a filiative approach of laying things on a line to see and compare them to something else, rather than the Relational method of ratios which requires practical understanding for details to be heard and observed. It is a markedly different worldview.

The impact of this filiation appears in almost all literature on tuning since Ellis's publication. With specific reference to Arabic music scholarship, it is found almost exclusively in all works by Arab and Anglo-European scholars—except Allāh Wīrdī—all of whom convert ratios from original manuscripts into cents without including original ratios in their publications.

This same Anglo-European filiative worldview was imposed on the 1932 Cairo Congress where all measurements and experiments were conducted on a sonomètre (monochord) using centimeters as measuring unit for string length rather than ratios.

### 3.9 Kofi Agawu on Musical Violence

In his study "Tonality as a Colonizing Force in Africa," Ghanaian scholar Agawu articulates the role of Christian Anglo-Germanic hymnody within the triangulation of "music, race and empire":

"In domesticating hymns whose texts were originally in German or English for local consumption, melodies often disregarded the natural declamation of indigenous singing, imposed a regime of regular and symmetrical periodicity, and rode roughshod over the intonational contours prescribed by speech tones. All of this amounts to musical violence of a very high order, a violence whose psychic and psychological impacts remain to be properly explored."

Agawu's diagnosis echoes Fanon on colonialism's destruction: "Colonialism is not simply content to impose its rule upon the present and the future of a dominated country. Colonialism is not satisfied merely with holding a people in its grip and emptying the native's brain of all form and content. By a kind of perverse logic, it turns to the past of the oppressed people, and distorts it, disfigures and destroys it" (Fanon 1963: 210).

Agawu's commentary on tonality applies equally to tuning—a subtler element in music making. The "high order of musical violence" triangulated by Agawu is equally applicable to twelve-tone equal temperament (12-EDO) and its related perspectives, disseminated since the late 19th century through supremacist Anglo-European musical and sonic theory, instruments, and modern technologies at the core of contemporary music making.

---

## Conclusion: Computing Otherwise

The theoretical frameworks assembled here converge on single insight: computing as currently practiced perpetuates colonialism not through individual bias but through structural logic. The choice of programming paradigms, database architectures, interface conventions, default settings—these technical decisions encode epistemological assumptions with political consequences.

Recognizing computing as modern/colonial phenomenon doesn't mean rejecting all technology. It means understanding technology's entanglement with power and working to build otherwise. It means starting from marginalized standpoints rather than dominant frameworks. It means treating Western knowledge systems as provincial rather than universal. It means designing for pluriverse rather than singular universal.

For those building music technology: Default settings are ideological statements. Classification systems encode worldviews. Interface metaphors privilege particular ways of knowing. These aren't bugs to fix but fundamental architectural choices requiring transformation.

For those working with Arabic maqām theory: Western music theory is not neutral analytical framework. Twelve-tone equal temperament is not natural reference standard. Staff notation is not universal representation. Cents are not objective measurements. These are culturally specific tools that can be used—but must be recognized as such.

The work continues. Each design decision offers choice: replicate colonial patterns or build differently. Each default setting enforces values: whose music becomes easy, whose requires effort. Each architectural choice enables possibilities: which knowledge systems find representation, which remain unrepresentable.

As Escobar reminds us: "Returning technology to being part of Life by placing it at the service of multiple ways of worlding, rather than leaving it in its dominating instance, is a clearer imperative today than ever before."

This is the work of decolonial computing—creating technologies that serve the pluriverse, not colonial expansion.

---

## Essential Sources

### Foundational Theory

- Quijano, Aníbal. (2000). "Coloniality of Power, Eurocentrism, and Latin America." *Nepantla: Views from South*, 1(3), 533-580.
- Mignolo, Walter D. (2007). "Delinking: The Rhetoric of Modernity, the Logic of Coloniality and the Grammar of De-coloniality." *Cultural Studies*, 21(2-3), 449-514.
- Grosfoguel, Ramón. (2007). "The Epistemic Decolonial Turn." *Cultural Studies*, 21(2-3), 211-223.
- Dussel, Enrique. (2000). "Europe, Modernity and Eurocentrism." *Nepantla: Views from South*, 1(3), 465-478.

### Decolonial Computing

- Ali, Syed Mustafa. (2016). "A Brief Introduction to Decolonial Computing." *XRDS*, 22(4), 16-21.
- Ali, Syed Mustafa. (2017). "Decolonizing Information Narratives." *Proceedings*, 1(3), article 50.
- Mohamed, Shakir, Marie-Therese Png, and William Isaac. (2020). "Decolonial AI." *Philosophy & Technology*, 33(4), 659-684.
- Irani, Lilly, et al. (2010). "Postcolonial Computing." *CHI 2010 Proceedings*, 1311-1320.

### Data and Algorithmic Colonialism

- Couldry, Nick and Ulises Mejias. (2019). *The Costs of Connection: How Data Is Colonizing Human Life and Appropriating It for Capitalism*. Stanford University Press.
- Birhane, Abeba. (2023). "Algorithmic Colonization of Africa." In *Imagining AI*, 247-264. Oxford University Press.
- Kwet, Michael. (2019). "Digital Colonialism: US Empire and the New Imperialism." *Race & Class*, 60(4), 3-26.

### Critical Race and Technology

- Benjamin, Ruha. (2019). *Race After Technology: Abolitionist Tools for the New Jim Code*. Polity Press.
- Noble, Safiya Umoja. (2018). *Algorithms of Oppression*. NYU Press.
- Ogbonnaya-Ogburu, Ihudiya Finda, et al. (2020). "Critical Race Theory for HCI." *CHI 2020*.

### Music and Decolonial Practice

- Allami, Khyam. (2022). "Échos-monde: Towards a Hybrid Repertoire." PhD thesis, Birmingham City University.
- Agawu, Kofi. (2016). "Tonality as a Colonizing Force in Africa." In *Audible Empire*, 334-355. Duke University Press.
- Ewell, Philip. (2020). "Music Theory and the White Racial Frame." *Music Theory Online*, 26(2).
- Chávez, Luis and Nomi Skelchy. (2019). "Decolonization for Ethnomusicology." *Action, Criticism, and Theory for Music Education*, 18(3), 115-143.

### Methodologies

- Smith, Linda Tuhiwai. (2012). *Decolonizing Methodologies: Research and Indigenous Peoples*. 2nd ed. Zed Books.
- Escobar, Arturo. (2018). *Designs for the Pluriverse*. Duke University Press.
- TallBear, Kim. (2013). *Native American DNA*. University of Minnesota Press.
- Harding, Sandra (ed.). (2011). *The Postcolonial Science and Technology Studies Reader*. Duke University Press.

### Music Theory History

- Bernal, Martin. (1987). *Black Athena: The Afroasiatic Roots of Classical Civilization*. Rutgers University Press.
- Mirelman, Sam. (2013). "The Ala-Instrument: Its Identification and Role." *Iraq*, 75, 43-71.
- Kilmer, Anne Draffkorn. (2019). "The Musical Texts." In *Mesopotamia: The World Earliest Civilization*, 465-482.

### Technology Studies

- Chun, Wendy Hui Kyong. (2011). *Programmed Visions: Software and Memory*. MIT Press.
- Bratton, Benjamin H. (2015). *The Stack: On Software and Sovereignty*. MIT Press.
- James, Robin. (2019). *The Sonic Episteme*. Duke University Press.

---

*This document synthesizes theoretical frameworks from the enhanced research report "Decolonial Computing, Postcolonial Technology Studies, and Anti-Colonial Frameworks: A Comprehensive Research Report." For complete citations and extended analysis, consult the full report.*
