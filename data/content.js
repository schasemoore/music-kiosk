/**
 * All editable kiosk content lives in this one file.
 *
 * TO ADD REAL PHOTOS: drop image files at the exact paths listed in each
 * area's `photos` array (create the folders if needed). The kiosk checks
 * whether each file loads — if it's missing, a placeholder tile is shown
 * automatically, so you can add real media gradually without touching code.
 *
 * TO ADD REAL VIDEO: same idea — drop an .mp4 at the `video` path and a
 * cover image at `poster`. Keep clips short (10-30s) and muted-friendly for
 * a booth environment.
 *
 * TO SET THE REAL APPLY LINK: change CTA_URL below and regenerate nothing —
 * the QR code and button update automatically.
 *
 * Each area has a `theme` hex color (its identity color on the header band,
 * icon, and accents throughout its page) — change it to restyle that one
 * area without touching any other.
 */

const CTA_URL = "https://your-link-here.auburn.edu/apply"; // PLACEHOLDER — replace with the real prospective-student form/apply link
const CTA_LABEL = "Apply now";

const IDLE_TIMEOUT_MS = 90000; // return to home screen after this many ms of no touch

const DEPARTMENT = {
  name: "Department of Music",
  heroTitle: "Find your sound.",
  heroSub: "Eight programs, one Auburn stage. Tap one to see what studying music here looks like.",
};

