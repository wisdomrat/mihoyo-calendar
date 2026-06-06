#!/usr/bin/env node
/**
 * Multi-source character data fetcher
 * Sources: BWIKI (primary), Fandom (images), manual fallback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GAMES = {
  genshin: {
    name: '原神',
    fandomWiki: 'genshin-impact.fandom.com',
    bwiki: 'wiki.biligame.com/ys',
    bwikiName: 'ys',
  },
  hsr: {
    name: '崩坏：星穹铁道',
    fandomWiki: 'honkai-star-rail.fandom.com',
    bwiki: 'wiki.biligame.com/sr',
    bwikiName: 'sr',
  },
  zzz: {
    name: '绝区零',
    fandomWiki: 'zenless-zone-zero.fandom.com',
    bwiki: 'wiki.biligame.com/zzz',
    bwikiName: 'zzz',
  },
  honkai3: {
    name: '崩坏3',
    fandomWiki: 'honkaiimpact3.fandom.com',
    bwiki: 'wiki.biligame.com/bh3',
    bwikiName: 'bh3',
  },
};

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Referer': 'https://wiki.biligame.com/',
};

function generateDefaultAvatar(name, gameId) {
  const colors = {
    genshin: '4a90e2',
    hsr: '6b5ce7',
    zzz: 'ff6b6b',
    honkai3: 'ff8cc8',
  };
  const color = colors[gameId] || '999999';
  const initial = name.charAt(0);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=${color}&color=fff&size=256&font-size=0.5&bold=true`;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers: FETCH_HEADERS });
      if (response.ok) return response;
    } catch (error) {
      console.warn(`    Retry ${i + 1}/${retries} failed:`, error.message);
    }
    if (i < retries - 1) await sleep(1500 * (i + 1));
  }
  return null;
}

async function fetchJson(url, retries = 3) {
  const response = await fetchWithRetry(url, retries);
  if (!response) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// Parse BWIKI wikitext - comprehensive patterns
function parseBwikiWikitext(wikitext) {
  const info = {};
  
  // Birthday patterns
  const birthdayPatterns = [
    /\|\s*生日\s*[=＝]\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/,
    /\|\s*生日\s*[=＝]\s*(\d{1,2})月(\d{1,2})日/,
    /生日\s*[=＝]\s*(\d{1,2})月(\d{1,2})日/,
    /\|\s*生日\s*[=＝]\s*(\d{1,2})\.(\d{1,2})/,
    /\|\s*生日\s*[=＝]\s*(\d{1,2})\/(\d{1,2})/,
  ];
  
  for (const pattern of birthdayPatterns) {
    const match = wikitext.match(pattern);
    if (match) {
      info.birthday = `${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
      break;
    }
  }
  
  // English name
  const enPatterns = [
    /\|\s*英文名称\s*[=＝]\s*([^\n|]+)/,
    /\|\s*英文名\s*[=＝]\s*([^\n|]+)/,
    /\|\s*英文名字\s*[=＝]\s*([^\n|]+)/,
    /\|\s*name_en\s*[=＝]\s*([^\n|]+)/i,
  ];
  for (const p of enPatterns) {
    const m = wikitext.match(p);
    if (m) { info.nameEn = m[1].trim(); break; }
  }
  
  // Element
  const elemPatterns = [
    /\|\s*元素属性\s*[=＝]\s*([^\n|]+)/,
    /\|\s*属性\s*[=＝]\s*([^\n|]+)/,
    /\|\s*元素\s*[=＝]\s*([^\n|]+)/,
  ];
  for (const p of elemPatterns) {
    const m = wikitext.match(p);
    if (m) { info.element = m[1].trim(); break; }
  }
  
  // Weapon
  const weaponPatterns = [
    /\|\s*武器类型\s*[=＝]\s*([^\n|]+)/,
    /\|\s*命途\s*[=＝]\s*([^\n|]+)/,
    /\|\s*武器\s*[=＝]\s*([^\n|]+)/,
  ];
  for (const p of weaponPatterns) {
    const m = wikitext.match(p);
    if (m) { info.weapon = m[1].trim(); break; }
  }
  
  // Rarity
  const rarityPatterns = [
    /\|\s*稀有度\s*[=＝]\s*(\d)星/,
    /\|\s*稀有度\s*[=＝]\s*(\d)/,
    /\|\s*星级\s*[=＝]\s*(\d)/,
  ];
  for (const p of rarityPatterns) {
    const m = wikitext.match(p);
    if (m) { info.rarity = parseInt(m[1]); break; }
  }
  
  // Region
  const regionPatterns = [
    /\|\s*所属\s*[=＝]\s*([^\n|]+)/,
    /\|\s*阵营\s*[=＝]\s*([^\n|]+)/,
    /\|\s*地区\s*[=＝]\s*([^\n|]+)/,
  ];
  for (const p of regionPatterns) {
    const m = wikitext.match(p);
    if (m) { info.region = m[1].trim(); break; }
  }
  
  return info;
}

// Get image from BWIKI file paths
async function getBwikiImage(charName, bwikiName) {
  const patterns = [
    `${charName}头像.png`,
    `${charName}.png`,
    `${charName}证件照.png`,
    `${charName}立绘.png`,
  ];
  
  for (const imgName of patterns) {
    const url = `https://wiki.biligame.com/${bwikiName}/Special:FilePath/${encodeURIComponent(imgName)}`;
    try {
      const response = await fetchWithRetry(url, 1);
      if (response?.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.startsWith('image/')) {
          return url;
        }
      }
    } catch {}
  }
  return null;
}

// Get image from Fandom
async function getFandomImage(enName, fandomWiki) {
  if (!enName) return null;
  
  try {
    const url = `https://${fandomWiki}/api.php?action=query&titles=${encodeURIComponent(enName)}&prop=pageimages&format=json&pithumbsize=300`;
    const data = await fetchJson(url);
    
    if (data?.query?.pages) {
      const page = Object.values(data.query.pages)[0];
      if (page.thumbnail?.source) {
        return page.thumbnail.source.replace(/\/revision\/latest\/scale-to-width-down\/\d+/, '/revision/latest');
      }
    }
  } catch {}
  
  return null;
}

// Fetch from BWIKI
async function fetchFromBwiki(gameId, config) {
  console.log(`\n📚 Fetching BWIKI for ${config.name}...`);
  
  try {
    const listUrl = `https://${config.bwiki}/api.php?action=query&list=categorymembers&cmtitle=Category:角色&cmlimit=150&format=json`;
    const listData = await fetchJson(listUrl);
    
    if (!listData?.query?.categorymembers) {
      console.warn(`  ⚠️ API blocked or no data - keeping existing characters for ${gameId}`);
      return [];
    }
    
    const pages = listData.query.categorymembers.filter(p => 
      p.title && !p.title.includes(':') && !p.title.includes('分类') && p.title.length < 25
    );
    
    console.log(`  Found ${pages.length} characters`);
    
    const characters = [];
    let processed = 0;
    let skipped = 0;
    
    for (const page of pages) {
      try {
        const wikiUrl = `https://${config.bwiki}/api.php?action=query&prop=revisions&rvprop=content&titles=${encodeURIComponent(page.title)}&format=json`;
        const wikiData = await fetchJson(wikiUrl);
        
        if (!wikiData?.query?.pages) continue;
        
        const wikiPage = Object.values(wikiData.query.pages)[0];
        const wikitext = wikiPage.revisions?.[0]?.['*'] || '';
        const info = parseBwikiWikitext(wikitext);
        
        if (!info.birthday) {
          skipped++;
          continue;
        }
        
        // Get images
        let avatar = await getBwikiImage(page.title, config.bwikiName);
        if (!avatar && info.nameEn) {
          avatar = await getFandomImage(info.nameEn, config.fandomWiki);
        }
        if (!avatar) {
          avatar = generateDefaultAvatar(page.title, gameId);
        }
        
        characters.push({
          id: `${page.title}-${gameId}`,
          name: page.title,
          nameEn: info.nameEn || page.title,
          game: gameId,
          birthday: info.birthday,
          avatar,
          rarity: info.rarity || 4,
          element: info.element || '',
          weapon: info.weapon || '',
          region: info.region || '',
          source: 'wiki',
          updatedAt: new Date().toISOString(),
        });
        
        processed++;
        if (processed % 10 === 0) {
          console.log(`  Progress: ${processed}/${pages.length} (skipped: ${skipped})`);
        }
        
        await sleep(200);
      } catch (error) {
        console.warn(`  Error: ${page.title} - ${error.message}`);
      }
    }
    
    console.log(`  ✅ ${characters.length} characters (skipped ${skipped})`);
    return characters;
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
    return [];
  }
}

function loadExistingData() {
  try {
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'characters.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch {}
  return [];
}

function mergeData(existing, newChars) {
  const map = new Map(existing.map(c => [c.id, c]));
  
  for (const char of newChars) {
    if (!map.has(char.id)) {
      map.set(char.id, char);
    } else {
      const existing = map.get(char.id);
      if (char.avatar && !char.avatar.includes('ui-avatars.com')) {
        existing.avatar = char.avatar;
      }
      if (!existing.birthday && char.birthday) existing.birthday = char.birthday;
      if (!existing.nameEn && char.nameEn) existing.nameEn = char.nameEn;
      if (!existing.element && char.element) existing.element = char.element;
      if (!existing.weapon && char.weapon) existing.weapon = char.weapon;
      if (!existing.region && char.region) existing.region = char.region;
    }
  }
  
  return Array.from(map.values());
}

async function main() {
  console.log('🎮 Fetching character data from multiple sources...\n');
  
  const existing = loadExistingData();
  console.log(`📂 Loaded ${existing.length} existing characters`);
  
  let allCharacters = [...existing];
  
  for (const [gameId, config] of Object.entries(GAMES)) {
    const newChars = await fetchFromBwiki(gameId, config);
    allCharacters = mergeData(allCharacters, newChars);
    await sleep(2000);
  }
  
  // Summary
  const byGame = {};
  let withAvatar = 0;
  let withBirthday = 0;
  
  for (const char of allCharacters) {
    byGame[char.game] = (byGame[char.game] || 0) + 1;
    if (char.avatar && !char.avatar.includes('ui-avatars.com')) withAvatar++;
    if (char.birthday && char.birthday !== '??-??') withBirthday++;
  }
  
  console.log(`\n✅ Total: ${allCharacters.length} characters`);
  console.log('\n📊 By game:');
  for (const [game, count] of Object.entries(byGame)) {
    console.log(`  ${game}: ${count}`);
  }
  console.log(`\n🖼️ With images: ${withAvatar}/${allCharacters.length}`);
  console.log(`📅 With birthdays: ${withBirthday}/${allCharacters.length}`);
  
  // Save
  for (const dir of ['public/data', 'src/data']) {
    const fullDir = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
    fs.writeFileSync(path.join(fullDir, 'characters.json'), JSON.stringify(allCharacters, null, 2));
    console.log(`💾 Saved to ${dir}/characters.json`);
  }
}

main().catch(console.error);
