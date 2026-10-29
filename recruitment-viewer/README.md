# Private colleague recruitment viewer

Run with Python 3.10+ from the repository root:

```powershell
python recruitment-viewer/server.py
```

Open http://127.0.0.1:8765 on this computer. First run creates `recruitment-private/access-code.txt`. Open that file locally and paste its code into the login form. Never put that code in a URL, public file or chat. Sign-in creates a random server-validated HttpOnly, SameSite=Strict eight-hour session cookie. Sign-out revokes that session; restart revokes all sessions. To rotate access, stop the server, remove only the access-code file, then restart.

## Colleague workflow

Use the EN/中文 toggle at the top. Language preference stays in this browser. Candidate names and original evidence stay faithful to source documents. The viewer shows age, nationality, experience and education when supplied in the private import manifest; absent values show Not provided / 未提供. It does not infer personal attributes or use them for ranking or filtering. Expected education is explicitly labeled. Expand résumé evidence to see the source filename and excerpt. Evidence referencing non-résumé files is removed from the API.

Only documents explicitly tagged `kind: "resume"` are exposed in this colleague view. Supporting documents, passports and unclassified files are excluded by the server from both the candidate API and direct document routes. Guessing an old supporting-document URL cannot retrieve it. Those files can remain in the private local archive. Candidate received date is derived from the earliest imported email timestamp. Email text and supporting-document inventories are not included in the colleague API.

Manually set New, To interview, Interviewed, Offer, Hired, On hold or Rejected. Save review also persists interview time, decision time and plain-text team notes. Date inputs use Shanghai time, UTC+8. Status changes append a timestamped history entry. A transition to Offer, Hired or Rejected records the decision time automatically unless a corrected value is supplied. Previous event dates are not inferred. Legacy Reviewing maps to New, Interview to To interview and Offered to Offer; migration itself does not invent a history entry. No messages or automatic decisions are generated.

Review data is stored in `recruitment-private/review-state.json`, separately from the import manifest. It survives imports and restarts; unrelated review fields are preserved. Saves replace this file atomically. Corrupt review data is not silently overwritten.

## Introduction videos

Website uploads are disabled for all roles. Add videos locally through the chat by copying the confirmed candidate video into the private videos folder and updating their review-state video record. Never guess candidate identity. Authenticated playback and downloads of locally attached videos remain supported, including HTTP byte ranges. The upload endpoint rejects requests without saving files.

## Local-only scope

The server binds only 127.0.0.1; colleagues on other computers cannot access it yet. Shared deployment needs HTTPS, Secure cookies, individual accounts, access auditing and private storage. Do not expose or reverse-proxy this development server publicly. Secure is omitted only for loopback HTTP. A server-validated, expiring, revocable invitation link can establish a session; merely hiding a route or checking a URL token in client-side JavaScript cannot protect documents. Invitation links and roles are not implemented here.

Never serve the repository root with `python -m http.server`: that could expose the private archive. Never commit/publish the private directory, documents or access codes, and exclude them from deployment artifacts. Browser login does not encrypt files or protect against a user who already has filesystem access. There are no external scripts, fonts or analytics.

Options: `--port 8765`, `--data-dir PATH`. Avoid a symlink as the private data directory. Document paths cannot escape the private directory or traverse symlinks. Only three UI assets are available without sign-in. Every API and file route requires a valid session. POSTs validate Origin and Host, failed logins are limited to ten per minute, and private responses use no-store caching.

## Verification

```powershell
python -m unittest discover -s recruitment-viewer -p test_server.py -v
node --check recruitment-viewer/app.js
```

Tests use synthetic files and cover authentication, CSRF/Host checks, cookie expiration, traversal, restricted documents, notes and date persistence, explicit status transitions, legacy status migration, corrupt-state preservation, binary video validation and byte-range boundaries.

Status badges and selectors use distinct colors with text labels. Explicitly selected standalone profile photos (kind=portrait plus portraitDocumentId) are available only through authenticated portrait routes; passports and other supporting images remain inaccessible. Portraits use a circular CSS crop without altering the original file. User-supplied historical decisions are recorded with import timestamps; unknown actual interview/decision dates stay blank.


## Encrypted GitHub Pages export
Run `python recruitment-viewer/export_encrypted.py` locally (requires cryptography).
Only `recruitment/` is staged into the published Pages artifact. Original documents, review state, AES-256 keys and invitation links stay under ignored `recruitment-private/`.
Each role has a separately encrypted AES-GCM snapshot, random 96-bit nonce on every export, and role-bound additional authenticated data. Jim's snapshot contains only his candidates and excludes internal notes; short rejection reasons are shared. The small index.bin contains encrypted candidate metadata. Resumes, approved portraits and matched videos are separately encrypted under role/assets and fetched on demand; no plaintext documents are published. Asset AAD binds the role and content hash. Existing verified ciphertext is reused to avoid re-uploading unchanged videos.
The browser imports the 256-bit key from the URL fragment, removes the fragment, decrypts locally, and remembers it in localStorage. The export includes no analytics or third-party scripts/fonts. Links are bearer credentials and can be forwarded. The visible Forget access control has been removed. Revoking future access requires rotating the affected key and rebuilding; previously downloaded snapshots cannot be revoked. Encryption does not protect against malicious code running on the hosting origin.
Shared snapshots are read-only; update reviews locally and rebuild. Website upload endpoints remain disabled. The exporter refuses missing/checksum-mismatched documents and snapshots above 90 MiB. The internal page defaults to Chinese; recruiter pages default to English. Invitation keys are saved before fetching data so a network failure does not discard access.
Private links are saved in `recruitment-private/invitation-links.json`; never commit them or put them in build logs.

Direct applicants: set source to `direct` and recruiter to `Direct applicant` in the local manifest when importing a confirmed direct application. The staff Source filter always includes Direct applicant; these candidates are never included in Jim's package. No website submission form is enabled.

## Import preservation
Preserve contact.entries (type, value and sourceDocumentId/sourceEmailId), applicationGroup (kind, members and source evidence), additionalRecruiters and review-state recruiterComments. Never merge candidates based only on first names. Couple labels require explicit evidence; joint submissions can use Applying together without claiming a relationship. Never expose another recruiter's candidate through group membership. Missing direct contacts stay not provided; do not substitute recruiter contact details as candidate details. Preserve all manual statuses including Not qualified and all prior document versions.

Use locally archived passports as explicit sources for nationality and date of birth. Keep identityEvidence (including birth dates) private; publish only derived age with asOf and nationality. Never export passport files or passport numbers. Preserve Contacted status during imports. Empty interview/decision dates are hidden in shared views.