const AREAS = [
  {
    id: "brass",
    name: "Brass",
    tagline: "Trumpet, horn, trombone, euphonium & tuba",
    icon: "brass",
    theme: "#b8863b",
    description:
      "Brass students study applied performance within Auburn's Bachelor of Music instrumental track, with private lessons, studio classes, and placement in Auburn's bands, orchestra, and jazz ensembles.",
    facts: ["Bachelor of Music (Instrumental)", "Private weekly lessons", "Bands, Orchestra & Jazz Ensembles"],
    photos: [
      "assets/images/areas/brass/1.jpg",
      "assets/images/areas/brass/2.jpg",
      "assets/images/areas/brass/3.jpg",
    ],
    video: "assets/video/areas/brass/reel.mp4",
    poster: "assets/images/areas/brass/poster.jpg",
  },
  {
    id: "woodwind-percussion",
    name: "Woodwind & Percussion",
    tagline: "Flute, clarinet, saxophone, oboe, bassoon & percussion",
    icon: "woodwind",
    theme: "#5c7285",
    description:
      "Woodwind and percussion majors pursue a Bachelor of Music in Instrumental Performance, combining private study with ensemble placement across Auburn's concert bands, orchestra, and jazz program.",
    facts: ["Bachelor of Music (Instrumental)", "Private weekly lessons", "Marching, Concert & Jazz Bands"],
    photos: [
      "assets/images/areas/woodwind-percussion/1.jpg",
      "assets/images/areas/woodwind-percussion/2.jpg",
      "assets/images/areas/woodwind-percussion/3.jpg",
    ],
    video: "assets/video/areas/woodwind-percussion/reel.mp4",
    poster: "assets/images/areas/woodwind-percussion/poster.jpg",
  },
  {
    id: "voice",
    name: "Voice",
    tagline: "Classical & musical theatre vocal performance",
    icon: "voice",
    theme: "#7a2331",
    description:
      "Vocal Performance students earn a Bachelor of Music built around private voice lessons, diction and vocal pedagogy coursework, and performance opportunities with Auburn's choirs and opera workshop.",
    facts: ["Bachelor of Music (Vocal Performance)", "Private weekly lessons", "Choirs & Opera Workshop"],
    photos: [
      "assets/images/areas/voice/1.jpg",
      "assets/images/areas/voice/2.jpg",
      "assets/images/areas/voice/3.jpg",
    ],
    video: "assets/video/areas/voice/reel.mp4",
    poster: "assets/images/areas/voice/poster.jpg",
  },
  {
    id: "piano",
    name: "Piano",
    tagline: "Classical performance & collaborative keyboard",
    icon: "piano",
    theme: "#22201d",
    description:
      "Piano majors complete a Bachelor of Music focused on solo performance, collaborative piano, and pedagogy, with regular studio recitals and the annual Concerto Competition.",
    facts: ["Bachelor of Music (Piano)", "Private weekly lessons", "Studio recitals & Concerto Competition"],
    photos: [
      "assets/images/areas/piano/1.jpg",
      "assets/images/areas/piano/2.jpg",
      "assets/images/areas/piano/3.jpg",
    ],
    video: "assets/video/areas/piano/reel.mp4",
    poster: "assets/images/areas/piano/poster.jpg",
  },
  {
    id: "commercial-music",
    name: "Commercial Music",
    tagline: "Modern performance, production & the music business",
    icon: "commercial",
    theme: "#1e7f7a",
    description:
      "The Commercial Music degree blends contemporary performance with recording, production, and the business side of the music industry — including access to Auburn's Lucky Man Studio and Commercial Ensembles.",
    facts: ["Bachelor of Music (Commercial Music)", "Lucky Man Studio", "Commercial Ensembles"],
    photos: [
      "assets/images/areas/commercial-music/1.jpg",
      "assets/images/areas/commercial-music/2.jpg",
      "assets/images/areas/commercial-music/3.jpg",
    ],
    video: "assets/video/areas/commercial-music/reel.mp4",
    poster: "assets/images/areas/commercial-music/poster.jpg",
  },
  {
    id: "composition-technology",
    name: "Composition & Technology",
    tagline: "Original composition & music technology",
    icon: "composition",
    theme: "#4b3b6b",
    description:
      "Composition (Technology) students write original concert, media, and electronic music while building skills in notation software, digital audio workstations, and recording technology.",
    facts: ["Bachelor of Music (Composition, Technology)", "DAW & production coursework", "New-music & premiere performances"],
    photos: [
      "assets/images/areas/composition-technology/1.jpg",
      "assets/images/areas/composition-technology/2.jpg",
      "assets/images/areas/composition-technology/3.jpg",
    ],
    video: "assets/video/areas/composition-technology/reel.mp4",
    poster: "assets/images/areas/composition-technology/poster.jpg",
  },
  {
    id: "music-education",
    name: "Music Education",
    tagline: "Become a K-12 instrumental or vocal music teacher",
    icon: "education",
    theme: "#0b1f3a",
    description:
      "Offered with Auburn's College of Education, the Bachelor of Music Education prepares instrumental, vocal, or combined-track teachers and is approved by the Alabama State Board of Education and CAEP.",
    facts: ["Bachelor of Music Education", "Instrumental, Vocal & Combined tracks", "State- & CAEP-approved"],
    photos: [
      "assets/images/areas/music-education/1.jpg",
      "assets/images/areas/music-education/2.jpg",
      "assets/images/areas/music-education/3.jpg",
    ],
    video: "assets/video/areas/music-education/reel.mp4",
    poster: "assets/images/areas/music-education/poster.jpg",
  },
  {
    id: "bands-ensembles",
    name: "Bands & Ensembles",
    tagline: "Marching, concert, jazz, choral & chamber groups",
    icon: "ensemble",
    theme: "#d9500f",
    description:
      "From the Auburn University Marching Band to jazz combos, chamber groups, choirs, and orchestra, Auburn's ensembles are open to music majors and non-majors alike — find your group and get playing.",
    facts: ["Open to all Auburn students", "Bands, Choirs, Orchestra", "Jazz & Chamber Ensembles"],
    photos: [
      "assets/images/areas/bands-ensembles/1.jpg",
      "assets/images/areas/bands-ensembles/2.jpg",
      "assets/images/areas/bands-ensembles/3.jpg",
    ],
    video: "assets/video/areas/bands-ensembles/reel.mp4",
    poster: "assets/images/areas/bands-ensembles/poster.jpg",
  },
];

window.KIOSK_CONTENT = { DEPARTMENT, AREAS, CTA_URL, CTA_LABEL, IDLE_TIMEOUT_MS };
