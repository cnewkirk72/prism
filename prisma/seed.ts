/**
 * Prism — seed (Phase 2: user-scoped)
 *
 * Creates a demo user with a fully populated workspace:
 *   - Account: demo@prism.app / demo1234
 *   - 80 posts (TikTok + IG) across categories and view tiers
 *   - 12 sounds, 25 hashtags, 18 inspiration pins, 12 ideas
 *   - 2 content plans w/ Before/During/After checklists
 *   - 6 affiliate programs, 8 action items, 4 goals, 3 color palettes
 *   - 2 PlatformConnection rows (sample / pre-OAuth)
 *
 * Run:  pnpm db:reset
 */

import {
  PrismaClient, Platform, IGFormat, SoundStatus, IdeaStatus, ContentPlanPhase,
  AffiliateStatus, GoalKind,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------- helpers ----------

function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(days: number): Date { const d = new Date(); d.setDate(d.getDate() - days); return d; }

function sampleViews(): number {
  const r = Math.random();
  if (r < 0.04) return rand(10_000_000, 35_000_000);
  if (r < 0.18) return rand(100_000, 9_999_999);
  if (r < 0.55) return rand(10_000, 99_999);
  if (r < 0.85) return rand(1_000, 9_999);
  return rand(50, 999);
}
function deriveEng(views: number) {
  const baseRate = 0.06 + Math.random() * 0.05;
  const decay = Math.max(0.4, 1 - Math.log10(Math.max(views, 10)) / 12);
  const likes = Math.round(views * baseRate * decay);
  return {
    likes,
    comments: Math.round(likes * (0.02 + Math.random() * 0.03)),
    shares: Math.round(likes * (0.05 + Math.random() * 0.07)),
    saves: Math.round(likes * (0.04 + Math.random() * 0.06)),
  };
}

const CATEGORIES = [
  { name: "Hair", color: "#EC4899" },
  { name: "Art", color: "#A855F7" },
  { name: "Music Festival", color: "#F472B6" },
  { name: "Fashion", color: "#C084FC" },
  { name: "Travel", color: "#06B6D4" },
  { name: "Food", color: "#F59E0B" },
  { name: "Behind the Scenes", color: "#10B981" },
];

const HASHTAG_POOL = [
  "fyp", "foryou", "transition", "grwm", "outfitinspo", "haircolor", "hairtok",
  "arttok", "festivalseason", "coachella", "ootd", "studiovlog", "creatorlife",
  "smallcreator", "trendingaudio", "transitiontutorial", "vlog", "dayinmylife",
  "asmr", "behindthescenes", "fashiontiktok", "moodboard", "colorgrading",
  "promovideo", "comingsoon",
];

const SOUNDS = [
  { title: "espresso (sped up)", artist: "Sabrina Carpenter", platform: Platform.TIKTOK },
  { title: "good luck, babe!", artist: "Chappell Roan", platform: Platform.TIKTOK },
  { title: "Birds of a Feather", artist: "Billie Eilish", platform: Platform.INSTAGRAM },
  { title: "Murder on the Dancefloor", artist: "Sophie Ellis-Bextor", platform: Platform.TIKTOK },
  { title: "Pink Pony Club", artist: "Chappell Roan", platform: Platform.INSTAGRAM },
  { title: "Texas Hold 'Em", artist: "Beyoncé", platform: Platform.TIKTOK },
  { title: "Von dutch (remix)", artist: "Charli XCX", platform: Platform.TIKTOK },
  { title: "lunch", artist: "Billie Eilish", platform: Platform.INSTAGRAM },
  { title: "I Had Some Help", artist: "Post Malone & Morgan Wallen", platform: Platform.TIKTOK },
  { title: "Please Please Please", artist: "Sabrina Carpenter", platform: Platform.TIKTOK },
  { title: "Not Like Us", artist: "Kendrick Lamar", platform: Platform.TIKTOK },
  { title: "360", artist: "Charli XCX", platform: Platform.INSTAGRAM },
];

const CAPTION_TEMPLATES = [
  "POV: you finally tried it",
  "no one's talking about this enough",
  "okay this is unreal",
  "tutorial in 3 parts — save this",
  "you asked, here it is",
  "trying this trend so you don't have to",
  "festival vibes coded",
  "the color match is sending me",
  "behind the scenes of the new shoot",
  "before / after you decide which is better",
  "answering your top question",
  "this is where the magic happens",
  "the hair was UNREAL today",
  "obsessed with this palette",
  "running on coffee + chaos",
];

// ---------- main ----------

async function main() {
  console.log("→ Wiping existing data…");
  await prisma.$transaction([
    prisma.checklistItemSound.deleteMany(),
    prisma.checklistItemInspiration.deleteMany(),
    prisma.checklistItem.deleteMany(),
    prisma.contentPlan.deleteMany(),
    prisma.idea.deleteMany(),
    prisma.inspiration.deleteMany(),
    prisma.inspirationTag.deleteMany(),
    prisma.colorSwatch.deleteMany(),
    prisma.colorPalette.deleteMany(),
    prisma.postHashtag.deleteMany(),
    prisma.post.deleteMany(),
    prisma.hashtag.deleteMany(),
    prisma.sound.deleteMany(),
    prisma.category.deleteMany(),
    prisma.affiliateProgram.deleteMany(),
    prisma.actionItem.deleteMany(),
    prisma.goal.deleteMany(),
    prisma.platformConnection.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("→ Creating demo user (demo@prism.app / demo1234)…");
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.create({
    data: {
      email: "demo@prism.app",
      name: "Demo Creator",
      handle: "@demoprism",
      bio: "Hair, art, festival vibes. New post every Tuesday and Friday.",
      image: null,
      passwordHash,
    },
  });

  console.log("→ Seeding categories…");
  const categories = await Promise.all(
    CATEGORIES.map((c) => prisma.category.create({ data: c })),
  );

  console.log("→ Seeding hashtags…");
  const hashtags = await Promise.all(
    HASHTAG_POOL.map((tag) => prisma.hashtag.create({ data: { tag } })),
  );

  console.log("→ Seeding sounds…");
  const sounds = await Promise.all(
    SOUNDS.map((s, i) =>
      prisma.sound.create({
        data: {
          userId: user.id,
          title: s.title,
          artist: s.artist,
          platform: s.platform,
          thumbnailUrl: `https://picsum.photos/seed/sound-${i}/200/300`,
          status:
            i % 4 === 0 ? SoundStatus.TO_FILM
            : i % 5 === 0 ? SoundStatus.USED
            : SoundStatus.SAVED,
          savedAt: daysAgo(rand(1, 60)),
        },
      }),
    ),
  );

  console.log("→ Seeding 80 posts with hashtags…");
  for (let i = 0; i < 80; i++) {
    const platform = Math.random() < 0.7 ? Platform.TIKTOK : Platform.INSTAGRAM;
    const views = sampleViews();
    const eng = deriveEng(views);
    const cat = pick(categories);
    const sound = Math.random() < 0.6 ? pick(sounds) : null;
    const igFormat = platform === Platform.INSTAGRAM ? pick([IGFormat.REEL, IGFormat.REEL, IGFormat.CAROUSEL, IGFormat.PHOTO]) : null;
    const durationSec = (platform === Platform.TIKTOK || igFormat === IGFormat.REEL)
      ? pick([7, 9, 12, 15, 18, 22, 28, 35, 45, 52, 65, 78, 92])
      : null;

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        platform,
        caption: `${pick(CAPTION_TEMPLATES)} #${pick(HASHTAG_POOL)} #${pick(HASHTAG_POOL)}`,
        thumbnailUrl: `https://picsum.photos/seed/prism-${i}/400/600`,
        permalink: platform === Platform.TIKTOK
          ? `https://www.tiktok.com/@demoprism/video/${1000000 + i}`
          : `https://www.instagram.com/p/demo${i}/`,
        postedAt: daysAgo(rand(1, 180)),
        durationSec,
        igFormat,
        views,
        ...eng,
        categoryId: cat.id,
        soundId: sound?.id,
      },
    });

    const tagCount = rand(2, 4);
    const used = new Set<string>();
    for (let h = 0; h < tagCount; h++) {
      const tag = pick(hashtags);
      if (used.has(tag.id)) continue;
      used.add(tag.id);
      await prisma.postHashtag.create({ data: { postId: post.id, hashtagId: tag.id } });
    }
  }

  console.log("→ Seeding inspiration pins…");
  const inspirationTagNames = ["transitions", "trends", "color", "lighting", "outfit", "location", "hook"];
  const inspirationTags = await Promise.all(
    inspirationTagNames.map((name) => prisma.inspirationTag.create({ data: { name } })),
  );
  for (let i = 0; i < 18; i++) {
    const tagSubset = inspirationTags.slice().sort(() => Math.random() - 0.5).slice(0, rand(1, 3));
    await prisma.inspiration.create({
      data: {
        userId: user.id,
        sourceUrl: `https://www.tiktok.com/@example/video/${1000000 + i}`,
        platform: i % 3 === 0 ? Platform.INSTAGRAM : Platform.TIKTOK,
        thumbnailUrl: `https://picsum.photos/seed/insp-${i}/300/450`,
        note: i % 4 === 0 ? "love this transition — try with my pink wig" : null,
        savedAt: daysAgo(rand(1, 90)),
        tags: { connect: tagSubset.map((t) => ({ id: t.id })) },
      },
    });
  }

  console.log("→ Seeding ideas…");
  const ideaSeeds = [
    { title: "Pink-to-blue hair reveal", desc: "Big-reveal transition synced to drop", status: IdeaStatus.READY, tags: "Hair,Transition" },
    { title: "Coachella outfit grid", desc: "Carousel of all 4 fits", status: IdeaStatus.SPARK, tags: "Music Festival,Fashion" },
    { title: "Studio palette ASMR", desc: "Mixing colors close-up", status: IdeaStatus.DRAFTED, tags: "Art" },
    { title: "Get ready with me — 6 AM", desc: "Speedrun GRWM under 30s", status: IdeaStatus.SPARK, tags: "Hair,Behind the Scenes" },
    { title: "Color theory in 60s", desc: "Educational hook + payoff", status: IdeaStatus.READY, tags: "Art" },
    { title: "Festival packing checklist", desc: "Voiceover + b-roll", status: IdeaStatus.FILMED, tags: "Music Festival,Travel" },
    { title: "Trying a viral hair gel", desc: "Honest review POV", status: IdeaStatus.SPARK, tags: "Hair" },
    { title: "1 outfit, 5 ways", desc: "Quick changes + caption hook", status: IdeaStatus.POSTED, tags: "Fashion" },
    { title: "Behind a brand shoot", desc: "Day-in-life of a creator collab", status: IdeaStatus.DRAFTED, tags: "Behind the Scenes" },
    { title: "Painting my nails to match", desc: "Match nails to outfit drop", status: IdeaStatus.SPARK, tags: "Art,Fashion" },
    { title: "Studio walk-through", desc: "Tour my new editing setup", status: IdeaStatus.READY, tags: "Behind the Scenes" },
    { title: "Late-night festival recap", desc: "Slow zoom + trending sound", status: IdeaStatus.POSTED, tags: "Music Festival" },
  ];
  await Promise.all(
    ideaSeeds.map((i, idx) => prisma.idea.create({
      data: {
        userId: user.id,
        title: i.title, description: i.desc, status: i.status,
        categoryTags: i.tags, position: idx,
      },
    })),
  );

  console.log("→ Seeding content plans…");
  const plan1 = await prisma.contentPlan.create({
    data: { userId: user.id, title: "Hair dye march 21", shootDate: daysAgo(-3), notes: "Pink wash → silver toner" },
  });
  const plan2 = await prisma.contentPlan.create({
    data: { userId: user.id, title: "Coachella weekend 2", shootDate: daysAgo(-10), notes: "4 outfits, golden hour" },
  });
  const checklistTemplate = [
    { phase: ContentPlanPhase.BEFORE, items: ["Charge camera + ring light", "Pick sound + reference", "Lay out outfit + accessories", "Test lighting in mirror"] },
    { phase: ContentPlanPhase.DURING, items: ["Film 3 takes of hook", "Slow-mo b-roll of color", "Reaction shot to camera", "Vertical + horizontal coverage"] },
    { phase: ContentPlanPhase.AFTER, items: ["Cut + sync to beat", "Add captions w/ keywords", "Schedule TikTok 6pm", "Cross-post Reel + Story tease"] },
  ];
  for (const plan of [plan1, plan2]) {
    let position = 0;
    for (const group of checklistTemplate) {
      for (const title of group.items) {
        const item = await prisma.checklistItem.create({
          data: { contentPlanId: plan.id, phase: group.phase, title, position: position++, done: Math.random() < 0.4 },
        });
        // Demo: link a sound to one BEFORE step
        if (title === "Pick sound + reference" && sounds.length) {
          await prisma.checklistItemSound.create({
            data: { checklistItemId: item.id, soundId: sounds[0].id },
          });
        }
      }
    }
  }

  console.log("→ Seeding color palettes…");
  await prisma.colorPalette.create({
    data: {
      userId: user.id,
      name: "Coachella W2", tag: "festival, golden hour",
      referenceUrl: "https://picsum.photos/seed/palette-1/600/400",
      swatches: { create: [
        { hex: "#F472B6", role: "outfit", position: 0 },
        { hex: "#A855F7", role: "accent", position: 1 },
        { hex: "#FBBF24", role: "grade", position: 2 },
        { hex: "#1E1B4B", role: "set", position: 3 },
      ]},
    },
  });
  await prisma.colorPalette.create({
    data: {
      userId: user.id,
      name: "Pink wash → silver", tag: "hair drop",
      referenceUrl: "https://picsum.photos/seed/palette-2/600/400",
      swatches: { create: [
        { hex: "#EC4899", role: "hair", position: 0 },
        { hex: "#E5E7EB", role: "hair", position: 1 },
        { hex: "#0F172A", role: "set", position: 2 },
      ]},
    },
  });
  await prisma.colorPalette.create({
    data: {
      userId: user.id,
      name: "Studio neon", tag: "art",
      swatches: { create: [
        { hex: "#A855F7", role: "accent", position: 0 },
        { hex: "#06B6D4", role: "accent", position: 1 },
        { hex: "#10B981", role: "accent", position: 2 },
        { hex: "#0A0613", role: "set", position: 3 },
      ]},
    },
  });

  console.log("→ Seeding affiliate programs + action items…");
  const affiliates: Array<{ brand: string; programName: string; commissionBps?: number; commissionNote?: string; status: AffiliateStatus }> = [
    { brand: "Glossier", programName: "Creator", commissionBps: 1000, status: AffiliateStatus.ACTIVE },
    { brand: "Sephora", programName: "Squad", commissionBps: 500, status: AffiliateStatus.APPROVED },
    { brand: "Revolve", programName: "Ambassador", commissionBps: 800, status: AffiliateStatus.APPLIED },
    { brand: "Amazon", programName: "Associates", commissionNote: "Variable 1–10%", status: AffiliateStatus.ACTIVE },
    { brand: "LTK", programName: "Creator", commissionNote: "Brand-specific", status: AffiliateStatus.TO_APPLY },
    { brand: "Olaplex", programName: "Pro", commissionBps: 1200, status: AffiliateStatus.TO_APPLY },
  ];
  await Promise.all(affiliates.map((a) => prisma.affiliateProgram.create({ data: { ...a, userId: user.id } })));

  const actionItems = [
    "Create LTK account",
    "Enroll in TikTok Creator Rewards",
    "Update Instagram bio with media kit link",
    "Reply to Glossier brand email",
    "File quarterly creator taxes",
    "Renew domain prism.studio",
    "Schedule shoot for Olaplex pitch",
    "Order new ring light for travel",
  ];
  await Promise.all(
    actionItems.map((title, position) =>
      prisma.actionItem.create({ data: { userId: user.id, title, position } }),
    ),
  );

  console.log("→ Seeding goals…");
  const goals: Array<{ kind: GoalKind; target: number; current: number; targetDate: Date }> = [
    { kind: GoalKind.FOLLOWERS_TIKTOK, target: 500_000, current: 312_400, targetDate: daysAgo(-90) },
    { kind: GoalKind.FOLLOWERS_INSTAGRAM, target: 100_000, current: 67_800, targetDate: daysAgo(-90) },
    { kind: GoalKind.VIEWS_MONTHLY, target: 10_000_000, current: 6_240_000, targetDate: daysAgo(-30) },
    { kind: GoalKind.REVENUE_MONTHLY, target: 8_000, current: 4_125, targetDate: daysAgo(-30) },
  ];
  await Promise.all(goals.map((g) => prisma.goal.create({ data: { ...g, userId: user.id } })));

  // PlatformConnection rows are intentionally NOT seeded.
  // Settings will accurately show "Not connected" until the real OAuth flow runs
  // (Settings → Connect TikTok / Connect Instagram). See CONNECTIONS.md.

  const counts = await Promise.all([
    prisma.post.count(), prisma.sound.count(), prisma.inspiration.count(),
    prisma.idea.count(), prisma.checklistItem.count(),
    prisma.affiliateProgram.count(), prisma.colorPalette.count(),
  ]);
  console.log(
    `\n✓ Seed complete\n  user: demo@prism.app / demo1234\n  posts:${counts[0]} sounds:${counts[1]} insp:${counts[2]} ideas:${counts[3]} checklist:${counts[4]} affiliates:${counts[5]} palettes:${counts[6]}\n`,
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
