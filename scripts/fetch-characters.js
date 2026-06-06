#!/usr/bin/env node
/**
 * Character data fetcher for miHoYo games
 * Fetches from Fandom Wiki API (primary) and Bilibili BWIKI (secondary)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Game configurations
const GAMES = {
  genshin: {
    name: 'Genshin Impact',
    fandomWiki: 'genshin-impact.fandom.com',
    fandomCategory: 'Category:Playable_Characters',
    bwiki: 'wiki.biligame.com/ys',
    bwikiCategory: 'Category:角色',
  },
  hsr: {
    name: 'Honkai: Star Rail',
    fandomWiki: 'honkai-star-rail.fandom.com',
    fandomCategory: 'Category:Playable_Characters',
    bwiki: 'wiki.biligame.com/sr',
    bwikiCategory: 'Category:角色',
  },
  zzz: {
    name: 'Zenless Zone Zero',
    fandomWiki: 'zenless-zone-zero.fandom.com',
    fandomCategory: 'Category:Playable_Characters',
    bwiki: 'wiki.biligame.com/zzz',
    bwikiCategory: 'Category:角色',
  },
  honkai3: {
    name: 'Honkai Impact 3rd',
    fandomWiki: 'honkaiimpact3.fandom.com',
    fandomCategory: 'Category:Playable_Characters',
    bwiki: 'wiki.biligame.com/bh3',
    bwikiCategory: 'Category:角色',
  },
};

// Known character mappings for fallback
const KNOWN_CHARACTERS = {
  genshin: [
    { name: '安柏', nameEn: 'Amber', birthday: '08-10', element: '火', weapon: '弓', region: '蒙德', rarity: 4 },
    { name: '芭芭拉', nameEn: 'Barbara', birthday: '07-05', element: '水', weapon: '法器', region: '蒙德', rarity: 4 },
    { name: '北斗', nameEn: 'Beidou', birthday: '02-14', element: '雷', weapon: '双手剑', region: '璃月', rarity: 4 },
    { name: '班尼特', nameEn: 'Bennett', birthday: '02-29', element: '火', weapon: '单手剑', region: '蒙德', rarity: 4 },
    { name: '重云', nameEn: 'Chongyun', birthday: '09-07', element: '冰', weapon: '双手剑', region: '璃月', rarity: 4 },
    { name: '迪卢克', nameEn: 'Diluc', birthday: '04-30', element: '火', weapon: '双手剑', region: '蒙德', rarity: 5 },
    { name: '迪奥娜', nameEn: 'Diona', birthday: '01-18', element: '冰', weapon: '弓', region: '蒙德', rarity: 4 },
    { name: '菲谢尔', nameEn: 'Fischl', birthday: '05-27', element: '雷', weapon: '弓', region: '蒙德', rarity: 4 },
    { name: '甘雨', nameEn: 'Ganyu', birthday: '12-02', element: '冰', weapon: '弓', region: '璃月', rarity: 5 },
    { name: '胡桃', nameEn: 'Hu Tao', birthday: '07-15', element: '火', weapon: '长柄武器', region: '璃月', rarity: 5 },
    { name: '琴', nameEn: 'Jean', birthday: '03-14', element: '风', weapon: '单手剑', region: '蒙德', rarity: 5 },
    { name: '凯亚', nameEn: 'Kaeya', birthday: '11-30', element: '冰', weapon: '单手剑', region: '蒙德', rarity: 4 },
    { name: '刻晴', nameEn: 'Keqing', birthday: '11-20', element: '雷', weapon: '单手剑', region: '璃月', rarity: 5 },
    { name: '可莉', nameEn: 'Klee', birthday: '07-27', element: '火', weapon: '法器', region: '蒙德', rarity: 5 },
    { name: '丽莎', nameEn: 'Lisa', birthday: '06-09', element: '雷', weapon: '法器', region: '蒙德', rarity: 4 },
    { name: '莫娜', nameEn: 'Mona', birthday: '08-31', element: '水', weapon: '法器', region: '蒙德', rarity: 5 },
    { name: '凝光', nameEn: 'Ningguang', birthday: '08-26', element: '岩', weapon: '法器', region: '璃月', rarity: 4 },
    { name: '诺艾尔', nameEn: 'Noelle', birthday: '03-21', element: '岩', weapon: '双手剑', region: '蒙德', rarity: 4 },
    { name: '七七', nameEn: 'Qiqi', birthday: '03-03', element: '冰', weapon: '单手剑', region: '璃月', rarity: 5 },
    { name: '雷泽', nameEn: 'Razor', birthday: '09-09', element: '雷', weapon: '双手剑', region: '蒙德', rarity: 4 },
    { name: '砂糖', nameEn: 'Sucrose', birthday: '11-26', element: '风', weapon: '法器', region: '蒙德', rarity: 4 },
    { name: '达达利亚', nameEn: 'Tartaglia', birthday: '07-20', element: '水', weapon: '弓', region: '至冬', rarity: 5 },
    { name: '温迪', nameEn: 'Venti', birthday: '06-16', element: '风', weapon: '弓', region: '蒙德', rarity: 5 },
    { name: '香菱', nameEn: 'Xiangling', birthday: '11-02', element: '火', weapon: '长柄武器', region: '璃月', rarity: 4 },
    { name: '魈', nameEn: 'Xiao', birthday: '04-17', element: '风', weapon: '长柄武器', region: '璃月', rarity: 5 },
    { name: '行秋', nameEn: 'Xingqiu', birthday: '10-09', element: '水', weapon: '单手剑', region: '璃月', rarity: 4 },
    { name: '辛焱', nameEn: 'Xinyan', birthday: '10-16', element: '火', weapon: '双手剑', region: '璃月', rarity: 4 },
    { name: '钟离', nameEn: 'Zhongli', birthday: '12-31', element: '岩', weapon: '长柄武器', region: '璃月', rarity: 5 },
    { name: '阿贝多', nameEn: 'Albedo', birthday: '09-13', element: '岩', weapon: '单手剑', region: '蒙德', rarity: 5 },
    { name: '罗莎莉亚', nameEn: 'Rosaria', birthday: '01-24', element: '冰', weapon: '长柄武器', region: '蒙德', rarity: 4 },
    { name: '优菈', nameEn: 'Eula', birthday: '10-25', element: '冰', weapon: '双手剑', region: '蒙德', rarity: 5 },
    { name: '烟绯', nameEn: 'Yanfei', birthday: '07-28', element: '火', weapon: '法器', region: '璃月', rarity: 4 },
    { name: '神里绫华', nameEn: 'Kamisato Ayaka', birthday: '09-28', element: '冰', weapon: '单手剑', region: '稻妻', rarity: 5 },
    { name: '宵宫', nameEn: 'Yoimiya', birthday: '06-21', element: '火', weapon: '弓', region: '稻妻', rarity: 5 },
    { name: '早柚', nameEn: 'Sayu', birthday: '10-19', element: '风', weapon: '双手剑', region: '稻妻', rarity: 4 },
    { name: '雷电将军', nameEn: 'Raiden Shogun', birthday: '06-26', element: '雷', weapon: '长柄武器', region: '稻妻', rarity: 5 },
    { name: '珊瑚宫心海', nameEn: 'Sangonomiya Kokomi', birthday: '02-22', element: '水', weapon: '法器', region: '稻妻', rarity: 5 },
    { name: '托马', nameEn: 'Thoma', birthday: '01-09', element: '火', weapon: '长柄武器', region: '稻妻', rarity: 4 },
    { name: '荒泷一斗', nameEn: 'Arataki Itto', birthday: '06-01', element: '岩', weapon: '双手剑', region: '稻妻', rarity: 5 },
    { name: '五郎', nameEn: 'Gorou', birthday: '05-18', element: '岩', weapon: '弓', region: '稻妻', rarity: 4 },
    { name: '云堇', nameEn: 'Yun Jin', birthday: '05-21', element: '岩', weapon: '长柄武器', region: '璃月', rarity: 4 },
    { name: '申鹤', nameEn: 'Shenhe', birthday: '03-10', element: '冰', weapon: '长柄武器', region: '璃月', rarity: 5 },
    { name: '八重神子', nameEn: 'Yae Miko', birthday: '06-27', element: '雷', weapon: '法器', region: '稻妻', rarity: 5 },
    { name: '神里绫人', nameEn: 'Kamisato Ayato', birthday: '03-26', element: '水', weapon: '单手剑', region: '稻妻', rarity: 5 },
    { name: '夜兰', nameEn: 'Yelan', birthday: '04-20', element: '水', weapon: '弓', region: '璃月', rarity: 5 },
    { name: '久岐忍', nameEn: 'Kuki Shinobu', birthday: '07-27', element: '雷', weapon: '单手剑', region: '稻妻', rarity: 4 },
    { name: '鹿野院平藏', nameEn: 'Shikanoin Heizou', birthday: '07-24', element: '风', weapon: '法器', region: '稻妻', rarity: 4 },
    { name: '柯莱', nameEn: 'Collei', birthday: '05-08', element: '草', weapon: '弓', region: '须弥', rarity: 4 },
    { name: '提纳里', nameEn: 'Tighnari', birthday: '12-29', element: '草', weapon: '弓', region: '须弥', rarity: 5 },
    { name: '多莉', nameEn: 'Dori', birthday: '12-21', element: '雷', weapon: '双手剑', region: '须弥', rarity: 4 },
    { name: '赛诺', nameEn: 'Cyno', birthday: '06-23', element: '雷', weapon: '长柄武器', region: '须弥', rarity: 5 },
    { name: '坎蒂丝', nameEn: 'Candace', birthday: '05-03', element: '水', weapon: '长柄武器', region: '须弥', rarity: 4 },
    { name: '妮露', nameEn: 'Nilou', birthday: '12-03', element: '水', weapon: '单手剑', region: '须弥', rarity: 5 },
    { name: '纳西妲', nameEn: 'Nahida', birthday: '10-27', element: '草', weapon: '法器', region: '须弥', rarity: 5 },
    { name: '莱依拉', nameEn: 'Layla', birthday: '12-19', element: '冰', weapon: '单手剑', region: '须弥', rarity: 4 },
    { name: '流浪者', nameEn: 'Wanderer', birthday: '01-03', element: '风', weapon: '法器', region: '须弥', rarity: 5 },
    { name: '珐露珊', nameEn: 'Faruzan', birthday: '08-20', element: '风', weapon: '弓', region: '须弥', rarity: 4 },
    { name: '瑶瑶', nameEn: 'Yaoyao', birthday: '03-06', element: '草', weapon: '长柄武器', region: '璃月', rarity: 4 },
    { name: '艾尔海森', nameEn: 'Alhaitham', birthday: '02-11', element: '草', weapon: '单手剑', region: '须弥', rarity: 5 },
    { name: '迪希雅', nameEn: 'Dehya', birthday: '04-07', element: '火', weapon: '双手剑', region: '须弥', rarity: 5 },
    { name: '米卡', nameEn: 'Mika', birthday: '08-11', element: '冰', weapon: '长柄武器', region: '蒙德', rarity: 4 },
    { name: '卡维', nameEn: 'Kaveh', birthday: '07-09', element: '草', weapon: '双手剑', region: '须弥', rarity: 4 },
    { name: '白术', nameEn: 'Baizhu', birthday: '04-25', element: '草', weapon: '法器', region: '璃月', rarity: 5 },
    { name: '琳妮特', nameEn: 'Lynette', birthday: '02-02', element: '风', weapon: '单手剑', region: '枫丹', rarity: 4 },
    { name: '林尼', nameEn: 'Lyney', birthday: '02-02', element: '火', weapon: '弓', region: '枫丹', rarity: 5 },
    { name: '菲米尼', nameEn: 'Freminet', birthday: '09-24', element: '冰', weapon: '双手剑', region: '枫丹', rarity: 4 },
    { name: '那维莱特', nameEn: 'Neuvillette', birthday: '12-18', element: '水', weapon: '法器', region: '枫丹', rarity: 5 },
    { name: '莱欧斯利', nameEn: 'Wriothesley', birthday: '11-23', element: '冰', weapon: '法器', region: '枫丹', rarity: 5 },
    { name: '芙宁娜', nameEn: 'Furina', birthday: '10-13', element: '水', weapon: '单手剑', region: '枫丹', rarity: 5 },
    { name: '夏洛蒂', nameEn: 'Charlotte', birthday: '04-10', element: '冰', weapon: '法器', region: '枫丹', rarity: 4 },
    { name: '娜维娅', nameEn: 'Navia', birthday: '08-16', element: '岩', weapon: '双手剑', region: '枫丹', rarity: 5 },
    { name: '夏沃蕾', nameEn: 'Chevreuse', birthday: '01-10', element: '火', weapon: '长柄武器', region: '枫丹', rarity: 4 },
    { name: '闲云', nameEn: 'Xianyun', birthday: '04-11', element: '风', weapon: '法器', region: '璃月', rarity: 5 },
    { name: '嘉明', nameEn: 'Gaming', birthday: '12-22', element: '火', weapon: '双手剑', region: '璃月', rarity: 4 },
    { name: '千织', nameEn: 'Chiori', birthday: '08-17', element: '岩', weapon: '单手剑', region: '稻妻', rarity: 5 },
    { name: '阿蕾奇诺', nameEn: 'Arlecchino', birthday: '08-22', element: '火', weapon: '长柄武器', region: '枫丹', rarity: 5 },
    { name: '希格雯', nameEn: 'Sigewinne', birthday: '03-30', element: '水', weapon: '弓', region: '枫丹', rarity: 5 },
    { name: '赛索斯', nameEn: 'Sethos', birthday: '11-01', element: '雷', weapon: '弓', region: '须弥', rarity: 4 },
    { name: '克洛琳德', nameEn: 'Clorinde', birthday: '09-20', element: '雷', weapon: '单手剑', region: '枫丹', rarity: 5 },
    { name: '艾梅莉埃', nameEn: 'Emilie', birthday: '09-22', element: '草', weapon: '长柄武器', region: '枫丹', rarity: 5 },
    { name: '玛拉妮', nameEn: 'Mualani', birthday: '08-03', element: '水', weapon: '法器', region: '纳塔', rarity: 5 },
    { name: '卡齐娜', nameEn: 'Kachina', birthday: '04-22', element: '岩', weapon: '长柄武器', region: '纳塔', rarity: 4 },
    { name: '基尼奇', nameEn: 'Kinich', birthday: '11-11', element: '草', weapon: '双手剑', region: '纳塔', rarity: 5 },
    { name: '希诺宁', nameEn: 'Xilonen', birthday: '03-13', element: '岩', weapon: '单手剑', region: '纳塔', rarity: 5 },
    { name: '恰斯卡', nameEn: 'Chasca', birthday: '12-10', element: '风', weapon: '弓', region: '纳塔', rarity: 5 },
    { name: '欧洛伦', nameEn: 'Ororon', birthday: '10-14', element: '雷', weapon: '弓', region: '纳塔', rarity: 5 },
    { name: '玛薇卡', nameEn: 'Mavuika', birthday: '08-28', element: '火', weapon: '双手剑', region: '纳塔', rarity: 5 },
    { name: '茜特菈莉', nameEn: 'Citlali', birthday: '05-06', element: '冰', weapon: '法器', region: '纳塔', rarity: 5 },
    { name: '蓝砚', nameEn: 'Lan Yan', birthday: '01-06', element: '风', weapon: '法器', region: '璃月', rarity: 4 },
    { name: '伊法', nameEn: 'Ifa', birthday: '03-23', element: '风', weapon: '法器', region: '纳塔', rarity: 4 },
    { name: '瓦雷莎', nameEn: 'Varesa', birthday: '11-15', element: '雷', weapon: '法器', region: '纳塔', rarity: 5 },
    { name: '伊安珊', nameEn: 'Iansan', birthday: '08-08', element: '雷', weapon: '长柄武器', region: '纳塔', rarity: 4 },
  ],
  hsr: [
    { name: '三月七', nameEn: 'March 7th', birthday: '03-07', element: '冰', rarity: 4 },
    { name: '丹恒', nameEn: 'Dan Heng', birthday: '12-25', element: '风', rarity: 4 },
    { name: '姬子', nameEn: 'Himeko', birthday: '06-09', element: '火', rarity: 5 },
    { name: '布洛妮娅', nameEn: 'Bronya', birthday: '08-18', element: '风', rarity: 5 },
    { name: '瓦尔特', nameEn: 'Welt', birthday: '04-30', element: '虚数', rarity: 5 },
    { name: '克拉拉', nameEn: 'Clara', birthday: '10-27', element: '物理', rarity: 5 },
    { name: '希儿', nameEn: 'Seele', birthday: '10-18', element: '量子', rarity: 5 },
    { name: '杰帕德', nameEn: 'Gepard', birthday: '09-08', element: '冰', rarity: 5 },
    { name: '艾丝妲', nameEn: 'Asta', birthday: '05-21', element: '火', rarity: 4 },
    { name: '阿兰', nameEn: 'Arlan', birthday: '04-01', element: '雷', rarity: 4 },
    { name: '佩拉', nameEn: 'Pela', birthday: '01-25', element: '冰', rarity: 4 },
    { name: '希露瓦', nameEn: 'Serval', birthday: '08-14', element: '雷', rarity: 4 },
    { name: '娜塔莎', nameEn: 'Natasha', birthday: '12-22', element: '物理', rarity: 4 },
    { name: '桑博', nameEn: 'Sampo', birthday: '06-02', element: '风', rarity: 4 },
    { name: '虎克', nameEn: 'Hook', birthday: '04-27', element: '火', rarity: 4 },
    { name: '青雀', nameEn: 'Qingque', birthday: '08-06', element: '量子', rarity: 4 },
    { name: '停云', nameEn: 'Tingyun', birthday: '04-08', element: '雷', rarity: 4 },
    { name: '素裳', nameEn: 'Sushang', birthday: '02-20', element: '物理', rarity: 4 },
    { name: '白露', nameEn: 'Bailu', birthday: '03-06', element: '雷', rarity: 5 },
    { name: '景元', nameEn: 'Jing Yuan', birthday: '02-06', element: '雷', rarity: 5 },
    { name: '彦卿', nameEn: 'Yanqing', birthday: '09-08', element: '冰', rarity: 5 },
    { name: '符玄', nameEn: 'Fu Xuan', birthday: '02-22', element: '量子', rarity: 5 },
    { name: '银狼', nameEn: 'Silver Wolf', birthday: '08-12', element: '量子', rarity: 5 },
    { name: '罗刹', nameEn: 'Luocha', birthday: '12-25', element: '虚数', rarity: 5 },
    { name: '刃', nameEn: 'Blade', birthday: '12-31', element: '风', rarity: 5 },
    { name: '卡芙卡', nameEn: 'Kafka', birthday: '08-25', element: '雷', rarity: 5 },
    { name: '卢卡', nameEn: 'Luka', birthday: '05-19', element: '物理', rarity: 4 },
    { name: '驭空', nameEn: 'Yukong', birthday: '08-15', element: '虚数', rarity: 4 },
    { name: '丹恒·饮月', nameEn: 'Dan Heng • Imbibitor Lunae', birthday: '12-25', element: '虚数', rarity: 5 },
    { name: '镜流', nameEn: 'Jingliu', birthday: '10-11', element: '冰', rarity: 5 },
    { name: '托帕', nameEn: 'Topaz', birthday: '08-29', element: '火', rarity: 5 },
    { name: '桂乃芬', nameEn: 'Guinaifen', birthday: '07-11', element: '火', rarity: 4 },
    { name: '藿藿', nameEn: 'Huohuo', birthday: '12-12', element: '风', rarity: 5 },
    { name: '银枝', nameEn: 'Argenti', birthday: '01-09', element: '物理', rarity: 5 },
    { name: '寒鸦', nameEn: 'Hanya', birthday: '07-22', element: '物理', rarity: 4 },
    { name: '阮·梅', nameEn: 'Ruan Mei', birthday: '03-19', element: '冰', rarity: 5 },
    { name: '真理医生', nameEn: 'Dr. Ratio', birthday: '04-26', element: '虚数', rarity: 5 },
    { name: '黑天鹅', nameEn: 'Black Swan', birthday: '09-18', element: '风', rarity: 5 },
    { name: '米沙', nameEn: 'Misha', birthday: '04-04', element: '冰', rarity: 4 },
    { name: '花火', nameEn: 'Sparkle', birthday: '02-29', element: '量子', rarity: 5 },
    { name: '黄泉', nameEn: 'Acheron', birthday: '06-21', element: '雷', rarity: 5 },
    { name: '加拉赫', nameEn: 'Gallagher', birthday: '06-14', element: '火', rarity: 4 },
    { name: '砂金', nameEn: 'Aventurine', birthday: '11-14', element: '虚数', rarity: 5 },
    { name: '知更鸟', nameEn: 'Robin', birthday: '05-04', element: '物理', rarity: 5 },
    { name: '波提欧', nameEn: 'Boothill', birthday: '03-16', element: '物理', rarity: 5 },
    { name: '流萤', nameEn: 'Firefly', birthday: '06-12', element: '火', rarity: 5 },
    { name: '翡翠', nameEn: 'Jade', birthday: '01-11', element: '量子', rarity: 5 },
    { name: '云璃', nameEn: 'Yunli', birthday: '05-17', element: '物理', rarity: 5 },
    { name: '椒丘', nameEn: 'Jiaoqiu', birthday: '08-08', element: '火', rarity: 5 },
    { name: '飞霄', nameEn: 'Feixiao', birthday: '06-06', element: '风', rarity: 5 },
    { name: '灵砂', nameEn: 'Lingsha', birthday: '08-24', element: '火', rarity: 5 },
    { name: '貊泽', nameEn: 'Moze', birthday: '04-14', element: '雷', rarity: 4 },
    { name: '乱破', nameEn: 'Rappa', birthday: '07-22', element: '虚数', rarity: 5 },
    { name: '忘归人', nameEn: 'Fugue', birthday: '04-15', element: '火', rarity: 5 },
    { name: '星期日', nameEn: 'Sunday', birthday: '06-07', element: '虚数', rarity: 5 },
    { name: '大黑塔', nameEn: 'The Herta', birthday: '12-27', element: '冰', rarity: 5 },
    { name: '阿格莱雅', nameEn: 'Aglaea', birthday: '01-01', element: '雷', rarity: 5 },
    { name: '缇宝', nameEn: 'Tribbie', birthday: '12-03', element: '量子', rarity: 5 },
    { name: '万敌', nameEn: 'Mydei', birthday: '04-09', element: '虚数', rarity: 5 },
    { name: '遐蝶', nameEn: 'Castorice', birthday: '11-30', element: '量子', rarity: 5 },
    { name: '那刻夏', nameEn: 'Anaxa', birthday: '09-08', element: '风', rarity: 5 },
    { name: '赛飞儿', nameEn: 'Cipher', birthday: '06-07', element: '量子', rarity: 5 },
    { name: '风堇', nameEn: 'Hyacine', birthday: '05-05', element: '风', rarity: 5 },
    { name: '白厄', nameEn: 'Phainon', birthday: '12-31', element: '物理', rarity: 5 },
    { name: '昔涟', nameEn: 'Cipher', birthday: '06-15', element: '记忆', rarity: 5 },
  ],
  zzz: [
    { name: '安比', nameEn: 'Anby', birthday: '05-01', rarity: 4 },
    { name: '比利', nameEn: 'Billy', birthday: '10-28', rarity: 4 },
    { name: '妮可', nameEn: 'Nicole', birthday: '07-30', rarity: 4 },
    { name: '猫又', nameEn: 'Nekomata', birthday: '04-11', rarity: 5 },
    { name: '珂蕾妲', nameEn: 'Koleda', birthday: '09-23', rarity: 5 },
    { name: '安东', nameEn: 'Anton', birthday: '03-08', rarity: 4 },
    { name: '本', nameEn: 'Ben', birthday: '07-16', rarity: 4 },
    { name: '格莉丝', nameEn: 'Grace', birthday: '01-06', rarity: 5 },
    { name: '苍角', nameEn: 'Soukaku', birthday: '04-17', rarity: 4 },
    { name: '11号', nameEn: 'Soldier 11', birthday: '08-15', rarity: 5 },
    { name: '丽娜', nameEn: 'Rina', birthday: '09-27', rarity: 5 },
    { name: '艾莲', nameEn: 'Ellen', birthday: '01-17', rarity: 5 },
    { name: '朱鸢', nameEn: 'Zhu Yuan', birthday: '06-03', rarity: 5 },
    { name: '莱卡恩', nameEn: 'Lycaon', birthday: '12-04', rarity: 5 },
    { name: '可琳', nameEn: 'Corin', birthday: '02-14', rarity: 4 },
    { name: '露西', nameEn: 'Lucy', birthday: '08-06', rarity: 4 },
    { name: '派派', nameEn: 'Piper', birthday: '08-17', rarity: 4 },
    { name: '青衣', nameEn: 'Qingyi', birthday: '03-21', rarity: 5 },
    { name: '赛斯', nameEn: 'Seth', birthday: '05-01', rarity: 4 },
    { name: '简', nameEn: 'Jane', birthday: '01-01', rarity: 5 },
    { name: '柏妮思', nameEn: 'Burnice', birthday: '04-01', rarity: 5 },
    { name: '凯撒', nameEn: 'Caesar', birthday: '07-04', rarity: 5 },
    { name: '莱特', nameEn: 'Lighter', birthday: '10-05', rarity: 5 },
    { name: '星见雅', nameEn: 'Miyabi', birthday: '04-03', rarity: 5 },
    { name: '浅羽悠真', nameEn: 'Harumasa', birthday: '09-01', rarity: 5 },
    { name: '耀嘉音', nameEn: 'Astra Yao', birthday: '05-04', rarity: 5 },
    { name: '伊芙琳', nameEn: 'Evelyn', birthday: '08-24', rarity: 5 },
    { name: '雨果', nameEn: 'Hugo', birthday: '12-24', rarity: 5 },
    { name: '薇薇安', nameEn: 'Vivian', birthday: '01-20', rarity: 5 },
    { name: '零号·安比', nameEn: 'Trigger', birthday: '05-01', rarity: 5 },
    { name: '波可娜', nameEn: 'Pulchra', birthday: '07-16', rarity: 4 },
    { name: '橘福福', nameEn: 'Ju Fufu', birthday: '02-08', rarity: 5 },
    { name: '仪玄', nameEn: 'Yi Xuan', birthday: '03-26', rarity: 5 },
    { name: '潘引壶', nameEn: 'Pan Yinhu', birthday: '08-13', rarity: 4 },
    { name: '云岿山·泰音', nameEn: 'Taiyin', birthday: '10-10', rarity: 5 },
  ],
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MiHoYo-Calendar-DataFetcher/1.0',
        },
      });
      if (response.ok) return response;
      console.warn(`Attempt ${i + 1} failed for ${url}: ${response.status}`);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, error.message);
    }
    if (i < retries - 1) await sleep(1000 * (i + 1));
  }
  return null;
}

async function fetchFandomCharacters(gameId, config) {
  console.log(`Fetching Fandom data for ${config.name}...`);
  
  try {
    // Fetch character list from category
    const listUrl = `https://${config.fandomWiki}/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(config.fandomCategory)}&cmlimit=100&format=json&origin=*`;
    const listResponse = await fetchWithRetry(listUrl);
    
    if (!listResponse) {
      console.warn(`Failed to fetch Fandom list for ${gameId}`);
      return [];
    }
    
    const listData = await listResponse.json();
    const pages = listData.query?.categorymembers || [];
    
    // Filter out non-character pages (usually have "/" in title or are subpages)
    const characterPages = pages.filter(p => 
      !p.title.includes('/') && 
      !p.title.includes('Category:') &&
      p.title.length < 50
    );
    
    const characters = [];
    
    // Fetch details for each character (with rate limiting)
    for (let i = 0; i < Math.min(characterPages.length, 50); i++) {
      const page = characterPages[i];
      
      try {
        const detailUrl = `https://${config.fandomWiki}/api.php?action=query&prop=pageprops&titles=${encodeURIComponent(page.title)}&format=json&origin=*`;
        const detailResponse = await fetchWithRetry(detailUrl);
        
        if (!detailResponse) continue;
        
        const detailData = await detailResponse.json();
        const pages_data = detailData.query?.pages || {};
        const pageData = Object.values(pages_data)[0];
        
        if (pageData?.pageprops) {
          const props = pageData.pageprops;
          
          // Parse birthday from various formats
          let birthday = null;
          if (props.birthday) {
            const match = props.birthday.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d+)/i);
            if (match) {
              const months = {
                january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
                july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
              };
              birthday = `${months[match[1].toLowerCase()]}-${match[2].padStart(2, '0')}`;
            }
          }
          
          if (birthday) {
            characters.push({
              id: `${page.title.toLowerCase().replace(/\s+/g, '-')}-${gameId}`,
              name: page.title,
              nameEn: page.title,
              game: gameId,
              birthday,
              rarity: props.quality ? parseInt(props.quality) : undefined,
              element: props.element,
              weapon: props.weapon,
              region: props.region,
              source: 'wiki',
              updatedAt: new Date().toISOString(),
            });
          }
        }
        
        await sleep(200); // Rate limiting
      } catch (error) {
        console.warn(`Failed to fetch details for ${page.title}:`, error.message);
      }
    }
    
    console.log(`Fetched ${characters.length} characters from Fandom for ${gameId}`);
    return characters;
  } catch (error) {
    console.error(`Error fetching Fandom data for ${gameId}:`, error.message);
    return [];
  }
}

async function fetchBwikiCharacters(gameId, config) {
  console.log(`Fetching BWIKI data for ${config.name}...`);
  
  try {
    // This is a simplified fetch - BWIKI uses MediaWiki but requires more parsing
    // In production, you'd want to parse the wikitext to extract birthdays
    const url = `https://${config.bwiki}/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(config.bwikiCategory)}&cmlimit=50&format=json&origin=*`;
    const response = await fetchWithRetry(url);
    
    if (!response) {
      console.warn(`Failed to fetch BWIKI for ${gameId}`);
      return [];
    }
    
    const data = await response.json();
    console.log(`BWIKI for ${gameId} returned ${data.query?.categorymembers?.length || 0} pages`);
    
    // For now, return empty as BWIKI parsing is complex
    // TODO: Implement wikitext parsing for BWIKI
    return [];
  } catch (error) {
    console.error(`Error fetching BWIKI for ${gameId}:`, error.message);
    return [];
  }
}

function getDefaultCharacters() {
  const characters = [];
  
  for (const [gameId, chars] of Object.entries(KNOWN_CHARACTERS)) {
    for (const char of chars) {
      characters.push({
        id: `${char.nameEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${gameId}`,
        name: char.name,
        nameEn: char.nameEn,
        game: gameId,
        birthday: char.birthday,
        rarity: char.rarity,
        element: char.element,
        weapon: char.weapon,
        region: char.region,
        source: 'manual',
        updatedAt: new Date().toISOString(),
      });
    }
  }
  
  return characters;
}

async function main() {
  console.log('🎮 Starting character data fetch...\n');
  
  let allCharacters = [];
  
  // Try to fetch from wikis
  for (const [gameId, config] of Object.entries(GAMES)) {
    // Try Fandom first
    const fandomChars = await fetchFandomCharacters(gameId, config);
    allCharacters.push(...fandomChars);
    
    await sleep(1000);
    
    // Try BWIKI as supplement
    const bwikiChars = await fetchBwikiCharacters(gameId, config);
    allCharacters.push(...bwikiChars);
    
    await sleep(1000);
  }
  
  // If no wiki data fetched, use default known characters
  if (allCharacters.length === 0) {
    console.log('\n⚠️ No wiki data fetched. Using default character database...');
    allCharacters = getDefaultCharacters();
  }
  
  // Remove duplicates by id
  const seen = new Set();
  allCharacters = allCharacters.filter(char => {
    if (seen.has(char.id)) return false;
    seen.add(char.id);
    return true;
  });
  
  console.log(`\n✅ Total characters: ${allCharacters.length}`);
  
  // Save to public/data/characters.json
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const outputPath = path.join(dataDir, 'characters.json');
  fs.writeFileSync(outputPath, JSON.stringify(allCharacters, null, 2), 'utf-8');
  
  console.log(`💾 Saved to ${outputPath}`);
  
  // Also save to src/data for build-time inclusion
  const srcDataDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(srcDataDir)) {
    fs.mkdirSync(srcDataDir, { recursive: true });
  }
  
  const srcOutputPath = path.join(srcDataDir, 'characters.json');
  fs.writeFileSync(srcOutputPath, JSON.stringify(allCharacters, null, 2), 'utf-8');
  
  console.log(`💾 Saved to ${srcOutputPath}`);
  
  // Print summary
  const byGame = {};
  for (const char of allCharacters) {
    byGame[char.game] = (byGame[char.game] || 0) + 1;
  }
  
  console.log('\n📊 Character count by game:');
  for (const [game, count] of Object.entries(byGame)) {
    console.log(`  ${game}: ${count}`);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
