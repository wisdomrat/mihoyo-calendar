#!/usr/bin/env node
/**
 * Enhanced character data fetcher
 * Fetches from BWIKI (Chinese data) and Fandom (images)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Game configurations
const GAMES = {
  genshin: {
    name: '原神',
    fandomWiki: 'genshin-impact.fandom.com',
    bwiki: 'wiki.biligame.com/ys',
    bwikiListPage: 'https://wiki.biligame.com/ys/角色筛选',
  },
  hsr: {
    name: '崩坏：星穹铁道',
    fandomWiki: 'honkai-star-rail.fandom.com',
    bwiki: 'wiki.biligame.com/sr',
    bwikiListPage: 'https://wiki.biligame.com/sr/角色图鉴',
  },
  zzz: {
    name: '绝区零',
    fandomWiki: 'zenless-zone-zero.fandom.com',
    bwiki: 'wiki.biligame.com/zzz',
    bwikiListPage: 'https://wiki.biligame.com/zzz/角色图鉴',
  },
  honkai3: {
    name: '崩坏3',
    fandomWiki: 'honkaiimpact3.fandom.com',
    bwiki: 'wiki.biligame.com/bh3',
    bwikiListPage: 'https://wiki.biligame.com/bh3/角色',
  },
};

// Default avatar generator
function generateDefaultAvatar(name, gameId) {
  const colors = {
    genshin: '4a90e2',
    hsr: '6b5ce7',
    zzz: 'ff6b6b',
    honkai3: 'ff8cc8',
  };
  const color = colors[gameId] || '999999';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=256&font-size=0.4&bold=true`;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MiHoYo-Calendar-DataFetcher/2.0 (Node.js)',
        },
      });
      if (response.ok) return await response.json();
      console.warn(`Attempt ${i + 1} failed for ${url}: HTTP ${response.status}`);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, error.message);
    }
    if (i < retries - 1) await sleep(2000 * (i + 1));
  }
  return null;
}

// Parse BWIKI wikitext to extract character info
function parseBwikiWikitext(wikitext, gameId) {
  const info = {};
  
  // Extract birthday
  const birthdayMatch = wikitext.match(/\|生日[=＝]\s*(\d{1,2})月(\d{1,2})日/);
  if (birthdayMatch) {
    const month = birthdayMatch[1].padStart(2, '0');
    const day = birthdayMatch[2].padStart(2, '0');
    info.birthday = `${month}-${day}`;
  }
  
  // Extract English name
  const enNameMatch = wikitext.match(/\|英文名称[=＝]\s*([^\n|]+)/);
  if (enNameMatch) {
    info.nameEn = enNameMatch[1].trim();
  }
  
  // Extract element
  const elementMatch = wikitext.match(/\|元素属性[=＝]\s*([^\n|]+)/) || 
                       wikitext.match(/\|属性[=］]\s*([^\n|]+)/);
  if (elementMatch) {
    info.element = elementMatch[1].trim();
  }
  
  // Extract weapon
  const weaponMatch = wikitext.match(/\|武器类型[=＝]\s*([^\n|]+)/) ||
                      wikitext.match(/\|命途[=］]\s*([^\n|]+)/);
  if (weaponMatch) {
    info.weapon = weaponMatch[1].trim();
  }
  
  // Extract rarity
  const rarityMatch = wikitext.match(/\|稀有度[=＝]\s*(\d)/) ||
                      wikitext.match(/\|稀有度[=＝]\s*(\d)星/);
  if (rarityMatch) {
    info.rarity = parseInt(rarityMatch[1]);
  }
  
  // Extract region
  const regionMatch = wikitext.match(/\|所属[=＝]\s*([^\n|]+)/) ||
                      wikitext.match(/\|阵营[=］]\s*([^\n|]+)/);
  if (regionMatch) {
    info.region = regionMatch[1].trim();
  }
  
  return info;
}

// Fetch Fandom image for a character
async function fetchFandomImage(enName, gameConfig) {
  try {
    const url = `https://${gameConfig.fandomWiki}/api.php?action=query&titles=${encodeURIComponent(enName)}&prop=pageimages&format=json&pithumbsize=300`;
    const data = await fetchJson(url);
    
    if (data?.query?.pages) {
      const page = Object.values(data.query.pages)[0];
      if (page.thumbnail?.source) {
        // Get the full image URL by removing the resize parameters
        let imageUrl = page.thumbnail.source;
        // Convert to full size URL
        imageUrl = imageUrl.replace(/\/revision\/latest\/scale-to-width-down\/\d+/, '/revision/latest');
        return imageUrl;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch Fandom image for ${enName}:`, error.message);
  }
  return null;
}

// Fetch characters from BWIKI
async function fetchBwikiCharacters(gameId, gameConfig) {
  console.log(`\n📚 Fetching BWIKI data for ${gameConfig.name}...`);
  
  try {
    // First, get character list from category
    const listUrl = `https://${gameConfig.bwiki}/api.php?action=query&list=categorymembers&cmtitle=Category:角色&cmlimit=200&format=json`;
    const listData = await fetchJson(listUrl);
    
    if (!listData?.query?.categorymembers) {
      console.warn(`  No category members found for ${gameId}`);
      return [];
    }
    
    const members = listData.query.categorymembers;
    // Filter out non-character pages
    const characterPages = members.filter(p => 
      p.title && 
      !p.title.includes(':') && 
      !p.title.includes('分类') &&
      p.title.length < 30
    );
    
    console.log(`  Found ${characterPages.length} potential characters`);
    
    const characters = [];
    
    for (const page of characterPages.slice(0, 100)) { // Limit to avoid rate limiting
      try {
        // Fetch wikitext
        const wikiUrl = `https://${gameConfig.bwiki}/api.php?action=query&prop=revisions&rvprop=content&titles=${encodeURIComponent(page.title)}&format=json`;
        const wikiData = await fetchJson(wikiUrl);
        
        if (!wikiData?.query?.pages) continue;
        
        const wikiPage = Object.values(wikiData.query.pages)[0];
        const wikitext = wikiPage.revisions?.[0]?.['*'] || '';
        
        // Parse character info
        const info = parseBwikiWikitext(wikitext, gameId);
        
        if (!info.birthday) {
          console.log(`  ⚠️ Skipping ${page.title} - no birthday found`);
          continue;
        }
        
        // Fetch image from Fandom using English name
        let avatar = null;
        if (info.nameEn) {
          avatar = await fetchFandomImage(info.nameEn, gameConfig);
          if (avatar) {
            console.log(`  🖼️  Found image for ${page.title}`);
          }
        }
        
        // Use default avatar if no image found
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
          element: info.element,
          weapon: info.weapon,
          region: info.region,
          source: 'wiki',
          updatedAt: new Date().toISOString(),
        });
        
        console.log(`  ✅ Added: ${page.title} (${info.birthday})`);
        
        // Rate limiting
        await sleep(500);
      } catch (error) {
        console.warn(`  ⚠️ Error processing ${page.title}:`, error.message);
      }
    }
    
    console.log(`  📊 Total fetched for ${gameId}: ${characters.length}`);
    return characters;
  } catch (error) {
    console.error(`  ❌ Error fetching BWIKI for ${gameId}:`, error.message);
    return [];
  }
}

// Load existing data
function loadExistingData() {
  try {
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'characters.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      console.log(`📂 Loaded ${data.length} existing characters`);
      return data;
    }
  } catch (error) {
    console.warn('Could not load existing data:', error.message);
  }
  return [];
}

// Merge new data with existing data
function mergeCharacters(existing, newChars) {
  const merged = [...existing];
  const existingIds = new Set(existing.map(c => c.id));
  
  for (const char of newChars) {
    if (!existingIds.has(char.id)) {
      merged.push(char);
      existingIds.add(char.id);
    } else {
      // Update existing character with new data (especially avatar)
      const idx = merged.findIndex(c => c.id === char.id);
      if (idx !== -1) {
        // Only update if new data has an avatar and old doesn't
        if (char.avatar && !merged[idx].avatar?.includes('ui-avatars.com')) {
          merged[idx] = { ...merged[idx], ...char, updatedAt: new Date().toISOString() };
        }
      }
    }
  }
  
  return merged;
}

async function main() {
  console.log('🎮 Starting enhanced character data fetch...\n');
  
  // Load existing data
  const existingChars = loadExistingData();
  let allCharacters = [...existingChars];
  
  // Fetch from each game
  for (const [gameId, config] of Object.entries(GAMES)) {
    const newChars = await fetchBwikiCharacters(gameId, config);
    allCharacters = mergeCharacters(allCharacters, newChars);
    
    // Wait between games
    await sleep(3000);
  }
  
  console.log(`\n✅ Total characters: ${allCharacters.length}`);
  
  // Summary by game
  const byGame = {};
  let withAvatar = 0;
  for (const char of allCharacters) {
    byGame[char.game] = (byGame[char.game] || 0) + 1;
    if (char.avatar && !char.avatar.includes('ui-avatars.com')) {
      withAvatar++;
    }
  }
  
  console.log('\n📊 Character count by game:');
  for (const [game, count] of Object.entries(byGame)) {
    console.log(`  ${game}: ${count}`);
  }
  console.log(`\n🖼️ Characters with real avatars: ${withAvatar}/${allCharacters.length}`);
  
  // Save to both locations
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const srcDataDir = path.join(__dirname, '..', 'src', 'data');
  
  [dataDir, srcDataDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const outputPath = path.join(dir, 'characters.json');
    fs.writeFileSync(outputPath, JSON.stringify(allCharacters, null, 2), 'utf-8');
    console.log(`💾 Saved to ${outputPath}`);
  });
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
