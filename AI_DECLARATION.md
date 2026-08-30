AI Usage Declaration
## Overview

Artificial intelligence tools were used during the development of Life Ledger as an aid to software development.

ChatGPT was used at different stages to support activities such as discussing implementation approaches, generating or refining code, debugging, reviewing logic, and developing automated tests.

The level of AI assistance varied between files and code sections. Some code was written manually, some was developed with partial AI assistance, and some sections received more substantial AI assistance.

All AI-assisted code included in the final project was reviewed, integrated into the wider application, tested where appropriate, and understood before inclusion in the submitted version.

## Classification

The following classifications are used throughout this declaration:

Manual - written without direct AI-generated code.
AI-assisted - AI contributed to the implementation, debugging, refactoring, or testing, but the resulting code was reviewed and adapted as part of the development process.
Significant AI assistance - a substantial part of the implementation was initially produced with AI assistance and subsequently reviewed, modified where necessary, integrated, and tested.

Relevant AI-assisted sections are also identified using inline comments in the source code where appropriate.

## Project-Level AI Contribution Register

Automatically generated framework, migration, build, and dependency files that were not manually modified are excluded from this register.

Files classified as AI-assisted may contain only limited AI-supported sections or implementation guidance. The classification does not imply that the complete file was AI-generated; the specific contribution is described in the table.

The table below records the level of AI involvement across the project source code.

The following classifications are used:

- **Manual** - no direct AI-generated code was used.
- **AI-assisted** - AI was used for guidance, debugging, implementation support, or selected code sections, with the final code reviewed and adapted by Maksym Pehashev.
- **Significant AI assistance** - AI contributed substantially to the implementation of the file or a major part of it, with the resulting code reviewed, revised where necessary, and tested by the student (Maksym Pehashev).



### Root folder
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `.env.example` | AI-assisted | Environment variables and service configuration guidance | 23 Jul - 4 Aug 2026 |
| `docker-compose.yml` | AI-assisted | Docker services, networking, ports, automatic migration startup guidance | 23 Jul - 24 Aug 2026 |
| `render.yaml` | AI-assisted | Render deployment, port, database and frontend configuration guidance | 4 Aug 2026 |

### Backend
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `build.sh` | Manual | None | — |
| `Dockerfile` | Significant AI assistance | Backend Docker environment configuration | 3 Aug 2026 |
| `requirements.txt` | AI-assisted | Backend dependency and deployment package guidance | 23 Jul - 16 Aug 2026 |

#### `backend/commitments/`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `admin.py` | Manual | No direct AI-generated code | — |
| `apps.py` | Manual | No direct AI-generated code | — |
| `models.py` | AI-assisted | Due-date calculation; template exclusion model | 11 Aug; 16 Aug 2026 |
| `serializers.py` | AI-assisted | Generated payment-cycle block; filtering, deadline and payment-update fixes | 30 Jul; 16 Aug; 26 Aug 2026 |
| `tests.py` | Significant AI assistance | Most API tests; cases and expectations revised by student | 29 Jul - 16 Aug 2026 |
| `urls.py` | Manual | None | — |
| `views.py` | AI-assisted | General DRF view and queryset guidance | 29 Jul - 16 Aug 2026 |

#### `backend/commitments/migrations`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `commitments/migrations/0021_seed_final_guidance_data.py` | Significant AI assistance | Final guidance, trusted-link and missing-template seed migration | 25 Aug 2026 |

#### `backend/config/`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `settings.py` | AI-assisted | Render deployment and production configuration guidance | 4 Aug 2026 |
| `urls.py` | Manual | None | — |

#### `backend/guides/`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `admin.py` | Manual | None | — |
| `apps.py` | Manual | None | — |
| `models.py` | Manual | None | — |
| `serializers.py` | Manual | None | — |

#### `backend/users/`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `admin.py` | Manual | None | — |
| `apps.py` | Manual | None | — |
| `models.py` | Manual | None | — |
| `permissions.py` | Manual | None | — |
| `serializers.py` | AI-assisted | Account and plan serialization guidance | 11 Aug 2026 |
| `tests.py` | Significant AI assistance | Most API tests; scenarios revised and extended | 24 Jul - 16 Aug 2026 |
| `urls.py` | Manual | None | — |
| `views.py` | AI-assisted | Account and Premium access implementation guidance | 11 - 16 Aug 2026 |

### Frontend

#### `frontend/`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `index.html` | Manual | None | — |
| `package.json` | AI-assisted | Frontend testing dependencies and npm scripts | 16 Aug 2026 |
| `vite.config.js` | AI-assisted | Vitest and jsdom test configuration | 16 Aug 2026 |

