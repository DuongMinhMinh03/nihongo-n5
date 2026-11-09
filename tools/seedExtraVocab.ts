/**
 * Gộp từ vựng bổ sung (tools/extraVocab.ts) vào content/vocab/n5.json.
 *
 * Nguồn hiragana / romaji / pos: content/vocab/imported-n5.json (tạo bởi npm run import:jlpt)
 * Nghĩa tiếng Việt + ví dụ: tools/extraVocab.ts
 *
 * Chạy:  npm run seed:extra
 */
import fs from 'node:fs';
import path from 'node:path';

import { EXTRA_VOCAB } from './extraVocab';

const ROOT = process.cwd();
const MAIN = path.resolve(ROOT, 'content/vocab/n5.json');
const IMPORTED = path.resolve(ROOT, 'content/vocab/imported-n5.json');

interface ImportedWord {
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_en: string;
  pos: string;
  level: string;
  example: { jp: string; en: string } | null;
}

interface Vocab {
  id: string;
  level: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning_vi: string;
  pos: string;
  tags: string[];
  example: { jp: string; vi: string };
  related: string[];
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

/** Kana / kanji hợp lệ (bỏ dấu câu, chữ Latin, khoảng trắng) */
function isValidKey(key: string): boolean {
  // Kana: 3040-30FF, Kanji: 3400-4DBF, 4E00-9FFF, F900-FAFF
  return /^[぀-ヿ㐀-䶿一-鿿豈-﫿]+$/.test(key);
}

/**
 * Bảng bổ sung cho các từ KHÔNG có trong nguồn import OpenJLPT
 * (từ ghép, danh từ trừu tượng, từ viết bằng kana thuần).
 */
const KANA_OVERRIDES: Record<string, { hiragana: string; romaji: string }> = {
  私たち: { hiragana: 'わたしたち', romaji: 'watashitachi' },
  今夜: { hiragana: 'こんや', romaji: 'konya' },
  面白い: { hiragana: 'おもしろい', romaji: 'omoshiroi' },
  怖い: { hiragana: 'こわい', romaji: 'kowai' },
  疲れた: { hiragana: 'つかれた', romaji: 'tsukareta' },
  濃い: { hiragana: 'こい', romaji: 'koi' },
  しょっぱい: { hiragana: 'しょっぱい', romaji: 'shoppai' },
  ピンク: { hiragana: 'ピンク', romaji: 'pinku' },
  灰色: { hiragana: 'はいろ', romaji: 'hairo' },
  何回: { hiragana: 'なんかい', romaji: 'nankai' },
  鍵: { hiragana: 'かぎ', romaji: 'kagi' },
  はがき: { hiragana: 'はがき', romaji: 'hagaki' },
  椅子: { hiragana: 'いす', romaji: 'isu' },
  醤油: { hiragana: 'しょうゆ', romaji: 'shouyu' },
  朝ご飯: { hiragana: 'あさごはん', romaji: 'asagohan' },
  晩ご飯: { hiragana: 'ばんごはん', romaji: 'bangohan' },
  杯: { hiragana: 'ハイ', romaji: 'hai' },
  勉強する: { hiragana: 'べんきょうする', romaji: 'benkyousuru' },
  履く: { hiragana: 'はく', romaji: 'haku' },
  かぶる: { hiragana: 'かぶる', romaji: 'kaburu' },
  送る: { hiragana: 'おくる', romaji: 'okuru' },
  説明: { hiragana: 'せつめい', romaji: 'setsumei' },
  紹介: { hiragana: 'しょうかい', romaji: 'shoukai' },
  伝える: { hiragana: 'つたえる', romaji: 'tsutaeru' },
  思う: { hiragana: 'おもう', romaji: 'omou' },
  始める: { hiragana: 'はじめる', romaji: 'hajimeru' },
  集める: { hiragana: 'あつめる', romaji: 'atsumeru' },
  探す: { hiragana: 'さがす', romaji: 'sagasu' },
  と: { hiragana: 'と', romaji: 'to' },
  だから: { hiragana: 'だから', romaji: 'dakara' },
  開ける: { hiragana: 'あける', romaji: 'akeru' },
  上げる: { hiragana: 'あげる', romaji: 'ageru' },
  頭: { hiragana: 'あたま', romaji: 'atama' },
  危ない: { hiragana: 'あぶない', romaji: 'abunai' },
  甘い: { hiragana: 'あまい', romaji: 'amai' },
  洗: { hiragana: 'あらう', romaji: 'arau' },
  ある: { hiragana: 'ある', romaji: 'aru' },
  歩く: { hiragana: 'あるく', romaji: 'aruku' },
  言う: { hiragana: 'いう', romaji: 'iu' },
  いくら: { hiragana: 'いくら', romaji: 'ikura' },
  池: { hiragana: 'いけ', romaji: 'ike' },
  医者: { hiragana: 'isha', romaji: 'isha' },
  いす: { hiragana: 'いす', romaji: 'isu' },
  忙しい: { hiragana: 'いそがしい', romaji: 'isogashii' },
  痛い: { hiragana: 'いたい', romaji: 'itai' },
  一緒: { hiragana: 'いっしょ', romaji: 'issho' },
  意味: { hiragana: 'いみ', romaji: 'imi' },
  妹: { hiragana: 'いもうと', romaji: 'imouto' },
  嫌い: { hiragana: 'きらい', romaji: 'kirai' },
  要る: { hiragana: 'いる', romaji: 'iru' },
  入れる: { hiragana: 'いれる', romaji: 'ireru' },
  色: { hiragana: 'いろ', romaji: 'iro' },
  後ろ: { hiragana: 'うしろ', romaji: 'ushiro' },
  薄い: { hiragana: 'うすい', romaji: 'usui' },
  歌: { hiragana: 'うた', romaji: 'uta' },
  歌う: { hiragana: 'うたう', romaji: 'utau' },
  生まれる: { hiragana: 'うまれる', romaji: 'umareru' },
  上: { hiragana: 'うえ', romaji: 'ue' },
  下: { hiragana: 'した', romaji: 'shita' },
  中: { hiragana: 'なか', romaji: 'naka' },
  大きい: { hiragana: 'おおきい', romaji: 'ookii' },
  小さい: { hiragana: 'ちいさい', romaji: 'chiisai' },
  高い: { hiragana: 'たかい', romaji: 'takai' },
  安い: { hiragana: 'やすい', romaji: 'yasui' },
  新しい: { hiragana: 'あたらしい', romaji: 'atarashii' },
  古い: { hiragana: 'ふるい', romaji: 'furui' },
  多い: { hiragana: 'おおい', romaji: 'ooi' },
  少ない: { hiragana: 'すくない', romaji: 'sukunai' },
  早い: { hiragana: 'はやい', romaji: 'hayai' },
  遅い: { hiragana: 'おそい', romaji: 'osoi' },
  難しい: { hiragana: 'むずかしい', romaji: 'muzukashii' },
  易しい: { hiragana: 'やさしい', romaji: 'yasushii' },
  楽しい: { hiragana: 'たのしい', romaji: 'tanoshii' },
  熱い: { hiragana: 'あつい', romaji: 'atsui' },
  暑い: { hiragana: 'あつい', romaji: 'atsui' },
  寒い: { hiragana: 'さむい', romaji: 'samui' },
  暖かい: { hiragana: 'あったかい', romaji: 'attakai' },
  涼しい: { hiragana: 'すずしい', romaji: 'suzushii' },
  辛い: { hiragana: 'からい', romaji: 'karai' },
  おいしい: { hiragana: 'おいしい', romaji: 'oishii' },
  きれい: { hiragana: 'きれい', romaji: 'kirei' },
  汚い: { hiragana: 'きたない', romaji: 'kitanai' },
  静か: { hiragana: 'しずか', romaji: 'shizuka' },
  賑やか: { hiragana: 'にぎやか', romaji: 'nigiyaka' },
  大丈夫: { hiragana: 'だいじょうぶ', romaji: 'daijoubu' },
  上手: { hiragana: 'じょうず', romaji: 'jouzu' },
  下手: { hiragana: 'へた', romaji: 'heta' },
  好き: { hiragana: 'すき', romaji: 'suki' },
  便利: { hiragana: 'べんり', romaji: 'benri' },
  不便: { hiragana: 'ふべん', romaji: 'fuben' },
  白い: { hiragana: 'しろい', romaji: 'shiroi' },
  黒い: { hiragana: 'くろい', romaji: 'kuroi' },
  赤い: { hiragana: 'あかい', romaji: 'akai' },
  青い: { hiragana: 'あおい', romaji: 'aoi' },
  黄色い: { hiragana: 'きいろい', romaji: 'kiiroi' },
  緑: { hiragana: 'みどり', romaji: 'midori' },
  茶色: { hiragana: 'ちゃいろ', romaji: 'chairo' },
  駅: { hiragana: 'えき', romaji: 'eki' },
  空港: { hiragana: 'くうこう', romaji: 'kuukou' },
  図書館: { hiragana: 'としょかん', romaji: 'toshokan' },
  郵便局: { hiragana: 'ゆうびんきょく', romaji: 'yuubinkyoku' },
  公園: { hiragana: 'こうえん', romaji: 'kouen' },
  トイレ: { hiragana: 'トイレ', romaji: 'toire' },
  台所: { hiragana: 'だいどころ', romaji: 'daidokoro' },
  窓: { hiragana: 'まど', romaji: 'mado' },
  角: { hiragana: 'かど', romaji: 'kado' },
  交番: { hiragana: 'こうばん', romaji: 'kouban' },
  町: { hiragana: 'まち', romaji: 'machi' },
  村: { hiragana: 'むら', romaji: 'mura' },
  道: { hiragana: 'みち', romaji: 'michi' },
  エレベーター: { hiragana: 'エレベーター', romaji: 'erebeta' },
  東: { hiragana: 'ひがし', romaji: 'higashi' },
  西: { hiragana: 'にし', romaji: 'nishi' },
  南: { hiragana: 'みなみ', romaji: 'minami' },
  北: { hiragana: 'きた', romaji: 'kita' },
  右: { hiragana: 'みぎ', romaji: 'migi' },
  左: { hiragana: 'ひだり', romaji: 'hidari' },
  前: { hiragana: 'まえ', romaji: 'mae' },
  後: { hiragana: 'あと', romaji: 'ato' },
  外: { hiragana: 'そと', romaji: 'soto' },
  近い: { hiragana: 'ちかい', romaji: 'chikai' },
  遠い: { hiragana: 'とおい', romaji: 'tooi' },
  かばん: { hiragana: 'かばん', romaji: 'kaban' },
  傘: { hiragana: 'かさ', romaji: 'kasa' },
  帽子: { hiragana: 'ぼうし', romaji: 'boushi' },
  靴: { hiragana: 'くつ', romaji: 'kutsu' },
  靴下: { hiragana: 'くつした', romaji: 'kutsushita' },
  眼鏡: { hiragana: 'めがね', romaji: 'megane' },
  財布: { hiragana: 'さいふ', romaji: 'saifu' },
  写真: { hiragana: 'しゃしん', romaji: 'shashin' },
  地図: { hiragana: 'ちず', romaji: 'chizu' },
  切符: { hiragana: 'きっぷ', romaji: 'kippu' },
  カレンダー: { hiragana: 'カレンダー', romaji: 'karendaa' },
  カメラ: { hiragana: 'カメラ', romaji: 'kamera' },
  テレビ: { hiragana: 'テレビ', romaji: 'terebi' },
  ラジオ: { hiragana: 'ラジオ', romaji: 'rajio' },
  自転車: { hiragana: 'じてんしゃ', romaji: 'jitensha' },
  地下鉄: { hiragana: 'ちかてつ', romaji: 'chikatetsu' },
  タクシー: { hiragana: 'タクシー', romaji: 'takushii' },
  飛行機: { hiragana: 'ひこうき', romaji: 'hikouki' },
  ご飯: { hiragana: 'ごはん', romaji: 'gohan' },
  パン: { hiragana: 'パン', romaji: 'pan' },
  肉: { hiragana: 'にく', romaji: 'niku' },
  魚: { hiragana: 'さかな', romaji: 'sakana' },
  野菜: { hiragana: 'やさい', romaji: 'yasai' },
  果物: { hiragana: 'くだもの', romaji: 'kudamono' },
  卵: { hiragana: 'たまご', romaji: 'tamago' },
  塩: { hiragana: 'しお', romaji: 'shio' },
  砂糖: { hiragana: 'さとう', romaji: 'satou' },
  お茶: { hiragana: 'おちゃ', romaji: 'ocha' },
  水: { hiragana: 'みず', romaji: 'mizu' },
  牛乳: { hiragana: 'ぎゅうにゅう', romaji: 'gyuunyuu' },
  お酒: { hiragana: 'おさけ', romaji: 'osake' },
  コーヒー: { hiragana: 'コーヒー', romaji: 'kohii' },
  レストラン: { hiragana: 'レストラン', romaji: 'resutoran' },
  会う: { hiragana: 'あう', romaji: 'au' },
  待つ: { hiragana: 'まつ', romaji: 'matsu' },
  買う: { hiragana: 'かう', romaji: 'kau' },
  売る: { hiragana: 'うる', romaji: 'uru' },
  書く: { hiragana: 'かく', romaji: 'kaku' },
  読む: { hiragana: 'よむ', romaji: 'yomu' },
  聞く: { hiragana: 'きく', romaji: 'kiku' },
  話す: { hiragana: 'はなす', romaji: 'hanasu' },
  教える: { hiragana: 'おしえる', romaji: 'oshieru' },
  働く: { hiragana: 'はたらく', romaji: 'hataraku' },
  休む: { hiragana: 'やすむ', romaji: 'yasumu' },
  飲む: { hiragana: 'のむ', romaji: 'nomu' },
  食べる: { hiragana: 'たべる', romaji: 'taberu' },
  作る: { hiragana: 'つくる', romaji: 'tsukuru' },
  使う: { hiragana: 'つかう', romaji: 'tsukau' },
  入る: { hiragana: 'はいる', romaji: 'hairu' },
  出る: { hiragana: 'でる', romaji: 'deru' },
  帰る: { hiragana: 'かえる', romaji: 'kaeru' },
  行く: { hiragana: 'いく', romaji: 'iku' },
  来る: { hiragana: 'くる', romaji: 'kuru' },
  見る: { hiragana: 'みる', romaji: 'miru' },
  遊ぶ: { hiragana: 'あそぶ', romaji: 'asobu' },
  泳ぐ: { hiragana: 'およぐ', romaji: 'oyogu' },
  洗う: { hiragana: 'あらう', romaji: 'arau' },
  開く: { hiragana: 'ひらく', romaji: 'hiraku' },
  閉める: { hiragana: 'しめる', romaji: 'shimeru' },
  座る: { hiragana: 'すわる', romaji: 'suwaru' },
  立つ: { hiragana: 'たつ', romaji: 'tatsu' },
  寝る: { hiragana: 'ねる', romaji: 'neru' },
  起きる: { hiragana: 'おきる', romaji: 'okiru' },
  着る: { hiragana: 'きる', romaji: 'kiru' },
  脱ぐ: { hiragana: 'ぬぐ', romaji: 'nugu' },
  持つ: { hiragana: 'もつ', romaji: 'motsu' },
  出す: { hiragana: 'だす', romaji: 'dasu' },
  返す: { hiragana: 'かえす', romaji: 'kaesu' },
  借りる: { hiragana: 'かりる', romaji: 'kariru' },
  答える: { hiragana: 'こたえる', romaji: 'kotaeru' },
  覚える: { hiragana: 'おぼえる', romaji: 'oboeru' },
  忘れる: { hiragana: 'わすれる', romaji: 'wasureru' },
  終わる: { hiragana: 'おわる', romaji: 'owaru' },
  住む: { hiragana: 'すむ', romaji: 'sumu' },
  見せる: { hiragana: 'みせる', romaji: 'miseru' },
  名前: { hiragana: 'なまえ', romaji: 'namae' },
  友達: { hiragana: 'ともだち', romaji: 'tomodachi' },
  家族: { hiragana: 'かぞく', romaji: 'kazoku' },
  教室: { hiragana: 'きょうしつ', romaji: 'kyoushitsu' },
  時間: { hiragana: 'じかん', romaji: 'jikan' },
  毎日: { hiragana: 'まいにち', romaji: 'mainichi' },
  今: { hiragana: 'いま', romaji: 'ima' },
  今朝: { hiragana: 'けさ', romaji: 'kesa' },
  明日: { hiragana: 'あした', romaji: 'ashita' },
  昨日: { hiragana: 'きのう', romaji: 'kinou' },
  今年: { hiragana: 'ことし', romaji: 'kotoshi' },
  去年: { hiragana: 'きょねん', romaji: 'kyonen' },
  来週: { hiragana: 'らいしゅう', romaji: 'raishuu' },
  先週: { hiragana: 'せんしゅう', romaji: 'senshuu' },
  午前: { hiragana: 'ごぜん', romaji: 'gozen' },
  午後: { hiragana: 'ごご', romaji: 'gogo' },
  夜: { hiragana: 'よる', romaji: 'yoru' },
  いつも: { hiragana: 'いつも', romaji: 'itsumo' },
  よく: { hiragana: 'よく', romaji: 'yoku' },
  あまり: { hiragana: 'あまり', romaji: 'amari' },
  もう: { hiragana: 'もう', romaji: 'mou' },
  まだ: { hiragana: 'まだ', romaji: 'mada' },
  また: { hiragana: 'また', romaji: 'mata' },
  とても: { hiragana: 'とても', romaji: 'totemo' },
  ちょっと: { hiragana: 'ちょっと', romaji: 'chotto' },
  少し: { hiragana: 'すこし', romaji: 'sukoshi' },
  たくさん: { hiragana: 'たくさん', romaji: 'takusan' },
  ありがとう: { hiragana: 'ありがとう', romaji: 'arigatou' },
  すみません: { hiragana: 'すみません', romaji: 'sumimasen' },
  おはよう: { hiragana: 'おはよう', romaji: 'ohayou' },
  こんにちは: { hiragana: 'こんにちは', romaji: 'konnichiwa' },
  こんばんは: { hiragana: 'こんばんは', romaji: 'konbanwa' },
  さようなら: { hiragana: 'さようなら', romaji: 'sayounara' },
  はい: { hiragana: 'はい', romaji: 'hai' },
  いいえ: { hiragana: 'いいえ', romaji: 'iie' },
  あなた: { hiragana: 'あなた', romaji: 'anata' },
  仕事: { hiragana: 'しごと', romaji: 'shigoto' },
  質問: { hiragana: 'しつもん', romaji: 'shitsumon' },
  知る: { hiragana: 'しる', romaji: 'shiru' },
  一: { hiragana: 'いち', romaji: 'ichi' },
  二: { hiragana: 'に', romaji: 'ni' },
  三: { hiragana: 'さん', romaji: 'san' },
  四: { hiragana: 'よん', romaji: 'yon' },
  五: { hiragana: 'ご', romaji: 'go' },
  六: { hiragana: 'ろく', romaji: 'roku' },
  七: { hiragana: 'なな', romaji: 'nana' },
  八: { hiragana: 'はち', romaji: 'hachi' },
  九: { hiragana: 'きゅう', romaji: 'kyuu' },
  十: { hiragana: 'じゅう', romaji: 'juu' },
  百: { hiragana: 'ひゃく', romaji: 'hyaku' },
  千: { hiragana: 'せん', romaji: 'sen' },
  万: { hiragana: 'まん', romaji: 'man' },
  いくつ: { hiragana: 'いくつ', romaji: 'ikutsu' }
};

/** Câu tiếng Nhật không được chứa chữ Latin ngoại lai */
function hasStrayLatin(jp: string): boolean {
  return /[A-Za-z]{2,}/.test(jp);
}

function normalizeKey(key: string): string {
  return key.trim();
}

function main() {
  const main = readJson<Vocab[]>(MAIN);
  const imported = fs.existsSync(IMPORTED)
    ? readJson<ImportedWord[]>(IMPORTED)
    : ([] as ImportedWord[]);

  const importedByKey = new Map(imported.map((w) => [normalizeKey(w.kanji), w]));
  const existing = new Set(main.map((v) => normalizeKey(v.kanji)));

  let added = 0;
  let skipped = 0;
  const problems: string[] = [];

  for (const extra of EXTRA_VOCAB) {
    const key = normalizeKey(extra.kanji);

    if (!isValidKey(key)) {
      problems.push(`Từ khoá không hợp lệ (chứa ký tự lạ): "${extra.kanji}"`);
      skipped++;
      continue;
    }

    if (hasStrayLatin(extra.example_jp)) {
      problems.push(`Câu ví dụ có chữ Latin: "${key}" → ${extra.example_jp}`);
      skipped++;
      continue;
    }

    if (existing.has(key)) {
      skipped++;
      continue;
    }

    const src = importedByKey.get(key);
    const override = KANA_OVERRIDES[key];

    // Nếu không có trong nguồn import, dùng bảng override hoặc dữ liệu chính
    const fallback = main.find((v) => v.kanji === key);
    const hiragana = src?.hiragana ?? override?.hiragana ?? fallback?.hiragana ?? '';
    const romaji = src?.romaji ?? override?.romaji ?? fallback?.romaji ?? '';
    const pos = src?.pos || extra.kanji.replace(/[^\u3040-\u30FF\u4E00-\u9FFF]/g, '');

    if (!hiragana) {
      problems.push(`Thiếu hiragana cho "${key}" — hãy thêm vào content/vocab/imported-n5.json`);
      skipped++;
      continue;
    }

    const id = `n5-v${String(main.length + added + 1).padStart(3, '0')}`;

    main.push({
      id,
      level: 'N5',
      kanji: key,
      hiragana,
      romaji,
      meaning_vi: extra.meaning_vi,
      pos,
      tags: extra.tags,
      example: { jp: extra.example_jp, vi: extra.example_vi },
      related: []
    });

    existing.add(key);
    added++;
  }

  fs.writeFileSync(MAIN, JSON.stringify(main, null, 2) + '\n', 'utf8');

  // Đánh số lại id cho duy nhất (sau nhiều lần chạy)
  const seenIds = new Set<string>();
  main.forEach((v, i) => {
    let id = `n5-v${String(i + 1).padStart(3, '0')}`;
    let n = i + 1;
    while (seenIds.has(id)) {
      n += 1;
      id = `n5-v${String(n).padStart(3, '0')}`;
    }
    seenIds.add(id);
    v.id = id;
  });

  fs.writeFileSync(MAIN, JSON.stringify(main, null, 2) + '\n', 'utf8');

  console.log('═══ Seed từ vựng bổ sung ═══');
  console.log(`Đã thêm: ${added}`);
  console.log(`Bỏ qua: ${skipped}`);
  console.log(`Tổng dataset: ${main.length} mục`);

  if (problems.length > 0) {
    console.log('\n⚠ Cần sửa trong tools/extraVocab.ts:');
    for (const p of problems) console.log('  -', p);
    process.exitCode = 1;
  }

  console.log('\nBước tiếp theo:  npm run validate');
}

main();
