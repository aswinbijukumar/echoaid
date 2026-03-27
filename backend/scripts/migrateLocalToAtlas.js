import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

// Generic module titles seeded by the populate script (to remove)
const SEEDED_TITLES = [
  'Hello & Goodbye', 'Please & Thank You', 'Yes & No',
  'Letters A-M', 'Letters N-Z', 'Numbers 1-10',
  'Greetings', 'Questions', 'Family Members',
  'Daily Activities', 'Complex Conversations',
  // From populateLearningModules.js
  'Basic Greetings', 'Family Members', 'Numbers 1-5',
  'Letters A-E', 'Common Phrases', 'Numbers 6-10',
  'Advanced Conversations', 'Complete Alphabet'
];

const SkillSchema = new mongoose.Schema({}, { strict: false });

async function migrate() {
  console.log('Step 1: Connecting to LOCAL MongoDB...');
  const localConn = await mongoose.createConnection('mongodb://localhost:27017/echoaid').asPromise();
  const LocalSkill = localConn.model('Skill', SkillSchema);

  const localSkills = await LocalSkill.find();
  console.log(`Found ${localSkills.length} skills in local DB:`);
  localSkills.forEach(s => console.log(` - "${s.title}" (level ${s.level}, ${s.category})`));

  console.log('\nStep 2: Connecting to ATLAS...');
  const atlasConn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
  const AtlasSkill = atlasConn.model('Skill', SkillSchema);

  console.log('\nStep 3: Removing generic seeded modules from Atlas...');
  const deleteResult = await AtlasSkill.deleteMany({ title: { $in: SEEDED_TITLES } });
  console.log(`Deleted ${deleteResult.deletedCount} generic seeded modules from Atlas.`);

  console.log('\nStep 4: Migrating your custom modules to Atlas...');
  let migrated = 0;
  let skipped = 0;

  for (const skill of localSkills) {
    const existing = await AtlasSkill.findOne({ title: skill.title });
    if (existing) {
      console.log(` ⏭️  Skipped "${skill.title}" (already exists in Atlas)`);
      skipped++;
      continue;
    }

    const data = skill.toObject();
    delete data._id; // Let Atlas generate new _id
    delete data.__v;

    // Set createdBy to null if it references a local user ID
    if (data.createdBy) delete data.createdBy;

    await AtlasSkill.create(data);
    console.log(` ✅ Migrated: "${skill.title}"`);
    migrated++;
  }

  const finalCount = await AtlasSkill.countDocuments();
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Migrated: ${migrated} modules`);
  console.log(`   ⏭️  Skipped: ${skipped} (already in Atlas)`);
  console.log(`   📚 Total in Atlas now: ${finalCount} modules`);

  await localConn.close();
  await atlasConn.close();
  console.log('\n✅ Done! Your custom modules are now in Atlas.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