#### `frontend/src`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `App.jsx` | AI-assisted | Minor nested React Router and protected layout guidance | 4 Aug 2026 |
| `index.css` | Manual | None | — |

#### `frontend/src/components`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `CommitmentForm.jsx` | AI-assisted | Form handling and date calculation | 7 - 16 Aug 2026 |
| `LoginSuccessTransition.jsx` | Significant AI assistance | Login transition logic and animation phases | 4 Aug 2026 |
| `LoginSuccessTransition.css` | Significant AI assistance | Login animation and timing refinement | 4 Aug 2026 |
| `Logo.css` | AI-assisted | SVG animation and scaling refinement | 4 Aug 2026 |
| `Logo.jsx` | AI-assisted | CSS class combination | 4 Aug 2026 |
| `ProtectedRoute.jsx` | Manual | None | — |

#### `frontend/src/layout`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `DashboardLayout.jsx` | Manual | None | — |
| `DashboardLayout.css` | Manual | None | — |

#### `frontend/src/pages`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `AddCommitmentPage.css` | Manual | None | — |
| `AddCommitmentPage.jsx` | AI-assisted | Guided setup navigation and form remount guidance | 16 Aug 2026 |
| `CommitmentDetailPage.css` | Manual | None | — |
| `CommitmentDetailPage.jsx` | AI-assisted | Date-only formatting guidance | 7 Aug 2026 |
| `CommitmentsPage.css` | Manual | None | — |
| `CommitmentsPage.jsx` | Significant AI assistance | Filtering, effects, dashboard-linked results and Review Needed fix | 11 - 17 Aug; 26 Aug 2026 |
| `DashboardPage.css` | AI-assisted | Dashboard layout and responsive positioning fixes | 16 - 17 Aug 2026 |
| `DashboardPage.jsx` | Significant AI assistance | Dashboard logic, payment summary and filtered navigation | 11 - 17 Aug 2026 |
| `EditCommitmentPage.jsx` | AI-assisted | Form initial-data conversion | 7 Aug 2026 |
| `FaqPage.jsx` | Manual | None | — |
| `FaqPage.css` | Manual | None | — |
| `ForgottenChecklistPage.jsx` | AI-assisted | Checklist status and action handling guidance | 11 - 16 Aug 2026 |
| `ForgottenChecklistPage.css` | Manual | None | — |
| `GuidedSetupPage.jsx` | AI-assisted | Selection handlers and guided-flow navigation | 11 - 16 Aug 2026 |
| `GuidedSetupPage.css` | Manual | None | — |
| `GuidesPage.jsx` | Manual | None | — |
| `GuidesPage.css` | Manual | None | — |
| `LoginPage.jsx` | Manual | None | — |
| `PrivacyPolicyPage.jsx` | Manual | None | — |
| `PrivacyPolicyPage.css` | Manual | None | — |
| `RegisterPage.jsx` | Manual | None | — |
| `SettingsPage.jsx` | Significant AI assistance | Premium flow, modal behaviour and plan synchronisation | 11 - 16 Aug 2026 |
| `SettingsPage.css` | AI-assisted | Modal layout and responsive behaviour | 11 - 16 Aug 2026 |

#### `frontend/src/routes`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `PremiumRoute.jsx` | Manual | None | — |

#### `frontend/src/services`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `authService.js` | AI-assisted | Token authentication and API request guidance | 4 - 16 Aug 2026 |
| `commitmentService.js` | AI-assisted | Reusable API request helper | 7 Aug 2026 |

#### `frontend/src/test`
| File / Area | Classification | AI Contribution | AI Assistance Date |
| --- | --- | --- | --- |
| `CommitmentForm.test.jsx` | Significant AI assistance | Test implementation support | 16 Aug 2026 |
| `CommitmentsPage.test.jsx` | Significant AI assistance | Test implementation and mocks | 16 Aug 2026 |
| `DashboardPage.test.jsx` | Significant AI assistance | Test implementation and routing | 16 Aug 2026 |
| `ProtectedRoute.test.jsx` | Significant AI assistance | Test implementation support | 16 Aug 2026 |
| `setup.js` | Manual | None | — |

## Verification

AI-generated or AI-assisted suggestions were not treated as automatically correct. Code was checked against the intended application behaviour and validated using a combination of:

backend automated tests;
frontend automated tests;
browser and responsive testing;
manual API and application testing;
integration testing during development.

The final application contains 124 passing backend automated tests and 8 passing focused frontend automated tests.

Tool Used
ChatGPT (OpenAI)

## Responsibility

Responsibility for the submitted code, its integration, testing, and final behaviour remains with the student (Maksym Pehashev).