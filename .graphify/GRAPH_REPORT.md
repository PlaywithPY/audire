# Graph Report - .  (2026-06-01)

## Corpus Check
- 306 files · ~408,723 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1172 nodes · 1473 edges · 161 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 856 · imports_from: 260 · imports: 157 · calls: 127 · references: 44 · method: 20 · rationale_for: 4 · semantically_similar_to: 3 · conceptually_related_to: 1 · implements: 1


## Input Scope
- Requested: undefined
- Resolved: undefined (source: undefined)
- Included files: 306 · Candidates: recursive
- Excluded: undefined untracked · 0 ignored · 4 sensitive · undefined missing committed
## God Nodes (most connected - your core abstractions)
1. `authOptions` - 21 edges
2. `showStatus()` - 16 edges
3. `requireAuth()` - 15 edges
4. `EmailService` - 14 edges
5. `updateFile()` - 11 edges
6. `getFile()` - 8 edges
7. `loadAllContent()` - 8 edges
8. `sendSMSFromTemplate()` - 8 edges
9. `handleLogin()` - 7 edges
10. `useCentre()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Centre Audire Legacy Logo (Black/Gold with Ear and Heartbeat)` --semantically_similar_to--> `Centre Audire Public Logo (Black/Gold with Ear and Heartbeat)`  [EXTRACTED] [semantically similar]
  LEGACY 1.0/images/logo.png → public/images/logo.png
- `Homepage (index.html)` --references--> `Header Component`  [INFERRED]
  LEGACY 1.0/index.html → LEGACY 1.0/components/header.html
- `Mentions Légales Page` --references--> `css/styles.css`  [EXTRACTED]
  LEGACY 1.0/mentions-legales/index.html → LEGACY 1.0/index.html
- `Merci (Thank You) Page` --references--> `Header Component`  [EXTRACTED]
  LEGACY 1.0/merci/index.html → LEGACY 1.0/components/header.html
- `Footer Component` --references--> `Mentions Légales Page`  [EXTRACTED]
  LEGACY 1.0/components/footer.html → LEGACY 1.0/mentions-legales/index.html

