import { PrismaClient, ItemType, ItemSlot, ItemRarity, SelfCareArea, QuestType, Currency } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // SEED ITEMS
  // ============================================
  console.log('📦 Seeding items...');

  const items = await Promise.all([
    // Backgrounds
    prisma.item.upsert({
      where: { code: 'bg_meadow' },
      update: {},
      create: {
        code: 'bg_meadow',
        name: 'Sunny Meadow',
        description: 'A peaceful meadow with wildflowers',
        type: ItemType.BACKGROUND,
        slot: ItemSlot.BACKGROUND,
        rarity: ItemRarity.COMMON,
        priceSoft: 100,
        priceHard: 0,
        metadataJson: { color: '#90EE90', gradient: ['#90EE90', '#98FB98'] },
      },
    }),
    prisma.item.upsert({
      where: { code: 'bg_forest' },
      update: {},
      create: {
        code: 'bg_forest',
        name: 'Enchanted Forest',
        description: 'A mystical forest with glowing mushrooms',
        type: ItemType.BACKGROUND,
        slot: ItemSlot.BACKGROUND,
        rarity: ItemRarity.UNCOMMON,
        priceSoft: 250,
        priceHard: 0,
        metadataJson: { color: '#228B22', gradient: ['#228B22', '#2E8B57'] },
      },
    }),
    prisma.item.upsert({
      where: { code: 'bg_ocean' },
      update: {},
      create: {
        code: 'bg_ocean',
        name: 'Ocean Sunset',
        description: 'Waves gently lapping at golden sands',
        type: ItemType.BACKGROUND,
        slot: ItemSlot.BACKGROUND,
        rarity: ItemRarity.RARE,
        priceSoft: 500,
        priceHard: 0,
        metadataJson: { color: '#4169E1', gradient: ['#FF6B6B', '#4169E1'] },
      },
    }),
    prisma.item.upsert({
      where: { code: 'bg_starry' },
      update: {},
      create: {
        code: 'bg_starry',
        name: 'Starry Night',
        description: 'A beautiful night sky full of stars',
        type: ItemType.BACKGROUND,
        slot: ItemSlot.BACKGROUND,
        rarity: ItemRarity.EPIC,
        priceSoft: 0,
        priceHard: 50,
        premiumOnly: true,
        metadataJson: { color: '#191970', gradient: ['#191970', '#000033'] },
      },
    }),

    // Frames
    prisma.item.upsert({
      where: { code: 'frame_simple' },
      update: {},
      create: {
        code: 'frame_simple',
        name: 'Simple Frame',
        description: 'A clean, simple frame',
        type: ItemType.FRAME,
        slot: ItemSlot.FRAME,
        rarity: ItemRarity.COMMON,
        priceSoft: 50,
        priceHard: 0,
        metadataJson: { borderColor: '#8B4513', borderWidth: 4 },
      },
    }),
    prisma.item.upsert({
      where: { code: 'frame_golden' },
      update: {},
      create: {
        code: 'frame_golden',
        name: 'Golden Frame',
        description: 'A luxurious golden frame',
        type: ItemType.FRAME,
        slot: ItemSlot.FRAME,
        rarity: ItemRarity.RARE,
        priceSoft: 0,
        priceHard: 25,
        metadataJson: { borderColor: '#FFD700', borderWidth: 6 },
      },
    }),

    // Hats
    prisma.item.upsert({
      where: { code: 'hat_flower' },
      update: {},
      create: {
        code: 'hat_flower',
        name: 'Flower Crown',
        description: 'A beautiful crown made of flowers',
        type: ItemType.ACCESSORY,
        slot: ItemSlot.HAT,
        rarity: ItemRarity.COMMON,
        priceSoft: 150,
        priceHard: 0,
        metadataJson: { emoji: '🌸' },
      },
    }),
    prisma.item.upsert({
      where: { code: 'hat_wizard' },
      update: {},
      create: {
        code: 'hat_wizard',
        name: 'Wizard Hat',
        description: 'A mystical wizard hat',
        type: ItemType.ACCESSORY,
        slot: ItemSlot.HAT,
        rarity: ItemRarity.UNCOMMON,
        priceSoft: 300,
        priceHard: 0,
        metadataJson: { emoji: '🧙' },
      },
    }),
    prisma.item.upsert({
      where: { code: 'hat_crown' },
      update: {},
      create: {
        code: 'hat_crown',
        name: 'Royal Crown',
        description: 'A crown fit for royalty',
        type: ItemType.ACCESSORY,
        slot: ItemSlot.HAT,
        rarity: ItemRarity.LEGENDARY,
        priceSoft: 0,
        priceHard: 100,
        premiumOnly: true,
        metadataJson: { emoji: '👑' },
      },
    }),

    // Accessories
    prisma.item.upsert({
      where: { code: 'acc_scarf' },
      update: {},
      create: {
        code: 'acc_scarf',
        name: 'Cozy Scarf',
        description: 'A warm and cozy scarf',
        type: ItemType.ACCESSORY,
        slot: ItemSlot.ACCESSORY_1,
        rarity: ItemRarity.COMMON,
        priceSoft: 100,
        priceHard: 0,
        metadataJson: { emoji: '🧣' },
      },
    }),
    prisma.item.upsert({
      where: { code: 'acc_glasses' },
      update: {},
      create: {
        code: 'acc_glasses',
        name: 'Cool Sunglasses',
        description: 'Look cool while staying safe from the sun',
        type: ItemType.ACCESSORY,
        slot: ItemSlot.ACCESSORY_1,
        rarity: ItemRarity.UNCOMMON,
        priceSoft: 200,
        priceHard: 0,
        metadataJson: { emoji: '😎' },
      },
    }),
  ]);

  console.log(`✅ Created ${items.length} items`);

  // ============================================
  // SEED QUEST TEMPLATES
  // ============================================
  console.log('🎯 Seeding quest templates...');

  const questTemplates = await Promise.all([
    prisma.questTemplate.upsert({
      where: { code: 'daily_mood_check' },
      update: {},
      create: {
        code: 'daily_mood_check',
        title: 'Check Your Mood',
        description: 'Log how you\'re feeling today',
        type: QuestType.DAILY,
        selfCareArea: SelfCareArea.MIND,
        requirementsJson: { action: 'mood_entry', count: 1 },
        rewardsJson: { xp: 10, coins: 5 },
      },
    }),
    prisma.questTemplate.upsert({
      where: { code: 'daily_goal_complete' },
      update: {},
      create: {
        code: 'daily_goal_complete',
        title: 'Achieve a Goal',
        description: 'Complete at least one goal today',
        type: QuestType.DAILY,
        selfCareArea: null,
        requirementsJson: { action: 'goal_completion', count: 1 },
        rewardsJson: { xp: 15, coins: 10 },
      },
    }),
    prisma.questTemplate.upsert({
      where: { code: 'daily_journal' },
      update: {},
      create: {
        code: 'daily_journal',
        title: 'Journal Time',
        description: 'Write a journal entry',
        type: QuestType.DAILY,
        selfCareArea: SelfCareArea.MIND,
        requirementsJson: { action: 'journal_entry', count: 1 },
        rewardsJson: { xp: 20, coins: 15 },
      },
    }),
    prisma.questTemplate.upsert({
      where: { code: 'daily_breathing' },
      update: {},
      create: {
        code: 'daily_breathing',
        title: 'Take a Breath',
        description: 'Complete a breathing exercise',
        type: QuestType.DAILY,
        selfCareArea: SelfCareArea.MIND,
        requirementsJson: { action: 'breathing_session', count: 1 },
        rewardsJson: { xp: 10, coins: 5 },
      },
    }),
    prisma.questTemplate.upsert({
      where: { code: 'daily_triple' },
      update: {},
      create: {
        code: 'daily_triple',
        title: 'Triple Threat',
        description: 'Complete 3 different self-care activities',
        type: QuestType.DAILY,
        selfCareArea: null,
        requirementsJson: { action: 'any_activity', count: 3, unique: true },
        rewardsJson: { xp: 50, coins: 25, gems: 5 },
      },
    }),
  ]);

  console.log(`✅ Created ${questTemplates.length} quest templates`);

  // ============================================
  // SEED SHOP ITEMS
  // ============================================
  console.log('🏪 Seeding shop items...');

  const shopItems = await Promise.all(
    items.map((item) =>
      prisma.shopItem.upsert({
        where: { id: `shop_${item.id}` },
        update: {},
        create: {
          id: `shop_${item.id}`,
          itemId: item.id,
          priceCurrency: item.priceHard > 0 ? Currency.HARD : Currency.SOFT,
          priceAmount: item.priceHard > 0 ? item.priceHard : item.priceSoft,
          featured: item.rarity === ItemRarity.RARE || item.rarity === ItemRarity.EPIC,
        },
      })
    )
  );

  console.log(`✅ Created ${shopItems.length} shop items`);

  // ============================================
  // SEED DEMO USER
  // ============================================
  console.log('👤 Seeding demo user...');

  const passwordHash = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
      timezone: 'America/New_York',
      locale: 'en',
      lastLoginAt: new Date(),
    },
  });

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      notificationsEnabled: true,
      marketingOptIn: false,
      darkMode: false,
    },
  });

  // Create pet
  await prisma.pet.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      name: 'Pip',
      pronouns: 'they/them',
      level: 3,
      xp: 250,
      energy: 75,
      happiness: 80,
    },
  });

  // Create wallet
  await prisma.wallet.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      softBalance: 500,
      hardBalance: 50,
    },
  });

  // Create subscription
  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      tier: 'FREE',
    },
  });

  // Add some inventory items (equip meadow background and flower crown)
  const meadowItem = items.find((i) => i.code === 'bg_meadow');
  const flowerItem = items.find((i) => i.code === 'hat_flower');
  const simpleFrame = items.find((i) => i.code === 'frame_simple');

  if (meadowItem) {
    await prisma.inventoryItem.upsert({
      where: { userId_itemId: { userId: demoUser.id, itemId: meadowItem.id } },
      update: { equipped: true },
      create: {
        userId: demoUser.id,
        itemId: meadowItem.id,
        equipped: true,
      },
    });
  }

  if (flowerItem) {
    await prisma.inventoryItem.upsert({
      where: { userId_itemId: { userId: demoUser.id, itemId: flowerItem.id } },
      update: { equipped: true },
      create: {
        userId: demoUser.id,
        itemId: flowerItem.id,
        equipped: true,
      },
    });
  }

  if (simpleFrame) {
    await prisma.inventoryItem.upsert({
      where: { userId_itemId: { userId: demoUser.id, itemId: simpleFrame.id } },
      update: {},
      create: {
        userId: demoUser.id,
        itemId: simpleFrame.id,
        equipped: false,
      },
    });
  }

  // Create goals
  const goals = await Promise.all([
    prisma.goal.upsert({
      where: { id: 'demo_goal_sleep' },
      update: {},
      create: {
        id: 'demo_goal_sleep',
        userId: demoUser.id,
        title: 'Sleep 8 hours',
        selfCareArea: SelfCareArea.SLEEP,
        scheduleType: 'DAILY',
      },
    }),
    prisma.goal.upsert({
      where: { id: 'demo_goal_exercise' },
      update: {},
      create: {
        id: 'demo_goal_exercise',
        userId: demoUser.id,
        title: '30 min exercise',
        selfCareArea: SelfCareArea.BODY,
        scheduleType: 'DAILY',
      },
    }),
    prisma.goal.upsert({
      where: { id: 'demo_goal_meditate' },
      update: {},
      create: {
        id: 'demo_goal_meditate',
        userId: demoUser.id,
        title: 'Meditate 10 min',
        selfCareArea: SelfCareArea.MIND,
        scheduleType: 'DAILY',
      },
    }),
    prisma.goal.upsert({
      where: { id: 'demo_goal_water' },
      update: {},
      create: {
        id: 'demo_goal_water',
        userId: demoUser.id,
        title: 'Drink 8 glasses of water',
        selfCareArea: SelfCareArea.NUTRITION,
        scheduleType: 'DAILY',
      },
    }),
    prisma.goal.upsert({
      where: { id: 'demo_goal_friend' },
      update: {},
      create: {
        id: 'demo_goal_friend',
        userId: demoUser.id,
        title: 'Talk to a friend',
        selfCareArea: SelfCareArea.SOCIAL,
        scheduleType: 'DAILY',
      },
    }),
  ]);

  console.log(`✅ Created ${goals.length} demo goals`);

  // Create journal entries
  const journalEntries = await Promise.all([
    prisma.journalEntry.upsert({
      where: { id: 'demo_journal_1' },
      update: {},
      create: {
        id: 'demo_journal_1',
        userId: demoUser.id,
        title: 'A Great Start',
        content: 'Today was a wonderful day! I woke up feeling refreshed and had a productive morning. The weather was beautiful and I took a nice walk outside.',
        tags: ['grateful', 'productive'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.journalEntry.upsert({
      where: { id: 'demo_journal_2' },
      update: {},
      create: {
        id: 'demo_journal_2',
        userId: demoUser.id,
        title: 'Reflections',
        content: 'Been thinking a lot about my goals lately. I want to be more consistent with my self-care routine. Small steps every day!',
        tags: ['reflection', 'goals'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.journalEntry.upsert({
      where: { id: 'demo_journal_3' },
      update: {},
      create: {
        id: 'demo_journal_3',
        userId: demoUser.id,
        title: 'Learning to Rest',
        content: 'Today I learned that rest is not laziness. Taking breaks is important for my mental health. I spent some quiet time reading and it felt great.',
        tags: ['rest', 'mindfulness'],
        createdAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${journalEntries.length} demo journal entries`);

  // Create mood entries for the past week
  const moodLabels = ['Amazing', 'Good', 'Okay', 'Down', 'Struggling'];
  const moodTags = ['Work', 'Friends', 'Exercise', 'Family', 'Outdoors'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const moodScore = Math.floor(Math.random() * 3) + 3; // 3-5 for demo
    
    await prisma.moodEntry.create({
      data: {
        userId: demoUser.id,
        moodScore,
        moodLabel: moodLabels[5 - moodScore],
        tags: [moodTags[Math.floor(Math.random() * moodTags.length)]],
        notes: i === 0 ? 'Feeling good today!' : null,
        createdAt: date,
      },
    });
  }

  console.log('✅ Created demo mood entries');

  // Create streaks
  await Promise.all([
    prisma.streak.upsert({
      where: { userId_selfCareArea: { userId: demoUser.id, selfCareArea: SelfCareArea.MIND } },
      update: {},
      create: {
        userId: demoUser.id,
        selfCareArea: SelfCareArea.MIND,
        currentStreakDays: 4,
        longestStreakDays: 7,
        lastActiveDate: new Date(),
      },
    }),
    prisma.streak.upsert({
      where: { userId_selfCareArea: { userId: demoUser.id, selfCareArea: SelfCareArea.BODY } },
      update: {},
      create: {
        userId: demoUser.id,
        selfCareArea: SelfCareArea.BODY,
        currentStreakDays: 2,
        longestStreakDays: 5,
        lastActiveDate: new Date(),
      },
    }),
  ]);

  console.log('✅ Created demo streaks');

  // Create daily quests for demo user
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  for (const template of questTemplates.slice(0, 3)) {
    await prisma.userQuest.upsert({
      where: { id: `demo_quest_${template.id}` },
      update: {},
      create: {
        id: `demo_quest_${template.id}`,
        userId: demoUser.id,
        questTemplateId: template.id,
        state: 'ACTIVE',
        progressJson: { count: 0 },
        expiresAt: today,
      },
    });
  }

  console.log('✅ Created demo quests');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

