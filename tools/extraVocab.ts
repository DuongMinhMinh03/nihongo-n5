/**
 * Danh sách bổ sung cho content/vocab/n5.json.
 *
 * Script merge (tools/seedExtraVocab.ts) sẽ:
 *   1. tra hiragana / romaji / pos từ content/vocab/imported-n5.json (nguồn OpenJLPT)
 *   2. giữ nguyên meaning_vi + ví dụ do bạn viết ở đây
 *   3. gộp vào content/vocab/n5.json, không ghi đè các mục đã có
 *
 * Chạy:  npm run seed:extra
 */

export interface ExtraVocab {
  /** Từ khoá (kanji hoặc kana) — phải khớp với imported-n5.json */
  kanji: string;
  /** Nghĩa tiếng Việt */
  meaning_vi: string;
  /** Từ khoá tra cứu nhanh */
  tags: string[];
  /** Ví dụ tiếng Nhật */
  example_jp: string;
  /** Dịch ví dụ */
  example_vi: string;
}

export const EXTRA_VOCAB: ExtraVocab[] = [
  // ---- Chào hỏi & giao tiếp cơ bản ----
  {
    kanji: 'ありがとう',
    meaning_vi: 'cảm ơn',
    tags: ['giao tiếp'],
    example_jp: '手伝ってくれて、ありがとうございます。',
    example_vi: 'Cảm ơn bạn đã giúp tôi.'
  },
  {
    kanji: 'すみません',
    meaning_vi: 'xin lỗi, xin phép',
    tags: ['giao tiếp'],
    example_jp: 'すみません、もう一度お願いします。',
    example_vi: 'Xin lỗi, làm ơn nhắc lại một lần nữa.'
  },
  {
    kanji: 'おはよう',
    meaning_vi: 'chào buổi sáng',
    tags: ['giao tiếp'],
    example_jp: 'おはようございます。',
    example_vi: 'Chào buổi sáng (lịch sự).'
  },
  {
    kanji: 'こんにちは',
    meaning_vi: 'xin chào (ban ngày)',
    tags: ['giao tiếp'],
    example_jp: 'こんにちは、お元気ですか。',
    example_vi: 'Chào, bạn khỏe không?'
  },
  {
    kanji: 'こんばんは',
    meaning_vi: 'chào buổi tối',
    tags: ['giao tiếp'],
    example_jp: 'こんばんは、お疲れ様でした。',
    example_vi: 'Chào buổi tối, hôm nay vất vả rồi nhé.'
  },
  {
    kanji: 'さようなら',
    meaning_vi: 'tạm biệt',
    tags: ['giao tiếp'],
    example_jp: 'さようなら、また明日。',
    example_vi: 'Tạm biệt, hẹn gặp lại ngày mai.'
  },
  {
    kanji: 'はい',
    meaning_vi: 'vâng, dạ (đồng ý)',
    tags: ['giao tiếp'],
    example_jp: 'はい、わかりました。',
    example_vi: 'Vâng, tôi hiểu rồi.'
  },
  {
    kanji: 'いいえ',
    meaning_vi: 'không phải, không',
    tags: ['giao tiếp'],
    example_jp: 'いいえ、大丈夫です。',
    example_vi: 'Không đâu, tôi không sao.'
  },
  {
    kanji: 'あなた',
    meaning_vi: 'bạn, người kia',
    tags: ['giao tiếp', 'đại từ'],
    example_jp: 'あなたは学生ですか。',
    example_vi: 'Bạn là sinh viên phải không?'
  },
  {
    kanji: '私たち',
    meaning_vi: 'chúng tôi',
    tags: ['giao tiếp', 'đại từ'],
    example_jp: '私たちは日本語を勉強しています。',
    example_vi: 'Chúng tôi đang học tiếng Nhật.'
  },
  {
    kanji: '友達',
    meaning_vi: 'bạn bè',
    tags: ['người', 'giao tiếp'],
    example_jp: '友達と映画を見ました。',
    example_vi: 'Tôi đã xem phim cùng bạn bè.'
  },
  {
    kanji: '家族',
    meaning_vi: 'gia đình',
    tags: ['gia đình'],
    example_jp: '家族は四人です。',
    example_vi: 'Gia đình tôi có bốn người.'
  },
  {
    kanji: '名前',
    meaning_vi: 'tên',
    tags: ['giao tiếp'],
    example_jp: 'お名前は何ですか。',
    example_vi: 'Tên bạn là gì?'
  },
  {
    kanji: '仕事',
    meaning_vi: 'công việc',
    tags: ['công việc'],
    example_jp: '父は銀行で働いています。',
    example_vi: 'Bố tôi làm việc ở ngân hàng.'
  },
  {
    kanji: '教室',
    meaning_vi: 'lớp học, phòng học',
    tags: ['học tập', 'địa điểm'],
    example_jp: '教室に生徒が三人います。',
    example_vi: 'Trong lớp có ba học sinh.'
  },

  // ---- Thời gian ----
  {
    kanji: '毎日',
    meaning_vi: 'mỗi ngày, hằng ngày',
    tags: ['thời gian'],
    example_jp: '毎日、日本語を勉強します。',
    example_vi: 'Tôi học tiếng Nhật mỗi ngày.'
  },
  {
    kanji: '今',
    meaning_vi: 'bây giờ, hiện tại',
    tags: ['thời gian'],
    example_jp: '今は九時です。',
    example_vi: 'Bây giờ là chín giờ.'
  },
  {
    kanji: '今朝',
    meaning_vi: 'sáng nay',
    tags: ['thời gian'],
    example_jp: '今朝、新聞を読みました。',
    example_vi: 'Sáng nay tôi đã đọc báo.'
  },
  {
    kanji: '今夜',
    meaning_vi: 'tối nay',
    tags: ['thời gian'],
    example_jp: '今夜は早く寝ます。',
    example_vi: 'Tối nay tôi sẽ ngủ sớm.'
  },
  {
    kanji: '明日',
    meaning_vi: 'ngày mai',
    tags: ['thời gian'],
    example_jp: '明日は休みです。',
    example_vi: 'Ngày mai tôi nghỉ.'
  },
  {
    kanji: '昨日',
    meaning_vi: 'hôm qua',
    tags: ['thời gian'],
    example_jp: '昨日、友達と話しました。',
    example_vi: 'Hôm qua tôi đã nói chuyện với bạn.'
  },
  {
    kanji: '今年',
    meaning_vi: 'năm nay',
    tags: ['thời gian'],
    example_jp: '今年、大学に入ります。',
    example_vi: 'Năm nay tôi sẽ vào đại học.'
  },
  {
    kanji: '去年',
    meaning_vi: 'năm ngoái',
    tags: ['thời gian'],
    example_jp: '去年、日本へ行きました。',
    example_vi: 'Năm ngoái tôi đã đi Nhật Bản.'
  },
  {
    kanji: '来週',
    meaning_vi: 'tuần sau',
    tags: ['thời gian'],
    example_jp: '来週、考试があります。',
    example_vi: 'Tuần sau có kỳ thi.'
  },
  {
    kanji: '先週',
    meaning_vi: 'tuần trước',
    tags: ['thời gian'],
    example_jp: '先週はとても忙しかったです。',
    example_vi: 'Tuần trước rất bận.'
  },
  {
    kanji: '午前',
    meaning_vi: 'buổi sáng, trước trưa',
    tags: ['thời gian'],
    example_jp: '午前九時に起きました。',
    example_vi: 'Tôi dậy lúc chín giờ sáng.'
  },
  {
    kanji: '午後',
    meaning_vi: 'buổi chiều, sau trưa',
    tags: ['thời gian'],
    example_jp: '午後三時に会いましょう。',
    example_vi: 'Chiều ba giờ mình gặp nhé.'
  },
  {
    kanji: '夜',
    meaning_vi: 'ban đêm, buổi tối',
    tags: ['thời gian'],
    example_jp: '夜は静かです。',
    example_vi: 'Buổi tối rất yên tĩnh.'
  },
  {
    kanji: '時間',
    meaning_vi: 'thời gian, giờ',
    tags: ['thời gian'],
    example_jp: '時間がありません。',
    example_vi: 'Không còn thời gian.'
  },
  {
    kanji: 'いつ',
    meaning_vi: 'khi nào',
    tags: ['giao tiếp', 'thời gian'],
    example_jp: 'いつ来ますか。',
    example_vi: 'Khi nào bạn đến?'
  },
  {
    kanji: 'いつも',
    meaning_vi: 'luôn luôn, thường thường',
    tags: ['giao tiếp', 'tần suất'],
    example_jp: 'いつも八時に起きます。',
    example_vi: 'Tôi luôn dậy lúc tám giờ.'
  },
  {
    kanji: 'よく',
    meaning_vi: 'thường, hay',
    tags: ['tần suất'],
    example_jp: 'よく映画を見ます。',
    example_vi: 'Tôi hay xem phim.'
  },
  {
    kanji: 'あまり',
    meaning_vi: 'không mấy, ít khi',
    tags: ['tần suất'],
    example_jp: 'あまり食べません。',
    example_vi: 'Tôi không ăn nhiều.'
  },
  {
    kanji: 'もう',
    meaning_vi: 'đã, rồi',
    tags: ['thời gian'],
    example_jp: 'もう十二時です。',
    example_vi: 'Đã mười hai giờ rồi.'
  },
  {
    kanji: 'まだ',
    meaning_vi: 'vẫn, còn',
    tags: ['thời gian'],
    example_jp: 'まだ読んでいません。',
    example_vi: 'Tôi vẫn chưa đọc xong.'
  },
  {
    kanji: 'また',
    meaning_vi: 'lại, lần nữa',
    tags: ['thời gian'],
    example_jp: 'また会いましょう。',
    example_vi: 'Hẹn gặp lại nhé.'
  },

  // ---- Mức độ & lượng ----
  {
    kanji: 'とても',
    meaning_vi: 'rất, vô cùng',
    tags: ['mức độ'],
    example_jp: 'とてもおいしいです。',
    example_vi: 'Ngon lắm.'
  },
  {
    kanji: 'ちょっと',
    meaning_vi: 'một chút, hơi',
    tags: ['mức độ'],
    example_jp: 'ちょっと待ってください。',
    example_vi: 'Xin đợi một chút.'
  },
  {
    kanji: '少し',
    meaning_vi: 'một chút, chút ít',
    tags: ['lượng'],
    example_jp: '少し待ってください。',
    example_vi: 'Xin đợi một chút nữa.'
  },
  {
    kanji: 'たくさん',
    meaning_vi: 'nhiều, rất nhiều',
    tags: ['lượng'],
    example_jp: '公園に人がたくさんいます。',
    example_vi: 'Có rất nhiều người.'
  },

  // ---- Mô tả ----
  {
    kanji: '大きい',
    meaning_vi: 'lớn, to',
    tags: ['mô tả', 'kích thước'],
    example_jp: '大きい犬がいます。',
    example_vi: 'Có một con chó lớn.'
  },
  {
    kanji: '小さい',
    meaning_vi: 'nhỏ, bé',
    tags: ['mô tả', 'kích thước'],
    example_jp: '小さいカメラを買いました。',
    example_vi: 'Tôi mua một chiếc máy ảnh nhỏ.'
  },
  {
    kanji: '新しい',
    meaning_vi: 'mới',
    tags: ['mô tả'],
    example_jp: '新しい靴を買いました。',
    example_vi: 'Tôi đã mua đôi giày mới.'
  },
  {
    kanji: '古い',
    meaning_vi: 'cũ, cũ kỹ',
    tags: ['mô tả'],
    example_jp: 'この本は古いです。',
    example_vi: 'Cuốn sách này cũ rồi.'
  },
  {
    kanji: '高い',
    meaning_vi: 'cao, đắt',
    tags: ['mô tả', 'tiền bạc'],
    example_jp: 'この建物は高いです。',
    example_vi: 'Tòa nhà này cao.'
  },
  {
    kanji: '安い',
    meaning_vi: 'rẻ, rẻ hơn',
    tags: ['mô tả', 'tiền bạc'],
    example_jp: 'この店の魚は安いです。',
    example_vi: 'Cá ở cửa hàng này rẻ.'
  },
  {
    kanji: '多い',
    meaning_vi: 'nhiều',
    tags: ['mô tả', 'số lượng'],
    example_jp: '店の人は少ないです。',
    example_vi: 'Trong cửa hàng không có nhiều người.'
  },
  {
    kanji: '少ない',
    meaning_vi: 'ít, ít bạn',
    tags: ['mô tả', 'số lượng'],
    example_jp: '今日は人が少ないです。',
    example_vi: 'Hôm nay có ít người.'
  },
  {
    kanji: '早い',
    meaning_vi: 'sớm, nhanh',
    tags: ['mô tả', 'thời gian'],
    example_jp: '早く起きました。',
    example_vi: 'Tôi dậy sớm.'
  },
  {
    kanji: '遅い',
    meaning_vi: 'muộn, chậm',
    tags: ['mô tả', 'thời gian'],
    example_jp: '今九時は遅いです。',
    example_vi: 'Bây giờ chín giờ là muộn rồi.'
  },
  {
    kanji: '面白い',
    meaning_vi: 'thú vị, hay',
    tags: ['mô tả'],
    example_jp: 'この本はとても面白いです。',
    example_vi: 'Cuốn sách này rất thú vị.'
  },
  {
    kanji: '難しい',
    meaning_vi: 'khó, khó hiểu',
    tags: ['mô tả', 'học tập'],
    example_jp: 'この問題は難しいです。',
    example_vi: 'Bài này khó.'
  },
  {
    kanji: '易しい',
    meaning_vi: 'dễ, dễ hiểu',
    tags: ['mô tả', 'học tập'],
    example_jp: 'この問題は易しいです。',
    example_vi: 'Bài này dễ.'
  },
  {
    kanji: '忙しい',
    meaning_vi: 'bận rộn',
    tags: ['mô tả', 'công việc'],
    example_jp: '今週はとても忙しかったです。',
    example_vi: 'Tuần này tôi rất bận.'
  },
  {
    kanji: '楽しい',
    meaning_vi: 'vui, thú vị',
    tags: ['mô tả', 'cảm xúc'],
    example_jp: '旅行はとても楽しかったです。',
    example_vi: 'Chuyến đi rất vui.'
  },
  {
    kanji: '怖い',
    meaning_vi: 'đáng sợ',
    tags: ['mô tả', 'cảm xúc'],
    example_jp: '犬が怖いです。',
    example_vi: 'Tôi sợ chó.'
  },
  {
    kanji: '痛い',
    meaning_vi: 'đau',
    tags: ['mô tả', 'sức khoẻ'],
    example_jp: '頭が痛いです。',
    example_vi: 'Tôi bị đau đầu.'
  },
  {
    kanji: '疲れた',
    meaning_vi: 'mệt, kiệt sức',
    tags: ['mô tả', 'sức khoẻ'],
    example_jp: '今日はとても疲れました。',
    example_vi: 'Hôm nay tôi rất mệt.'
  },
  {
    kanji: '濃い',
    meaning_vi: 'đậm, nặng (màu, vị)',
    tags: ['mô tả'],
    example_jp: 'このお茶は濃いです。',
    example_vi: 'Loại trà này đậm.'
  },
  {
    kanji: '薄い',
    meaning_vi: 'nhạt, mỏng',
    tags: ['mô tả'],
    example_jp: 'この本はとても薄いです。',
    example_vi: 'Cuốn sách này rất mỏng.'
  },
  {
    kanji: '熱い',
    meaning_vi: 'nóng (rát)',
    tags: ['mô tả', 'nhiệt độ'],
    example_jp: 'お茶が熱いです。',
    example_vi: 'Trà nóng lắm.'
  },
  {
    kanji: '暑い',
    meaning_vi: 'nóng (trời)',
    tags: ['mô tả', 'nhiệt độ'],
    example_jp: '今日は暑いですね。',
    example_vi: 'Hôm nay nóng nhỉ.'
  },
  {
    kanji: '寒い',
    meaning_vi: 'lạnh (trời)',
    tags: ['mô tả', 'nhiệt độ'],
    example_jp: '冬はとても寒いです。',
    example_vi: 'Mùa đông rất lạnh.'
  },
  {
    kanji: '暖かい',
    meaning_vi: 'ấm áp',
    tags: ['mô tả', 'nhiệt độ'],
    example_jp: '今日は暖かいですね。',
    example_vi: 'Hôm nay ấm áp nhỉ.'
  },
  {
    kanji: '涼しい',
    meaning_vi: 'mát mẻ',
    tags: ['mô tả', 'nhiệt độ'],
    example_jp: '秋は涼しいです。',
    example_vi: 'Mùa thu rất mát.'
  },
  {
    kanji: '甘い',
    meaning_vi: 'ngọt',
    tags: ['mô tả', 'vị'],
    example_jp: 'このケーキは甘いです。',
    example_vi: 'Bánh này ngọt.'
  },
  {
    kanji: '辛い',
    meaning_vi: 'cay',
    tags: ['mô tả', 'vị'],
    example_jp: 'このラーメンは辛いです。',
    example_vi: 'Mì tôm này cay.'
  },
  {
    kanji: 'しょっぱい',
    meaning_vi: 'mặn',
    tags: ['mô tả', 'vị'],
    example_jp: 'この料理はしょっぱいです。',
    example_vi: 'Món này mặn.'
  },
  {
    kanji: 'おいしい',
    meaning_vi: 'ngon',
    tags: ['mô tả', 'đồ ăn'],
    example_jp: 'この店の料理はおいしいです。',
    example_vi: 'Món ở quán này ngon.'
  },
  {
    kanji: 'きれい',
    meaning_vi: 'đẹp, sạch',
    tags: ['mô tả'],
    example_jp: 'この街はとてもきれいです。',
    example_vi: 'Con phố này đẹp lắm.'
  },
  {
    kanji: '汚い',
    meaning_vi: 'bẩn, dơ bẩn',
    tags: ['mô tả'],
    example_jp: 'ここはとても汚いです。',
    example_vi: 'Chỗ này bẩn lắm.'
  },
  {
    kanji: '静か',
    meaning_vi: 'yên tĩnh',
    tags: ['mô tả'],
    example_jp: '図書館は静かです。',
    example_vi: 'Thư viện rất yên tĩnh.'
  },
  {
    kanji: '賑やか',
    meaning_vi: 'náo nhiệt, ồn ào',
    tags: ['mô tả'],
    example_jp: 'この店は賑やかです。',
    example_vi: 'Quán này rất náo nhiệt.'
  },
  {
    kanji: '危ない',
    meaning_vi: 'nguy hiểm',
    tags: ['mô tả', 'an toàn'],
    example_jp: 'あそこは危ないです。',
    example_vi: 'Chỗ đó nguy hiểm.'
  },
  {
    kanji: '大丈夫',
    meaning_vi: 'không sao, ổn',
    tags: ['mô tả', 'giao tiếp'],
    example_jp: '心配しないで。大丈夫です。',
    example_vi: 'Đừng lo, không sao đâu.'
  },
  {
    kanji: '上手',
    meaning_vi: 'giỏi, khéo léo',
    tags: ['mô tả', 'học tập'],
    example_jp: '日本語が上手ですね。',
    example_vi: 'Tiếng Nhật của bạn giỏi quá.'
  },
  {
    kanji: '下手',
    meaning_vi: 'vụng, kém',
    tags: ['mô tả', 'học tập'],
    example_jp: '料理は下手です。',
    example_vi: 'Tôi nấu ăn vụng lắm.'
  },
  {
    kanji: '好き',
    meaning_vi: 'thích',
    tags: ['mô tả', 'cảm xúc'],
    example_jp: '私は音楽が好きです。',
    example_vi: 'Tôi thích âm nhạc.'
  },
  {
    kanji: '嫌い',
    meaning_vi: 'không thích, ghét',
    tags: ['mô tả', 'cảm xúc'],
    example_jp: '数学は嫌いです。',
    example_vi: 'Tôi không thích toán.'
  },
  {
    kanji: '便利',
    meaning_vi: 'tiện lợi, thuận tiện',
    tags: ['mô tả'],
    example_jp: '地下鉄は便利です。',
    example_vi: 'Tàu điện ngầm rất tiện.'
  },
  {
    kanji: '不便',
    meaning_vi: 'bất tiện',
    tags: ['mô tả'],
    example_jp: 'この家は少し不便です。',
    example_vi: 'Căn nhà này hơi bất tiện.'
  },

  // ---- Màu sắc ----
  {
    kanji: '白い',
    meaning_vi: 'trắng',
    tags: ['màu sắc'],
    example_jp: '雪が白いです。',
    example_vi: 'Tuyết trắng.'
  },
  {
    kanji: '黒い',
    meaning_vi: 'đen',
    tags: ['màu sắc'],
    example_jp: '猫が黒いです。',
    example_vi: 'Con mèo đen.'
  },
  {
    kanji: '赤い',
    meaning_vi: 'đỏ',
    tags: ['màu sắc'],
    example_jp: 'あの花は赤いです。',
    example_vi: 'Bông hoa đó màu đỏ.'
  },
  {
    kanji: '青い',
    meaning_vi: 'xanh',
    tags: ['màu sắc'],
    example_jp: '青い空がきれいです。',
    example_vi: 'Bầu trời xanh rất đẹp.'
  },
  {
    kanji: '黄色い',
    meaning_vi: 'vàng',
    tags: ['màu sắc'],
    example_jp: 'バナナは黄色いです。',
    example_vi: 'Chuối màu vàng.'
  },
  {
    kanji: '緑',
    meaning_vi: 'lục, xanh lá',
    tags: ['màu sắc'],
    example_jp: 'この木の葉は緑です。',
    example_vi: 'Lá cây này màu xanh lục.'
  },
  {
    kanji: '茶色',
    meaning_vi: 'màu nâu',
    tags: ['màu sắc'],
    example_jp: 'この鞄は茶色です。',
    example_vi: 'Chiếc túi này màu nâu.'
  },
  {
    kanji: 'ピンク',
    meaning_vi: 'hồng',
    tags: ['màu sắc'],
    example_jp: 'ピンクの花が咲いています。',
    example_vi: 'Hoa hồng đang nở.'
  },
  {
    kanji: '灰色',
    meaning_vi: 'màu xám',
    tags: ['màu sắc'],
    example_jp: '空は灰色です。',
    example_vi: 'Bầu trời xám xịt.'
  },

  // ---- Số đếm ----
  {
    kanji: '一',
    meaning_vi: 'một',
    tags: ['số đếm'],
    example_jp: '教室に生徒が一人います。',
    example_vi: 'Trong lớp có một học sinh.'
  },
  {
    kanji: '二',
    meaning_vi: 'hai',
    tags: ['số đếm'],
    example_jp: '切符を二枚買いました。',
    example_vi: 'Tôi mua hai vé.'
  },
  {
    kanji: '三',
    meaning_vi: 'ba',
    tags: ['số đếm'],
    example_jp: '三時間待ちました。',
    example_vi: 'Tôi đợi ba tiếng.'
  },
  {
    kanji: '四',
    meaning_vi: 'bốn',
    tags: ['số đếm'],
    example_jp: '四時に起きました。',
    example_vi: 'Tôi dậy lúc bốn giờ.'
  },
  {
    kanji: '五',
    meaning_vi: 'năm',
    tags: ['số đếm'],
    example_jp: '五本買いました。',
    example_vi: 'Tôi mua năm cái.'
  },
  {
    kanji: '六',
    meaning_vi: 'sáu',
    tags: ['số đếm'],
    example_jp: '六時に起きました。',
    example_vi: 'Tôi dậy lúc sáu giờ.'
  },
  {
    kanji: '七',
    meaning_vi: 'bảy',
    tags: ['số đếm'],
    example_jp: '七本あります。',
    example_vi: 'Có bảy cái.'
  },
  {
    kanji: '八',
    meaning_vi: 'tám',
    tags: ['số đếm'],
    example_jp: '八時に会社へ行きます。',
    example_vi: 'Tôi đến công ty lúc tám giờ.'
  },
  {
    kanji: '九',
    meaning_vi: 'chín',
    tags: ['số đếm'],
    example_jp: '九時に着きます。',
    example_vi: 'Tôi sẽ đến lúc chín giờ.'
  },
  {
    kanji: '十',
    meaning_vi: 'mười',
    tags: ['số đếm'],
    example_jp: '十分待ってください。',
    example_vi: 'Xin đợi mười phút.'
  },
  {
    kanji: '百',
    meaning_vi: 'trăm',
    tags: ['số đếm'],
    example_jp: '百円出しました。',
    example_vi: 'Tôi trả một trăm yên.'
  },
  {
    kanji: '千',
    meaning_vi: 'nghìn',
    tags: ['số đếm'],
    example_jp: '千円の切符です。',
    example_vi: 'Đây là vé một nghìn yên.'
  },
  {
    kanji: '万',
    meaning_vi: 'vạn, mười nghìn',
    tags: ['số đếm'],
    example_jp: '一万円持っています。',
    example_vi: 'Tôi có mười nghìn yên.'
  },
  {
    kanji: '何回',
    meaning_vi: 'bao nhiêu lần',
    tags: ['số đếm', 'giao tiếp'],
    example_jp: '日本へ何回行きましたか。',
    example_vi: 'Bạn đã đi Nhật Bản mấy lần?'
  },
  {
    kanji: 'いくら',
    meaning_vi: 'bao nhiêu (tiền)',
    tags: ['giao tiếp', 'tiền bạc'],
    example_jp: 'この本はいくらですか。',
    example_vi: 'Cuốn sách này bao nhiêu tiền?'
  },
  {
    kanji: 'いくつ',
    meaning_vi: 'bao nhiêu (số lượng)',
    tags: ['giao tiếp', 'số đếm'],
    example_jp: 'りんごをいくつ買いましたか。',
    example_vi: 'Bạn mua bao nhiêu quả táo?'
  },

  // ---- Địa điểm ----
  {
    kanji: '駅',
    meaning_vi: 'nhà ga, ga tàu',
    tags: ['địa điểm', 'phương tiện'],
    example_jp: '駅まで歩きます。',
    example_vi: 'Tôi đi bộ đến ga.'
  },
  {
    kanji: '空港',
    meaning_vi: 'sân bay',
    tags: ['địa điểm', 'du lịch'],
    example_jp: '空港に行きます。',
    example_vi: 'Tôi đi sân bay.'
  },
  {
    kanji: '図書館',
    meaning_vi: 'thư viện',
    tags: ['địa điểm', 'học tập'],
    example_jp: '図書館で本を借ります。',
    example_vi: 'Tôi mượn sách ở thư viện.'
  },
  {
    kanji: '郵便局',
    meaning_vi: 'bưu điện',
    tags: ['địa điểm', 'công việc'],
    example_jp: '郵便局に手紙を出します。',
    example_vi: 'Tôi gửi thư ở bưu điện.'
  },
  {
    kanji: '公園',
    meaning_vi: 'công viên',
    tags: ['địa điểm'],
    example_jp: '公園を散歩します。',
    example_vi: 'Tôi dạo bộ ở công viên.'
  },
  {
    kanji: 'トイレ',
    meaning_vi: 'nhà vệ sinh',
    tags: ['địa điểm', 'nhà cửa'],
    example_jp: 'トイレはどこですか。',
    example_vi: 'Nhà vệ sinh ở đâu ạ?'
  },
  {
    kanji: '台所',
    meaning_vi: 'bếp',
    tags: ['nhà cửa'],
    example_jp: '母は台所で料理します。',
    example_vi: 'Mẹ tôi nấu ăn ở bếp.'
  },
  {
    kanji: '窓',
    meaning_vi: 'cửa sổ',
    tags: ['nhà cửa'],
    example_jp: '窓を開けてください。',
    example_vi: 'Xin hãy mở cửa sổ.'
  },
  {
    kanji: '角',
    meaning_vi: 'góc, góc phố',
    tags: ['địa điểm'],
    example_jp: '次の角を曲がります。',
    example_vi: 'Tôi rẽ ở góc tiếp theo.'
  },
  {
    kanji: '交番',
    meaning_vi: 'đồn cảnh sát',
    tags: ['địa điểm'],
    example_jp: '交番に聞きました。',
    example_vi: 'Tôi hỏi ở đồn cảnh sát.'
  },
  {
    kanji: '町',
    meaning_vi: 'thị trấn, phố',
    tags: ['địa điểm'],
    example_jp: 'この町は静かです。',
    example_vi: 'Thị trấn này yên tĩnh.'
  },
  {
    kanji: '村',
    meaning_vi: 'làng',
    tags: ['địa điểm'],
    example_jp: 'あの村に住んでいます。',
    example_vi: 'Tôi sống ở làng đó.'
  },
  {
    kanji: '道',
    meaning_vi: 'đường, đường đi',
    tags: ['địa điểm'],
    example_jp: 'この道をまっすぐ行きます。',
    example_vi: 'Tôi đi thẳng trên con đường này.'
  },
  {
    kanji: 'エレベーター',
    meaning_vi: 'thang máy',
    tags: ['địa điểm', 'nhà cửa'],
    example_jp: 'エレベーターで六階まで行きます。',
    example_vi: 'Tôi đi thang máy lên tầng sáu.'
  },

  // ---- Phương hướng & vị trí ----
  {
    kanji: '東',
    meaning_vi: 'phía đông',
    tags: ['phương hướng'],
    example_jp: '東に山があります。',
    example_vi: 'Phía đông có núi.'
  },
  {
    kanji: '西',
    meaning_vi: 'phía tây',
    tags: ['phương hướng'],
    example_jp: '太陽は東から出ます。',
    example_vi: 'Mặt trời mọc ở hướng đông.'
  },
  {
    kanji: '南',
    meaning_vi: 'phía nam',
    tags: ['phương hướng'],
    example_jp: '南の港へ行きます。',
    example_vi: 'Tôi đến cảng phía nam.'
  },
  {
    kanji: '北',
    meaning_vi: 'phía bắc',
    tags: ['phương hướng'],
    example_jp: '北へ旅行します。',
    example_vi: 'Tôi đi du lịch hướng bắc.'
  },
  {
    kanji: '右',
    meaning_vi: 'bên phải',
    tags: ['phương hướng'],
    example_jp: '次の角を右です。',
    example_vi: 'Rẽ phải ở góc tiếp theo.'
  },
  {
    kanji: '左',
    meaning_vi: 'bên trái',
    tags: ['phương hướng'],
    example_jp: '銀行は左にあります。',
    example_vi: 'Ngân hàng ở bên trái.'
  },
  {
    kanji: '前',
    meaning_vi: 'trước, phía trước',
    tags: ['vị trí'],
    example_jp: '学校は家の前です。',
    example_vi: 'Trường học ở trước nhà.'
  },
  {
    kanji: '後',
    meaning_vi: 'sau, phía sau',
    tags: ['vị trí'],
    example_jp: '店の後ろに銀行があります。',
    example_vi: 'Sau cửa hàng có ngân hàng.'
  },
  {
    kanji: '上',
    meaning_vi: 'trên, phía trên',
    tags: ['vị trí'],
    example_jp: '机の上に本があります。',
    example_vi: 'Trên bàn có sách.'
  },
  {
    kanji: '下',
    meaning_vi: 'dưới, phía dưới',
    tags: ['vị trí'],
    example_jp: '机の下にかばんがあります。',
    example_vi: 'Dưới bàn có túi.'
  },
  {
    kanji: '中',
    meaning_vi: 'trong, giữa',
    tags: ['vị trí'],
    example_jp: '箱の中に何もありません。',
    example_vi: 'Trong hộp không có gì cả.'
  },
  {
    kanji: '外',
    meaning_vi: 'bên ngoài, ngoài trời',
    tags: ['vị trí'],
    example_jp: '外は寒いです。',
    example_vi: 'Bên ngoài lạnh lắm.'
  },
  {
    kanji: '近い',
    meaning_vi: 'gần, gần đó',
    tags: ['vị trí', 'khoảng cách'],
    example_jp: '駅は近いです。',
    example_vi: 'Ga gần đây.'
  },
  {
    kanji: '遠い',
    meaning_vi: 'xa',
    tags: ['vị trí', 'khoảng cách'],
    example_jp: 'ここから遠いですね。',
    example_vi: 'Từ đây xa thật.'
  },

  // ---- Đồ vật ----
  {
    kanji: 'かばん',
    meaning_vi: 'cặp, túi',
    tags: ['đồ vật'],
    example_jp: 'かばんを持っています。',
    example_vi: 'Tôi đang cầm cặp.'
  },
  {
    kanji: '傘',
    meaning_vi: 'ô, dù (mưa)',
    tags: ['đồ vật'],
    example_jp: '傘を持って行きます。',
    example_vi: 'Tôi mang ô theo.'
  },
  {
    kanji: '帽子',
    meaning_vi: 'mũ',
    tags: ['đồ vật', 'quần áo'],
    example_jp: '帽子を被ります。',
    example_vi: 'Tôi đội mũ.'
  },
  {
    kanji: '靴',
    meaning_vi: 'giày',
    tags: ['đồ vật', 'quần áo'],
    example_jp: '新しい靴を履きます。',
    example_vi: 'Tôi mang đôi giày mới.'
  },
  {
    kanji: '靴下',
    meaning_vi: 'tất',
    tags: ['đồ vật', 'quần áo'],
    example_jp: '靴下を忘れました。',
    example_vi: 'Tôi quên tất.'
  },
  {
    kanji: '眼鏡',
    meaning_vi: 'kính mắt',
    tags: ['đồ vật'],
    example_jp: '眼鏡をかけます。',
    example_vi: 'Tôi đeo kính.'
  },
  {
    kanji: '財布',
    meaning_vi: 'ví',
    tags: ['đồ vật', 'tiền bạc'],
    example_jp: '財布を忘れました。',
    example_vi: 'Tôi quên ví.'
  },
  {
    kanji: '鍵',
    meaning_vi: 'chìa khóa',
    tags: ['đồ vật', 'nhà cửa'],
    example_jp: '鍵をなくしました。',
    example_vi: 'Tôi làm mất chìa khóa.'
  },
  {
    kanji: '本',
    meaning_vi: 'sách',
    tags: ['đồ vật', 'học tập'],
    example_jp: 'この本は面白いです。',
    example_vi: 'Cuốn sách này thú vị.'
  },
  {
    kanji: '新聞',
    meaning_vi: 'báo',
    tags: ['đồ vật', 'tin tức'],
    example_jp: '毎朝新聞を読みます。',
    example_vi: 'Sáng nào tôi cũng đọc báo.'
  },
  {
    kanji: '写真',
    meaning_vi: 'ảnh, ảnh chụp',
    tags: ['đồ vật'],
    example_jp: '写真を撮ります。',
    example_vi: 'Tôi chụp ảnh.'
  },
  {
    kanji: '地図',
    meaning_vi: 'bản đồ',
    tags: ['đồ vật'],
    example_jp: '地図を見ます。',
    example_vi: 'Tôi xem bản đồ.'
  },
  {
    kanji: '切符',
    meaning_vi: 'vé',
    tags: ['đồ vật', 'du lịch'],
    example_jp: '切符を買います。',
    example_vi: 'Tôi mua vé.'
  },
  {
    kanji: 'はがき',
    meaning_vi: 'bưu thiếp',
    tags: ['đồ vật', 'giao tiếp'],
    example_jp: 'はがきを出します。',
    example_vi: 'Tôi gửi bưu thiếp.'
  },
  {
    kanji: 'カレンダー',
    meaning_vi: 'lịch',
    tags: ['đồ vật', 'thời gian'],
    example_jp: 'カレンダーに予定を書きます。',
    example_vi: 'Tôi ghi kế hoạch trên lịch.'
  },
  {
    kanji: 'カメラ',
    meaning_vi: 'máy ảnh',
    tags: ['đồ vật'],
    example_jp: 'カメラを買いました。',
    example_vi: 'Tôi mua máy ảnh.'
  },
  {
    kanji: 'テレビ',
    meaning_vi: 'ti vi',
    tags: ['đồ vật', 'giải trí'],
    example_jp: 'テレビを見ます。',
    example_vi: 'Tôi xem ti vi.'
  },
  {
    kanji: 'ラジオ',
    meaning_vi: 'radio',
    tags: ['đồ vật', 'giải trí'],
    example_jp: 'ラジオを聞きます。',
    example_vi: 'Tôi nghe radio.'
  },
  {
    kanji: '椅子',
    meaning_vi: 'ghế',
    tags: ['đồ vật', 'nhà cửa'],
    example_jp: '椅子に座ってください。',
    example_vi: 'Xin ngồi xuống ghế.'
  },
  {
    kanji: '自転車',
    meaning_vi: 'xe đạp',
    tags: ['phương tiện'],
    example_jp: '自転車で学校へ行きます。',
    example_vi: 'Tôi đến trường bằng xe đạp.'
  },
  {
    kanji: '地下鉄',
    meaning_vi: 'tàu điện ngầm',
    tags: ['phương tiện'],
    example_jp: '地下鉄で通勤します。',
    example_vi: 'Tôi đi làm bằng tàu điện ngầm.'
  },
  {
    kanji: 'タクシー',
    meaning_vi: 'taxi',
    tags: ['phương tiện'],
    example_jp: 'タクシーを呼びます。',
    example_vi: 'Tôi gọi taxi.'
  },
  {
    kanji: '飛行機',
    meaning_vi: 'máy bay',
    tags: ['phương tiện', 'du lịch'],
    example_jp: '飛行機で日本へ行きます。',
    example_vi: 'Tôi đi Nhật Bản bằng máy bay.'
  },

  // ---- Đồ ăn, thức uống ----
  {
    kanji: 'ご飯',
    meaning_vi: 'cơm, bữa cơm',
    tags: ['đồ ăn'],
    example_jp: '朝はご飯を食べます。',
    example_vi: 'Buổi sáng tôi ăn cơm.'
  },
  {
    kanji: 'パン',
    meaning_vi: 'bánh mì',
    tags: ['đồ ăn'],
    example_jp: '朝はパンを食べます。',
    example_vi: 'Buổi sáng tôi ăn bánh mì.'
  },
  {
    kanji: '肉',
    meaning_vi: 'thịt',
    tags: ['đồ ăn'],
    example_jp: '肉が好きです。',
    example_vi: 'Tôi thích thịt.'
  },
  {
    kanji: '魚',
    meaning_vi: 'cá',
    tags: ['đồ ăn'],
    example_jp: '魚を食べます。',
    example_vi: 'Tôi ăn cá.'
  },
  {
    kanji: '野菜',
    meaning_vi: 'rau',
    tags: ['đồ ăn'],
    example_jp: '野菜は健康にいいです。',
    example_vi: 'Rau tốt cho sức khoẻ.'
  },
  {
    kanji: '果物',
    meaning_vi: 'trái cây',
    tags: ['đồ ăn'],
    example_jp: '果物が好きですか。',
    example_vi: 'Bạn thích trái cây không?'
  },
  {
    kanji: '卵',
    meaning_vi: 'trứng',
    tags: ['đồ ăn'],
    example_jp: '卵を焼きます。',
    example_vi: 'Tôi chiên trứng.'
  },
  {
    kanji: '塩',
    meaning_vi: 'muối',
    tags: ['gia vị'],
    example_jp: '塩を少し入れてください。',
    example_vi: 'Xin cho thêm chút muối.'
  },
  {
    kanji: '砂糖',
    meaning_vi: 'đường',
    tags: ['gia vị'],
    example_jp: '砂糖は要りません。',
    example_vi: 'Không cần đường.'
  },
  {
    kanji: '醤油',
    meaning_vi: 'tương',
    tags: ['gia vị'],
    example_jp: '醤油を少し入れてください。',
    example_vi: 'Xin cho thêm chút tương.'
  },
  {
    kanji: 'お茶',
    meaning_vi: 'trà',
    tags: ['đồ uống'],
    example_jp: 'お茶を飲みます。',
    example_vi: 'Tôi uống trà.'
  },
  {
    kanji: '水',
    meaning_vi: 'nước',
    tags: ['đồ uống'],
    example_jp: 'お水をください。',
    example_vi: 'Cho tôi xin nước.'
  },
  {
    kanji: '牛乳',
    meaning_vi: 'sữa',
    tags: ['đồ uống'],
    example_jp: '毎朝牛乳を飲みます。',
    example_vi: 'Sáng nào tôi cũng uống sữa.'
  },
  {
    kanji: 'お酒',
    meaning_vi: 'rượu, rượu sake',
    tags: ['đồ uống'],
    example_jp: 'お酒を飲みます。',
    example_vi: 'Tôi uống rượu.'
  },
  {
    kanji: 'コーヒー',
    meaning_vi: 'cà phê',
    tags: ['đồ uống'],
    example_jp: '毎朝コーヒーを飲みます。',
    example_vi: 'Sáng nào tôi cũng uống cà phê.'
  },
  {
    kanji: 'レストラン',
    meaning_vi: 'nhà hàng',
    tags: ['địa điểm', 'đồ ăn'],
    example_jp: 'レストランで晩ご飯を食べます。',
    example_vi: 'Tôi ăn tối ở nhà hàng.'
  },
  {
    kanji: '朝ご飯',
    meaning_vi: 'bữa sáng',
    tags: ['đồ ăn', 'thời gian'],
    example_jp: '朝ご飯を食べませんでした。',
    example_vi: 'Tôi không ăn sáng.'
  },
  {
    kanji: '晩ご飯',
    meaning_vi: 'bữa tối',
    tags: ['đồ ăn', 'thời gian'],
    example_jp: '晩ご飯は七時です。',
    example_vi: 'Bữa tối là bảy giờ.'
  },
  {
    kanji: '杯',
    meaning_vi: 'chén, bát (đồ ăn)',
    tags: ['đồ ăn'],
    example_jp: 'ご飯を二杯食べました。',
    example_vi: 'Tôi ăn hai bát cơm.'
  },

  // ---- Hành động thường ngày ----
  {
    kanji: '会う',
    meaning_vi: 'gặp, gặp gỡ',
    tags: ['hành động', 'giao tiếp'],
    example_jp: '友達に会いました。',
    example_vi: 'Tôi đã gặp bạn.'
  },
  {
    kanji: '待つ',
    meaning_vi: 'chờ, đợi',
    tags: ['hành động'],
    example_jp: 'ここで待ちます。',
    example_vi: 'Tôi chờ ở đây.'
  },
  {
    kanji: '買う',
    meaning_vi: 'mua',
    tags: ['hành động', 'mua sắm'],
    example_jp: 'パンを買います。',
    example_vi: 'Tôi mua bánh mì.'
  },
  {
    kanji: '売る',
    meaning_vi: 'bán',
    tags: ['hành động', 'công việc'],
    example_jp: 'この店は切符を売ります。',
    example_vi: 'Cửa hàng này bán vé.'
  },
  {
    kanji: '書く',
    meaning_vi: 'viết',
    tags: ['hành động'],
    example_jp: '名前をここに書いてください。',
    example_vi: 'Xin viết tên ở đây.'
  },
  {
    kanji: '読む',
    meaning_vi: 'đọc',
    tags: ['hành động', 'học tập'],
    example_jp: '本を読みます。',
    example_vi: 'Tôi đọc sách.'
  },
  {
    kanji: '聞く',
    meaning_vi: 'nghe, hỏi',
    tags: ['hành động', 'giao tiếp'],
    example_jp: '先生に聞きます。',
    example_vi: 'Tôi hỏi thầy.'
  },
  {
    kanji: '話す',
    meaning_vi: 'nói chuyện, nói',
    tags: ['hành động', 'giao tiếp'],
    example_jp: '日本語で話します。',
    example_vi: 'Tôi nói bằng tiếng Nhật.'
  },
  {
    kanji: '教える',
    meaning_vi: 'dạy',
    tags: ['hành động', 'học tập'],
    example_jp: '友達に日本語を教えます。',
    example_vi: 'Tôi dạy tiếng Nhật cho bạn.'
  },
  {
    kanji: '勉強する',
    meaning_vi: 'học, học tập',
    tags: ['hành động', 'học tập'],
    example_jp: '毎日日本語を勉強します。',
    example_vi: 'Tôi học tiếng Nhật mỗi ngày.'
  },
  {
    kanji: '働く',
    meaning_vi: 'làm việc',
    tags: ['hành động', 'công việc'],
    example_jp: '銀行で働いています。',
    example_vi: 'Tôi làm việc ở ngân hàng.'
  },
  {
    kanji: '休む',
    meaning_vi: 'nghỉ',
    tags: ['hành động', 'sức khoẻ'],
    example_jp: '今日は休みます。',
    example_vi: 'Hôm nay tôi nghỉ.'
  },
  {
    kanji: '飲む',
    meaning_vi: 'uống',
    tags: ['hành động', 'đồ uống'],
    example_jp: '水を飲みます。',
    example_vi: 'Tôi uống nước.'
  },
  {
    kanji: '食べる',
    meaning_vi: 'ăn',
    tags: ['hành động', 'đồ ăn'],
    example_jp: '朝ご飯を食べます。',
    example_vi: 'Tôi ăn sáng.'
  },
  {
    kanji: '作る',
    meaning_vi: 'làm, chế biến, tạo ra',
    tags: ['hành động'],
    example_jp: '母がお弁当を作りました。',
    example_vi: 'Mẹ đã làm cơm hộp.'
  },
  {
    kanji: '使う',
    meaning_vi: 'dùng, sử dụng',
    tags: ['hành động'],
    example_jp: 'ペンを使います。',
    example_vi: 'Tôi dùng bút.'
  },
  {
    kanji: '入る',
    meaning_vi: 'vào, nhập',
    tags: ['hành động'],
    example_jp: '学校に入ります。',
    example_vi: 'Tôi vào trường.'
  },
  {
    kanji: '出る',
    meaning_vi: 'ra, rời đi',
    tags: ['hành động'],
    example_jp: '八時に学校から出ます。',
    example_vi: 'Tôi rời trường lúc tám giờ.'
  },
  {
    kanji: '帰る',
    meaning_vi: 'về nhà, trở về',
    tags: ['hành động', 'gia đình'],
    example_jp: '六時に家に帰ります。',
    example_vi: 'Tôi về nhà lúc sáu giờ.'
  },
  {
    kanji: '行く',
    meaning_vi: 'đi, tới',
    tags: ['hành động'],
    example_jp: '明日日本へ行きます。',
    example_vi: 'Ngày mai tôi đi Nhật Bản.'
  },
  {
    kanji: '来る',
    meaning_vi: 'đến',
    tags: ['hành động'],
    example_jp: '友達が来ます。',
    example_vi: 'Bạn bè sẽ đến.'
  },
  {
    kanji: '見る',
    meaning_vi: 'xem, nhìn',
    tags: ['hành động'],
    example_jp: '写真を見ます。',
    example_vi: 'Tôi xem ảnh.'
  },
  {
    kanji: '遊ぶ',
    meaning_vi: 'chơi, vui chơi',
    tags: ['hành động', 'thời gian rảnh'],
    example_jp: '子供は公園で遊びます。',
    example_vi: 'Bọn trẻ chơi ở công viên.'
  },
  {
    kanji: '歩く',
    meaning_vi: 'đi bộ',
    tags: ['hành động'],
    example_jp: '毎朝公園を歩きます。',
    example_vi: 'Sáng nào tôi cũng đi bộ ở công viên.'
  },
  {
    kanji: '泳ぐ',
    meaning_vi: 'bơi',
    tags: ['hành động', 'thể thao'],
    example_jp: '夏、海で泳ぎます。',
    example_vi: 'Mùa hè tôi bơi ở biển.'
  },
  {
    kanji: '洗う',
    meaning_vi: 'rửa, giặt',
    tags: ['hành động', 'nhà cửa'],
    example_jp: '手を洗ってください。',
    example_vi: 'Xin hãy rửa tay.'
  },
  {
    kanji: '開く',
    meaning_vi: 'mở',
    tags: ['hành động', 'nhà cửa'],
    example_jp: '窓を開けます。',
    example_vi: 'Tôi mở cửa sổ.'
  },
  {
    kanji: '閉める',
    meaning_vi: 'đóng',
    tags: ['hành động', 'nhà cửa'],
    example_jp: 'ドアを閉めます。',
    example_vi: 'Tôi đóng cửa.'
  },
  {
    kanji: '座る',
    meaning_vi: 'ngồi',
    tags: ['hành động'],
    example_jp: 'ここに座ってください。',
    example_vi: 'Xin hãy ngồi vào đây.'
  },
  {
    kanji: '立つ',
    meaning_vi: 'đứng',
    tags: ['hành động'],
    example_jp: '後ろに立ってください。',
    example_vi: 'Xin hãy đứng sau.'
  },
  {
    kanji: '寝る',
    meaning_vi: 'ngủ, nằm',
    tags: ['hành động', 'sức khoẻ'],
    example_jp: '昨日は十二時に寝ました。',
    example_vi: 'Tối qua tôi ngủ lúc mười hai giờ.'
  },
  {
    kanji: '起きる',
    meaning_vi: 'dậy, thức dậy, xảy ra',
    tags: ['hành động', 'thời gian'],
    example_jp: '七時に起きます。',
    example_vi: 'Tôi dậy lúc bảy giờ.'
  },
  {
    kanji: '着る',
    meaning_vi: 'mặc (quần áo trên người)',
    tags: ['hành động', 'quần áo'],
    example_jp: 'コートを着ます。',
    example_vi: 'Tôi mặc áo khoác.'
  },
  {
    kanji: '履く',
    meaning_vi: 'mang, đi (giày, tất)',
    tags: ['hành động', 'quần áo'],
    example_jp: '運動靴を履きます。',
    example_vi: 'Tôi mang giày thể thao.'
  },
  {
    kanji: 'かぶる',
    meaning_vi: 'đội (mũ, kính)',
    tags: ['hành động', 'quần áo'],
    example_jp: '帽子をかぶります。',
    example_vi: 'Tôi đội mũ.'
  },
  {
    kanji: '脱ぐ',
    meaning_vi: 'cởi ra, tháo',
    tags: ['hành động', 'quần áo'],
    example_jp: '靴を脱ぎます。',
    example_vi: 'Tôi cởi giày.'
  },
  {
    kanji: '持つ',
    meaning_vi: 'cầm, có (đồ vật)',
    tags: ['hành động'],
    example_jp: 'かばんを持っています。',
    example_vi: 'Tôi đang cầm cặp.'
  },
  {
    kanji: '送る',
    meaning_vi: 'gửi',
    tags: ['hành động', 'giao tiếp'],
    example_jp: 'メールを送ります。',
    example_vi: 'Tôi gửi email.'
  },
  {
    kanji: '出す',
    meaning_vi: 'lấy ra, gửi ra',
    tags: ['hành động'],
    example_jp: '手紙を出します。',
    example_vi: 'Tôi gửi thư.'
  },
  {
    kanji: '返す',
    meaning_vi: 'trả lại, hoàn trả',
    tags: ['hành động'],
    example_jp: 'ペンを返します。',
    example_vi: 'Tôi trả bút lại.'
  },
  {
    kanji: '借りる',
    meaning_vi: 'mượn',
    tags: ['hành động'],
    example_jp: '図書館で本を借ります。',
    example_vi: 'Tôi mượn sách ở thư viện.'
  },
  {
    kanji: '答える',
    meaning_vi: 'trả lời',
    tags: ['giao tiếp'],
    example_jp: '質問に答えます。',
    example_vi: 'Tôi trả lời câu hỏi.'
  },
  {
    kanji: '説明',
    meaning_vi: 'giải thích',
    tags: ['giao tiếp'],
    example_jp: 'もう一度説明します。',
    example_vi: 'Tôi giải thích lại một lần nữa.'
  },
  {
    kanji: '紹介',
    meaning_vi: 'giới thiệu',
    tags: ['giao tiếp'],
    example_jp: '友達を紹介します。',
    example_vi: 'Tôi giới thiệu bạn bè.'
  },
  {
    kanji: '質問',
    meaning_vi: 'câu hỏi',
    tags: ['giao tiếp', 'học tập'],
    example_jp: '先生に質問しました。',
    example_vi: 'Tôi đã hỏi thầy một câu.'
  },
  {
    kanji: '伝える',
    meaning_vi: 'nói cho biết, truyền đạt',
    tags: ['giao tiếp'],
    example_jp: '友達にニュースを伝えます。',
    example_vi: 'Tôi báo tin cho bạn bè.'
  },
  {
    kanji: '思う',
    meaning_vi: 'nghĩ, cho là',
    tags: ['giao tiếp'],
    example_jp: 'それはいいと思う。',
    example_vi: 'Tôi nghĩ cái đó tốt.'
  },
  {
    kanji: '知る',
    meaning_vi: 'biết',
    tags: ['giao tiếp'],
    example_jp: 'そのニュースを知っています。',
    example_vi: 'Tôi biết tin đó.'
  },
  {
    kanji: '覚える',
    meaning_vi: 'học thuộc, ghi nhớ',
    tags: ['học tập'],
    example_jp: '新しい言葉を覚えます。',
    example_vi: 'Tôi học từ mới.'
  },
  {
    kanji: '忘れる',
    meaning_vi: 'quên',
    tags: ['học tập'],
    example_jp: '名前を忘れた。',
    example_vi: 'Tôi quên tên rồi.'
  },
  {
    kanji: '始める',
    meaning_vi: 'bắt đầu',
    tags: ['hành động'],
    example_jp: 'クラスを始めます。',
    example_vi: 'Tôi bắt đầu lớp học.'
  },
  {
    kanji: '終わる',
    meaning_vi: 'kết thúc, xong',
    tags: ['hành động'],
    example_jp: '授業が終わりました。',
    example_vi: 'Lớp học đã kết thúc.'
  },
  {
    kanji: '生まれる',
    meaning_vi: 'sinh ra',
    tags: ['gia đình'],
    example_jp: '赤ちゃんが生まれました。',
    example_vi: 'Em bé vừa sinh ra.'
  },
  {
    kanji: '住む',
    meaning_vi: 'sống, ở',
    tags: ['gia đình', 'địa điểm'],
    example_jp: '東京に住んでいます。',
    example_vi: 'Tôi sống ở Tokyo.'
  },
  {
    kanji: '集める',
    meaning_vi: 'thu thập, gom',
    tags: ['hành động'],
    example_jp: '切手を集めます。',
    example_vi: 'Tôi sưu tầm tem.'
  },
  {
    kanji: '探す',
    meaning_vi: 'tìm, tìm kiếm',
    tags: ['hành động'],
    example_jp: '駅で財布を探します。',
    example_vi: 'Tôi tìm ví ở ga.'
  },
  {
    kanji: '見せる',
    meaning_vi: 'cho xem',
    tags: ['hành động', 'giao tiếp'],
    example_jp: '写真を見せます。',
    example_vi: 'Tôi cho xem ảnh.'
  },
  {
    kanji: 'と',
    meaning_vi: 'cùng, với',
    tags: ['giao tiếp'],
    example_jp: '友達と映画を見ます。',
    example_vi: 'Tôi xem phim cùng bạn.'
  },
  {
    kanji: 'でも',
    meaning_vi: 'nhưng, tuy nhiên',
    tags: ['giao tiếp'],
    example_jp: '小さいです。でも、安いです。',
    example_vi: 'Nó nhỏ, nhưng rẻ.'
  },
  {
    kanji: 'だから',
    meaning_vi: 'bởi vì, tại vì',
    tags: ['giao tiếp'],
    example_jp: '雨です。だから、家に帰ります。',
    example_vi: 'Trời mưa, nên tôi về nhà.'
  }
];