## Hyperedges (group relationships)
- **Admin Authentication System** — src_lib_auth, src_lib_auth_helpers, src_app_api_auth_nextauth_route [EXTRACTED 1.00]
- **Editable Texts System** — getpagetexts_function, src_lib_page_texts, admin_text_editor, scripts_populate_page_texts [EXTRACTED 0.95]
- **Google Calendar RDV Integration** — fix_calendar_404, fix_oauth_403 [INFERRED 0.85]
- **Legacy Pages Share css/styles.css** — legacy_homepage, legacy_contact_page, legacy_faq_page, legacy_notre_accompagnement_page, legacy_partenaires_pharmaciens_page, legacy_mentions_legales_page, audire_css_styles [EXTRACTED 1.00]
- **Admin Interface Alternatives (Decap CMS vs Admin Simple)** — legacy_admin_index, legacy_admin_simple_index [EXTRACTED 1.00]
- **Editable Content JSON Files** — legacy_admin_simple_index, legacy_editeur_page [EXTRACTED 0.90]
- **Sprint 5.8: New Editable Fields on HearingAid** — sprint58_md, prisma_patch_md [EXTRACTED 1.00]
- **Database Configuration Documentation** — setup_database_md, solution_resumee_md, vercel_deployment_guide_md, vercel_env_setup_md [EXTRACTED 0.95]
- **Legacy Solutions Auditives Sub-pages** — legacy_solutions_auditives_page, legacy_contour_oreille_page, legacy_intra_auriculaire_page, legacy_oticon_intent_page, legacy_solution_1772009311933, legacy_solution_1772028108569 [INFERRED 0.85]
- **Centre Audire Brand Identity Assets** — legacy_logo_png, public_logo_png, public_apple_icon_png, public_apple_icon_svg, public_favicon_svg, public_icon_svg [INFERRED 0.90]
- **Audire Clinical Service Marketing Images** — public_hearing_test_jpg, public_human_support_jpg, public_personalized_followup_jpg [INFERRED 0.85]
- **Oticon Product and Marketing Presence** — legacy_oticon_intent_png, public_oticon_couple_jpg [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (24): GET(), prisma, prisma, AppointmentRequestEmailOptions, EmailService, generateICS(), PrescriptionEmailOptions, CalendarEvent (+16 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (40): addLink(), addSolution(), clearToken(), CONFIG, createLinkItem(), createOrUpdateHTMLFile(), generateAllPages(), generateHTMLPage() (+32 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (22): HALF_WIDTH, TEXTAREA_FIELDS, IconKey, IconPreview(), isImageValue(), ROWS, toLucideName(), buildSections() (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (12): ImagePositions, parseImagePositions(), parseSectionExtras(), SectionExtras, StatCard, ContentBlockInspector(), countItemsForBlock(), FieldGroup() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (3): contentBlocks, requireAuth(), defaultCardImages

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (4): prisma, prisma, authOptions, handler

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (17): $all(), cancelBtn, closeBtn, data, HeaderScroll, initOpenStatus(), initSmoothScroll(), isOpen (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (16): Advantage, DevicePageRenderer(), DevicePageRendererProps, FAQ, safeParse(), BLOCKS, focalToObjectPosition(), GalleryMetadata (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (6): IncomingAccessory, ContentBlockProps, findFreeSlug(), POST(), globalForPrisma, GET()

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (13): MAX_W_OPTIONS, Props, ALIGN, BlockLayout, BlockLayoutWrapper(), cache, inflight, layoutToClasses() (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (10): Category, CategoryGridProps, FAQ, ContentBlock, DynamicBlockRendererProps, FAQAccordionProps, FAQItem, Category (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (16): Accessory, BlockDef, BlockId, BlockVisibility, CONTENT_BLOCK_TYPES, ContentBlockType, ContentBlockTypeDef, DEFAULT_HERO_BADGES (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (15): accompagnementPageStructure, contactPageStructure, ContentField, ContentFieldType, faqPageStructure, getAllPageStructures(), getPageStructure(), homePageStructure (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (11): badgeStyle(), Entry, Group, IconType, IsActive, Leaf, LEGACY_ITEMS, NavLeaf() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (7): Block, BlockShell(), MARGIN_CLS, parseMeta(), Props, RADIUS_CLS, WIDTH_CLS

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (10): BLOCK_ICONS, BLOCK_TYPES, blockContentPreview(), ContentBlock, DEFAULT_CONTENT, FAQ, FAQCategory, Page (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.16
Nodes (11): BlockInspector(), Category, ICON, LABEL, Mode, parseBlockKey(), Props, shouldUseRichEditor() (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (6): BlockTypeOption, OPTIONS, Props, Props, PageTexts, PageTexts

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (3): ImageEffect, Props, PageTexts

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (7): Block, DynamicBlockInspector(), parseMeta(), POSITION_PRESETS, Props, TYPE_LABELS, Props

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (7): daysOfWeek, Centre, CentreContext, CentreContextType, CentreProvider(), OpeningHour, useCentre()

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (5): ImageFeatureCardProps, CardData, PageTexts, STEPS, PageTexts

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (4): inter, metadata, playfair, ThemeProvider()

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (6): DEFAULTS, DeviceLink, Form, PickerTarget, Solution, SolutionDefault

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (6): ContentBlock, VisualPageBuilderProps, BLOCK_TYPES, ContentBlock, DEFAULT_CONTENT, PREDEFINED_PAGES

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (4): CardData, HomeTexts, Testimonial, TextField

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (11): css/styles.css, Footer Component, Header Component, Modal RDV Component, Contact Page, FAQ Page, Homepage (index.html), Mentions Légales Page (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (7): GET(), CardImage, CardGroup, getAllPages(), getDefaultCardsForPage(), PAGE_CARDS, PageCardsDefinition

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (9): Admin Text Editor /admin/text-editor, Database Setup Documentation, getPageTexts() Function, Guide Migration Textes Éditables, PageDefinition, pageDefinitions, prisma/schema.prisma, scripts/populate-page-texts.ts (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.20
Nodes (4): FeaturedProduct, PageTexts, HeroClassicProps, Testimonial

### Community 30 - "Community 30"
Cohesion: 0.20
Nodes (2): AdminHeaderProps, Testimonial

### Community 31 - "Community 31"
Cohesion: 0.20
Nodes (2): daysOfWeekShort, FooterTexts

### Community 32 - "Community 32"
Cohesion: 0.20
Nodes (2): ImageEffect, ImageEffectsRendererProps

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (3): useDrafts(), Category, FAQ

### Community 34 - "Community 34"
Cohesion: 0.28
Nodes (5): AppareilsPage(), generateSlug(), getImagePosition(), HearingAid, ImagePositionEditorProps

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (4): calculateDistance(), findNearestCentre(), getUserLocation(), toRadians()

### Community 36 - "Community 36"
Cohesion: 0.28
Nodes (4): MediaPickerProps, UploadedMedia, uploadFile(), MediaFile

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (3): CardDef, CardImage, MergedCard

### Community 38 - "Community 38"
Cohesion: 0.28
Nodes (5): generateSlug(), GET(), IncomingContentBlock, POST(), PUT()

### Community 39 - "Community 39"
Cohesion: 0.36
Nodes (6): DELETE(), GET(), guard(), PATCH(), POST(), prisma

### Community 40 - "Community 40"
Cohesion: 0.39
Nodes (7): detectCurrentPage(), init(), loadJSON(), replaceChips(), replaceConfig(), replaceConfigKeys(), replacePageContent()

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (7): dirPath, filePath, fs, html, path, solutionsData, solutionsPath

### Community 42 - "Community 42"
Cohesion: 0.25
Nodes (4): AdminTopbarProps, Device, SAVE_LABELS, SaveState

### Community 43 - "Community 43"
Cohesion: 0.32
Nodes (5): SelectedBlock, EditOp, useEditorHistory(), DEVICE_WIDTHS, Page

### Community 44 - "Community 44"
Cohesion: 0.29
Nodes (4): Props, MediaPicker, Props, FocalPoint

### Community 45 - "Community 45"
Cohesion: 0.25
Nodes (4): CardIconProps, PageTexts, STEPS, VALUES

### Community 46 - "Community 46"
Cohesion: 0.32
Nodes (6): cache, ContactIcon(), inflight, isImageValue(), Props, toLucideName()

### Community 47 - "Community 47"
Cohesion: 0.25
Nodes (4): PAGE_SECTIONS, VisualSection, VisualSectionSelectorProps, ImageEffect

### Community 48 - "Community 48"
Cohesion: 0.25
Nodes (4): FAQ, Tab, TabKey, tabs

### Community 49 - "Community 49"
Cohesion: 0.25
Nodes (4): DeviceLink, PageTexts, SolutionData, SolutionDetail

### Community 50 - "Community 50"
Cohesion: 0.33
Nodes (5): EFFECT_OPTIONS, ImageEffect, ImageEffectInspector(), Props, rgbaToHexAlpha()

### Community 51 - "Community 51"
Cohesion: 0.38
Nodes (6): Drafts, draftsStore, empty, read(), update(), write()

### Community 52 - "Community 52"
Cohesion: 0.38
Nodes (3): DELETE(), GET(), POST()

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (2): GET(), prisma

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (1): GET()

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (3): ImageUploadModalProps, defaultSolutions, Solution

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (4): { google }, oauth2Client, readline, SCOPES

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (7): Legacy Contour d'Oreille Page, Legacy Intra-Auriculaire Page, Legacy Oticon Intent Page, Legacy Remboursements Page, Legacy Sitemap Page, Legacy Solutions Auditives Page, Legacy Test Auditif Gratuit Page

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (4): appointmentTypes, Centre, FormData, TimeSlot

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (5): m, original, PATCH_LINES, patched, SCHEMA_PATH

### Community 60 - "Community 60"
Cohesion: 0.38
Nodes (2): seedDatabase(), prisma

### Community 61 - "Community 61"
Cohesion: 0.40
Nodes (5): Centre, CentresPage(), daysOfWeek, generateSlug(), OpeningHour

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (2): ImageEffect, pages

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (4): HearingAidData, defaultVisibility(), parseBlockVisibility(), AnyProductRow

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (1): GET()

### Community 65 - "Community 65"
Cohesion: 0.40
Nodes (3): getPageText(), PageText(), PageTextProps

### Community 66 - "Community 66"
Cohesion: 0.47
Nodes (4): ensureUploadDir(), GET(), POST(), UPLOAD_DIR

### Community 67 - "Community 67"
Cohesion: 0.40
Nodes (2): GET(), POST()

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (4): Appointment, appointmentTypeLabels, Centre, TimeSlot

### Community 69 - "Community 69"
Cohesion: 0.40
Nodes (2): GET(), prisma

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (1): GET()

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (1): prisma

### Community 72 - "Community 72"
Cohesion: 0.40
Nodes (2): HearingAid, SortKey

### Community 73 - "Community 73"
Cohesion: 0.40
Nodes (3): Appointment, Centre, TimeSlot

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (2): BlocksBuilderProps, ContentBlock

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (3): effectTypes, ImageEffect, ImageEffectEditorModalProps

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (2): ContentBlock, WYSIWYGEditorProps

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (3): PageDefinition, pageDefinitions, PageText

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (3): DbSetupResult, PopulateResult, TestDbResult

### Community 79 - "Community 79"
Cohesion: 0.40
Nodes (3): FooterTextDefinition, footerTextDefinitions, PageText

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (4): extract_texts_from_page(), generate_page_definitions(), Extrait les textes d'une page TSX, Génère les pageDefinitions TypeScript

### Community 81 - "Community 81"
Cohesion: 0.40
Nodes (3): PageDef, pageDefinitions, prisma

### Community 82 - "Community 82"
Cohesion: 0.60
Nodes (5): AppareilV2Editor(), Inspector(), inspectorTitle(), isContentSel(), selToContentId()

### Community 84 - "Community 84"
Cohesion: 0.40
Nodes (3): PageDefinition, pageDefinitions, PageText

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (4): Admin Feature Cards Page /admin/feature-cards, API /api/admin/card-images, Feature Cards Guide, ImageFeatureCard Component

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (2): Appointment, AppointmentStats

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (4): Admin Security Configuration, src/app/api/auth/[...nextauth]/route.ts, src/lib/auth.ts, src/lib/auth-helpers.ts

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (2): BlockSelectorProps, ContentBlock

### Community 89 - "Community 89"
Cohesion: 0.50
Nodes (2): cache, EditableProps

### Community 90 - "Community 90"
Cohesion: 0.50
Nodes (2): ImagePickerProps, UploadedImage

### Community 91 - "Community 91"
Cohesion: 0.50
Nodes (2): ContentBlock, ProductContentBlockProps

### Community 92 - "Community 92"
Cohesion: 0.50
Nodes (2): Category, FAQ

### Community 93 - "Community 93"
Cohesion: 0.83
Nodes (3): getComponentsPath(), loadAllComponents(), loadComponent()

### Community 94 - "Community 94"
Cohesion: 0.50
Nodes (2): defaults, link

### Community 95 - "Community 95"
Cohesion: 0.67
Nodes (3): fix_script_order(), main(), Fixe l'ordre des scripts dans un fichier HTML

### Community 96 - "Community 96"
Cohesion: 0.50
Nodes (4): Legacy js/components.js, Legacy js/config.js, Legacy js/main.js, Legacy 1.0 README

### Community 97 - "Community 97"
Cohesion: 0.50
Nodes (2): contentBlocks, prisma

### Community 98 - "Community 98"
Cohesion: 0.67
Nodes (3): Payload, POST(), slugify()

### Community 99 - "Community 99"
Cohesion: 0.50
Nodes (2): SMSConfig, SMSLog

### Community 100 - "Community 100"
Cohesion: 0.50
Nodes (2): DEFAULT_TEMPLATES, SMSTemplate

### Community 101 - "Community 101"
Cohesion: 0.50
Nodes (3): JWT, Session, User

### Community 102 - "Community 102"
Cohesion: 1.00
Nodes (2): Centre, OpeningHours

### Community 103 - "Community 103"
Cohesion: 1.00
Nodes (2): FAQ, FAQCategory

### Community 104 - "Community 104"
Cohesion: 0.67
Nodes (1): Props

### Community 105 - "Community 105"
Cohesion: 0.67
Nodes (1): PublishBarProps

### Community 106 - "Community 106"
Cohesion: 0.67
Nodes (3): API /api/admin/pending-reminders, Cron Job - Pending Appointment Reminders, src/lib/email.ts

### Community 107 - "Community 107"
Cohesion: 0.67
Nodes (1): Category

### Community 108 - "Community 108"
Cohesion: 0.67
Nodes (1): prisma

### Community 109 - "Community 109"
Cohesion: 0.67
Nodes (1): FeatureCardProps

### Community 110 - "Community 110"
Cohesion: 0.67
Nodes (1): ParallaxSectionProps

### Community 111 - "Community 111"
Cohesion: 0.67
Nodes (1): metadata

### Community 112 - "Community 112"
Cohesion: 0.67
Nodes (1): EDITABLE_PAGES

### Community 113 - "Community 113"
Cohesion: 0.67
Nodes (1): EffectIssue

### Community 114 - "Community 114"
Cohesion: 0.67
Nodes (2): get_calendar_list(), Récupère et affiche la liste des calendriers

### Community 115 - "Community 115"
Cohesion: 0.67
Nodes (1): metadata

### Community 116 - "Community 116"
Cohesion: 0.67
Nodes (1): prisma

### Community 117 - "Community 117"
Cohesion: 0.67
Nodes (1): prisma

### Community 118 - "Community 118"
Cohesion: 0.67
Nodes (3): Apple Icon SVG (Sound Wave on Blue Background), Favicon SVG (Sound Wave on Blue Circle), Icon SVG (Sound Wave on Blue Circle)

### Community 119 - "Community 119"
Cohesion: 0.67
Nodes (1): prisma

### Community 120 - "Community 120"
Cohesion: 1.00
Nodes (1): Solution

### Community 121 - "Community 121"
Cohesion: 1.00
Nodes (1): FAQ

### Community 122 - "Community 122"
Cohesion: 1.00
Nodes (1): PageText

### Community 126 - "Community 126"
Cohesion: 1.00
Nodes (2): Admin (Decap CMS) Page, Admin Simple README

### Community 127 - "Community 127"
Cohesion: 1.00
Nodes (2): Centre Audire Legacy Logo (Black/Gold with Ear and Heartbeat), Centre Audire Public Logo (Black/Gold with Ear and Heartbeat)

### Community 129 - "Community 129"
Cohesion: 1.00
Nodes (1): SMSTemplate

### Community 130 - "Community 130"
Cohesion: 1.00
Nodes (1): ImageEffect

### Community 131 - "Community 131"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 132 - "Community 132"
Cohesion: 1.00
Nodes (1): config

### Community 133 - "Community 133"
Cohesion: 1.00
Nodes (1): config

### Community 134 - "Community 134"
Cohesion: 1.00
Nodes (1): CLAUDE.md - Graphify Knowledge Graph Config

### Community 135 - "Community 135"
Cohesion: 1.00
Nodes (1): Decap CMS Configuration

### Community 136 - "Community 136"
Cohesion: 1.00
Nodes (1): Fix Google Calendar 404 Error

### Community 137 - "Community 137"
Cohesion: 1.00
Nodes (1): Fix Google OAuth 403 Error

### Community 138 - "Community 138"
Cohesion: 1.00
Nodes (1): Required Images for Feature Cards

### Community 141 - "Community 141"
Cohesion: 1.00
Nodes (1): Admin Simple Interface Page

### Community 142 - "Community 142"
Cohesion: 1.00
Nodes (1): Contour Oreille Alternative Logo (Gold Circular Monogram)

### Community 143 - "Community 143"
Cohesion: 1.00
Nodes (1): Content Editor Page (editeur.html)

### Community 144 - "Community 144"
Cohesion: 1.00
Nodes (1): Product Images Directory README

### Community 145 - "Community 145"
Cohesion: 1.00
Nodes (1): Images Directory README

### Community 146 - "Community 146"
Cohesion: 1.00
Nodes (1): Oticon Intent BTE Hearing Aid Product Image

### Community 147 - "Community 147"
Cohesion: 1.00
Nodes (1): Legacy Robots.txt

### Community 148 - "Community 148"
Cohesion: 1.00
Nodes (1): Legacy Solution Page 1772009311933

### Community 149 - "Community 149"
Cohesion: 1.00
Nodes (1): Legacy Solution Page 1772028108569

### Community 150 - "Community 150"
Cohesion: 1.00
Nodes (1): Eyeglass Frame Close-up (Hearing Aid Solution Context)

### Community 151 - "Community 151"
Cohesion: 1.00
Nodes (1): Pages Produits README

### Community 158 - "Community 158"
Cohesion: 1.00
Nodes (1): Prisma Sprint 5.8 Patch README

### Community 159 - "Community 159"
Cohesion: 1.00
Nodes (1): Apple Icon PNG (Centre Audire App Icon)

### Community 160 - "Community 160"
Cohesion: 1.00
Nodes (1): Hearing Test Photo (Woman with Audiometry Headphones)

### Community 161 - "Community 161"
Cohesion: 1.00
Nodes (1): Human Support Photo (Audiologist with Patient)

### Community 162 - "Community 162"
Cohesion: 1.00
Nodes (1): Oticon Couple Marketing Photo (Social Interaction)

### Community 163 - "Community 163"
Cohesion: 1.00
Nodes (1): Personalized Follow-up Photo (Audiologist Fitting Hearing Aid)

### Community 164 - "Community 164"
Cohesion: 1.00
Nodes (1): Audire Next.js Site README

### Community 165 - "Community 165"
Cohesion: 1.00
Nodes (1): Rendez-vous System README

### Community 166 - "Community 166"
Cohesion: 1.00
Nodes (1): Database Setup Guide

### Community 167 - "Community 167"
Cohesion: 1.00
Nodes (1): Solution Summary (500 errors fix)

### Community 168 - "Community 168"
Cohesion: 1.00
Nodes (1): Sprint 5.8 Release Notes

### Community 169 - "Community 169"
Cohesion: 1.00
Nodes (1): Tarifs PDF Document (INAMI Hearing Aid Pricing)

### Community 170 - "Community 170"
Cohesion: 1.00
Nodes (1): Editable Texts System README

### Community 171 - "Community 171"
Cohesion: 1.00
Nodes (1): Editable Texts Identification Map

### Community 172 - "Community 172"
Cohesion: 1.00
Nodes (1): Vercel Deployment Guide (500 error fix)

### Community 173 - "Community 173"
Cohesion: 1.00
Nodes (1): Vercel Environment Variables Setup Guide

## Knowledge Gaps
- **371 isolated node(s):** `CONFIG`, `Fixe l'ordre des scripts dans un fichier HTML`, `fs`, `path`, `solutionsPath` (+366 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 30`** (2 nodes): `AdminHeaderProps`, `Testimonial`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `daysOfWeekShort`, `FooterTexts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `ImageEffect`, `ImageEffectsRendererProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (2 nodes): `GET()`, `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `GET()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (2 nodes): `seedDatabase()`, `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (2 nodes): `ImageEffect`, `pages`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `GET()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (2 nodes): `GET()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (2 nodes): `GET()`, `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `GET()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (2 nodes): `HearingAid`, `SortKey`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (2 nodes): `BlocksBuilderProps`, `ContentBlock`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (2 nodes): `ContentBlock`, `WYSIWYGEditorProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (2 nodes): `Appointment`, `AppointmentStats`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (2 nodes): `BlockSelectorProps`, `ContentBlock`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (2 nodes): `cache`, `EditableProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (2 nodes): `ImagePickerProps`, `UploadedImage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (2 nodes): `ContentBlock`, `ProductContentBlockProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (2 nodes): `Category`, `FAQ`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (2 nodes): `defaults`, `link`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (2 nodes): `contentBlocks`, `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (2 nodes): `SMSConfig`, `SMSLog`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (2 nodes): `DEFAULT_TEMPLATES`, `SMSTemplate`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (2 nodes): `Centre`, `OpeningHours`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (2 nodes): `FAQ`, `FAQCategory`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (1 nodes): `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (1 nodes): `PublishBarProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 107`** (1 nodes): `Category`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (1 nodes): `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (1 nodes): `FeatureCardProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (1 nodes): `ParallaxSectionProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (1 nodes): `metadata`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (1 nodes): `EDITABLE_PAGES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 113`** (1 nodes): `EffectIssue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (2 nodes): `get_calendar_list()`, `Récupère et affiche la liste des calendriers`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (1 nodes): `metadata`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (1 nodes): `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (1 nodes): `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (1 nodes): `prisma`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (1 nodes): `Solution`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (1 nodes): `FAQ`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 122`** (1 nodes): `PageText`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (2 nodes): `Admin (Decap CMS) Page`, `Admin Simple README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 127`** (2 nodes): `Centre Audire Legacy Logo (Black/Gold with Ear and Heartbeat)`, `Centre Audire Public Logo (Black/Gold with Ear and Heartbeat)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 129`** (1 nodes): `SMSTemplate`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (1 nodes): `ImageEffect`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 131`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 132`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 133`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 134`** (1 nodes): `CLAUDE.md - Graphify Knowledge Graph Config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 135`** (1 nodes): `Decap CMS Configuration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 136`** (1 nodes): `Fix Google Calendar 404 Error`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 137`** (1 nodes): `Fix Google OAuth 403 Error`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 138`** (1 nodes): `Required Images for Feature Cards`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 141`** (1 nodes): `Admin Simple Interface Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 142`** (1 nodes): `Contour Oreille Alternative Logo (Gold Circular Monogram)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 143`** (1 nodes): `Content Editor Page (editeur.html)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 144`** (1 nodes): `Product Images Directory README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 145`** (1 nodes): `Images Directory README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 146`** (1 nodes): `Oticon Intent BTE Hearing Aid Product Image`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 147`** (1 nodes): `Legacy Robots.txt`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 148`** (1 nodes): `Legacy Solution Page 1772009311933`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 149`** (1 nodes): `Legacy Solution Page 1772028108569`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 150`** (1 nodes): `Eyeglass Frame Close-up (Hearing Aid Solution Context)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 151`** (1 nodes): `Pages Produits README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 158`** (1 nodes): `Prisma Sprint 5.8 Patch README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 159`** (1 nodes): `Apple Icon PNG (Centre Audire App Icon)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 160`** (1 nodes): `Hearing Test Photo (Woman with Audiometry Headphones)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 161`** (1 nodes): `Human Support Photo (Audiologist with Patient)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 162`** (1 nodes): `Oticon Couple Marketing Photo (Social Interaction)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 163`** (1 nodes): `Personalized Follow-up Photo (Audiologist Fitting Hearing Aid)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 164`** (1 nodes): `Audire Next.js Site README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 165`** (1 nodes): `Rendez-vous System README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 166`** (1 nodes): `Database Setup Guide`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 167`** (1 nodes): `Solution Summary (500 errors fix)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 168`** (1 nodes): `Sprint 5.8 Release Notes`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 169`** (1 nodes): `Tarifs PDF Document (INAMI Hearing Aid Pricing)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 170`** (1 nodes): `Editable Texts System README`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 171`** (1 nodes): `Editable Texts Identification Map`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 172`** (1 nodes): `Vercel Deployment Guide (500 error fix)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 173`** (1 nodes): `Vercel Environment Variables Setup Guide`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authOptions` connect `Community 5` to `Community 0`, `Community 64`, `Community 39`, `Community 66`, `Community 67`, `Community 83`, `Community 69`, `Community 71`, `Community 4`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `CardData` connect `Community 21` to `Community 29`, `Community 49`, `Community 27`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `CONFIG`, `Fixe l'ordre des scripts dans un fichier HTML`, `fs` to the rest of the system?**
  _371 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06313497822931785 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09696969696969697 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10227272727272728 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07096774193548387 - nodes in this community are weakly interconnected._