
import fs from 'fs';
import path from 'path';

const fixes = [
    { kanji: "更に", reading: "さらに", distractors: ["もっと", "あらに", "ふかに"] },
    { kanji: "ジーンズ", reading: "ジーンズ", distractors: ["ジャーンズ", "ジェーンズ", "ジーヌス"] },
    { kanji: "しかも", reading: "しかも", distractors: ["しかし", "しかめ", "しかむ"] },
    { kanji: "資源", reading: "しげん", distractors: ["じげん", "しけん", "しじげん"] },
    { kanji: "支出", reading: "ししゅつ", distractors: ["じしゅつ", "しじゅつ", "ししつ"] },
    { kanji: "支店", reading: "してん", distractors: ["じてん", "しでん", "してつ"] },
    { kanji: "出版", reading: "しゅっぱん", distractors: ["しゅっぱつ", "しゅつぱん", "しゅっぺん"] },
    { kanji: "身長", reading: "しんちょう", distractors: ["じんちょう", "しんじょう", "しんちょ"] },
    { kanji: "進める", reading: "すすめる", distractors: ["すすむ", "すすめろ", "すすまる"] },
    { kanji: "世間", reading: "せけん", distractors: ["せかい", "せんけん", "せかん"] },
    { kanji: "愛する", reading: "あいする", distractors: ["あいしる", "あえする", "あいざる"] },
    { kanji: "脂", reading: "あぶら", distractors: ["ゆ", "し", "あぷら"] },
    { kanji: "現れ", reading: "あらわれ", distractors: ["あらわれる", "あらわら", "あらわ"] },
    { kanji: "いつのまにか", reading: "いつのまにか", distractors: ["いつのまに", "いつのまにゃか", "いつのまにかぁ"] },
    { kanji: "一般", reading: "いっぱん", distractors: ["いちばん", "いっぱざん", "いっぽん"] },
    { kanji: "インク", reading: "インク", distractors: ["インクク", "インクー", "インキ"] },
    { kanji: "お洒落", reading: "おしゃれ", distractors: ["おしやれ", "おしぇれ", "おしゃら"] },
    { kanji: "恐れる", reading: "おそれる", distractors: ["おそれろ", "おそれよる", "おそらる"] },
    { kanji: "絵画", reading: "かいが", distractors: ["えが", "がいい", "がいか"] },
    { kanji: "海外", reading: "かいがい", distractors: ["かいがいじん", "かいがいくに", "かいかい"] }
];

const filePath = path.join(process.cwd(), 'public', 'data', 'n3-questions.json');
const content = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(content);

let fixedCount = 0;

for (const fix of fixes) {
    const item = data.find((d: any) => d.kanji === fix.kanji);
    if (item) {
        // Double check if it needs fixing (contains reading)
        if (item.distractors.includes(item.reading)) {
            item.distractors = fix.distractors;
            fixedCount++;
            console.log(`Fixed ${fix.kanji}`);
        } else {
            // Even if not strictly containing reading, if we want to force update to be safe
            // But let's only fix if broken to respect existing valid ones if any?
            // Actually, strict check confirms they ARE broken.
            console.log(`Item ${fix.kanji} is already clean? Distractors: ${JSON.stringify(item.distractors)} vs Reading: ${item.reading}`);
            // If manual check says it is clean, we skip. But user said they are broken.
            // We'll force update if it matches the 'broken' state or just force update.
            item.distractors = fix.distractors;
            fixedCount++;
            console.log(`Force Updated ${fix.kanji}`);
        }
    } else {
        console.warn(`Could not find item ${fix.kanji}`);
    }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`\nManually fixed ${fixedCount} items in N3.`);
