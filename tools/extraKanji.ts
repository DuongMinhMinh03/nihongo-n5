/**
 * Danh sách kanji bổ sung cho content/kanji/n5.json.
 *
 * Onyomi / kunyomi / số nét / bộ sưu tập: content/kanji/imported-n5.json
 * (nguồn OpenJLPT, tạo bởi `npm run import:jlpt`).
 * Nghĩa tiếng Việt + từ ví dụ: file này.
 *
 * Chạy:  npm run seed:extra
 */

export interface ExtraKanji {
  /** Kanji */
  kanji: string;
  /** Nghĩa tiếng Việt */
  meaning_vi: string;
  /** Từ ví dụ kèm nghĩa */
  example_words: { word: string; vi: string }[];
}

export const EXTRA_KANJI: ExtraKanji[] = [
  {
    kanji: '一',
    meaning_vi: 'một',
    example_words: [
      { word: '一人', vi: 'một người' },
      { word: '一日', vi: 'một ngày' },
      { word: '一緒', vi: 'cùng nhau' }
    ]
  },
  {
    kanji: '二',
    meaning_vi: 'hai',
    example_words: [
      { word: '二つ', vi: 'hai cái' },
      { word: '二人', vi: 'hai người' },
      { word: '二月', vi: 'tháng hai' }
    ]
  },
  {
    kanji: '三',
    meaning_vi: 'ba',
    example_words: [
      { word: '三つ', vi: 'ba cái' },
      { word: '三日', vi: 'ba ngày' },
      { word: '三角形', vi: 'hình tam giác' }
    ]
  },
  {
    kanji: '四',
    meaning_vi: 'bốn',
    example_words: [
      { word: '四つ', vi: 'bốn cái' },
      { word: '四人', vi: 'bốn người' },
      { word: '四角', vi: 'góc vuông' }
    ]
  },
  {
    kanji: '五',
    meaning_vi: 'năm',
    example_words: [
      { word: '五つ', vi: 'năm cái' },
      { word: '五人', vi: 'năm người' },
      { word: '五十音', vi: 'bảng kana (50 âm)' }
    ]
  },
  {
    kanji: '六',
    meaning_vi: 'sáu',
    example_words: [
      { word: '六つ', vi: 'sáu cái' },
      { word: '六日', vi: 'sáu ngày' },
      { word: '六月', vi: 'tháng sáu' }
    ]
  },
  {
    kanji: '七',
    meaning_vi: 'bảy',
    example_words: [
      { word: '七つ', vi: 'bảy cái' },
      { word: '七日', vi: 'bảy ngày' },
      { word: '七月', vi: 'tháng bảy' }
    ]
  },
  {
    kanji: '八',
    meaning_vi: 'tám',
    example_words: [
      { word: '八つ', vi: 'tám cái' },
      { word: '八日', vi: 'tám ngày' },
      { word: '八月', vi: 'tháng tám' }
    ]
  },
  {
    kanji: '九',
    meaning_vi: 'chín',
    example_words: [
      { word: '九つ', vi: 'chín cái' },
      { word: '九日', vi: 'chín ngày' },
      { word: '九月', vi: 'tháng chín' }
    ]
  },
  {
    kanji: '十',
    meaning_vi: 'mười',
    example_words: [
      { word: '十分', vi: 'mười phút / đủ' },
      { word: '十日', vi: 'mười ngày' },
      { word: '十人', vi: 'mười người' }
    ]
  },
  {
    kanji: '百',
    meaning_vi: 'trăm',
    example_words: [
      { word: '百円', vi: 'một trăm yên' },
      { word: '百人', vi: 'một trăm người' },
      { word: '百分率', vi: 'tỉ lệ phần trăm' }
    ]
  },
  {
    kanji: '千',
    meaning_vi: 'nghìn',
    example_words: [
      { word: '千円', vi: 'một nghìn yên' },
      { word: '千人', vi: 'một nghìn người' }
    ]
  },
  {
    kanji: '万',
    meaning_vi: 'vạn, mười nghìn',
    example_words: [
      { word: '一万円', vi: 'mười nghìn yên' },
      { word: '万年筆', vi: 'bút máy' }
    ]
  },
  {
    kanji: '円',
    meaning_vi: 'yên (tiền Nhật), tròn',
    example_words: [
      { word: '百円', vi: 'một trăm yên' },
      { word: '円い', vi: 'tròn' }
    ]
  },
  {
    kanji: '半',
    meaning_vi: 'một nửa',
    example_words: [
      { word: '半分', vi: 'một nửa' },
      { word: '時半', vi: 'nửa giờ' }
    ]
  },
  {
    kanji: '分',
    meaning_vi: 'phút, phần, chia',
    example_words: [
      { word: '十分', vi: 'mười phút' },
      { word: '自分', vi: 'bản thân' },
      { word: '分かる', vi: 'hiểu' }
    ]
  },
  {
    kanji: '人',
    meaning_vi: 'người',
    example_words: [
      { word: '人', vi: 'người' },
      { word: '外国人', vi: 'người nước ngoài' },
      { word: '三人', vi: 'ba người' }
    ]
  },
  {
    kanji: '入',
    meaning_vi: 'vào, nhập',
    example_words: [
      { word: '入口', vi: 'lối vào' },
      { word: '入学', vi: 'nhập học' },
      { word: '入院', vi: 'nhập viện' }
    ]
  },
  {
    kanji: '出',
    meaning_vi: 'ra, xuất, xuất hiện',
    example_words: [
      { word: '出口', vi: 'lối ra' },
      { word: '出席', vi: 'tham dự / có mặt' },
      { word: '出かける', vi: 'ra ngoài' }
    ]
  },
  {
    kanji: '名',
    meaning_vi: 'tên, danh',
    example_words: [
      { word: '名前', vi: 'tên' },
      { word: '有名', vi: 'nổi tiếng' },
      { word: '名物', vi: 'đặc sản' }
    ]
  },
  {
    kanji: '長',
    meaning_vi: 'dài, trưởng',
    example_words: [
      { word: '長い', vi: 'dài' },
      { word: '社長', vi: 'giám đốc' },
      { word: '課長', vi: 'trưởng phòng' }
    ]
  },
  {
    kanji: '前',
    meaning_vi: 'trước, phía trước',
    example_words: [
      { word: '名前', vi: 'tên' },
      { word: '午前', vi: 'buổi sáng' },
      { word: '駅前', vi: 'trước ga' }
    ]
  },
  {
    kanji: '後',
    meaning_vi: 'sau, phía sau',
    example_words: [
      { word: '後ろ', vi: 'phía sau' },
      { word: '午後', vi: 'buổi chiều' },
      { word: '最後', vi: 'cuối cùng' }
    ]
  },
  {
    kanji: '午',
    meaning_vi: 'trưa, giữa ngày',
    example_words: [
      { word: '午前', vi: 'buổi sáng' },
      { word: '午後', vi: 'buổi chiều' },
      { word: '正午', vi: 'chính ngô trưa' }
    ]
  },
  {
    kanji: '毎',
    meaning_vi: 'mỗi',
    example_words: [
      { word: '毎日', vi: 'mỗi ngày' },
      { word: '毎朝', vi: 'mỗi sáng' },
      { word: '毎週', vi: 'mỗi tuần' }
    ]
  },
  {
    kanji: '東',
    meaning_vi: 'phía đông',
    example_words: [
      { word: '東方', vi: 'phương đông' },
      { word: '東京', vi: 'Tokyo' },
      { word: '東西', vi: 'đông tây' }
    ]
  },
  {
    kanji: '西',
    meaning_vi: 'phía tây',
    example_words: [
      { word: '西方', vi: 'phương tây' },
      { word: '西洋', vi: 'phương Tây' },
      { word: '東西', vi: 'đông tây' }
    ]
  },
  {
    kanji: '南',
    meaning_vi: 'phía nam',
    example_words: [
      { word: '南方', vi: 'phương nam' },
      { word: '南口', vi: 'cửa nam' }
    ]
  },
  {
    kanji: '北',
    meaning_vi: 'phía bắc',
    example_words: [
      { word: '北方', vi: 'phương bắc' },
      { word: '北海道', vi: 'Hokkaido' }
    ]
  },
  {
    kanji: '右',
    meaning_vi: 'bên phải',
    example_words: [
      { word: '右手', vi: 'bàn tay phải' },
      { word: '左右', vi: 'trái phải' }
    ]
  },
  {
    kanji: '左',
    meaning_vi: 'bên trái',
    example_words: [
      { word: '左手', vi: 'bàn tay trái' },
      { word: '左右', vi: 'trái phải' }
    ]
  },
  {
    kanji: '外',
    meaning_vi: 'bên ngoài',
    example_words: [
      { word: '外国', vi: 'nước ngoài' },
      { word: '外国人', vi: 'người nước ngoài' },
      { word: '海外', vi: 'nước ngoài, hải ngoại' }
    ]
  },
  {
    kanji: '話',
    meaning_vi: 'nói chuyện, câu chuyện',
    example_words: [
      { word: '電話', vi: 'điện thoại' },
      { word: '話す', vi: 'nói chuyện' },
      { word: '会話', vi: 'hội thoại' }
    ]
  },
  {
    kanji: '書',
    meaning_vi: 'viết, sách',
    example_words: [
      { word: '書く', vi: 'viết' },
      { word: '辞書', vi: 'từ điển' },
      { word: '図書館', vi: 'thư viện' }
    ]
  },
  {
    kanji: '読',
    meaning_vi: 'đọc',
    example_words: [
      { word: '読む', vi: 'đọc' },
      { word: '読書', vi: 'việc đọc sách' }
    ]
  },
  {
    kanji: '聞',
    meaning_vi: 'nghe, hỏi',
    example_words: [
      { word: '聞く', vi: 'nghe / hỏi' },
      { word: '聞こえる', vi: 'nghe thấy' },
      { word: '新聞', vi: 'báo' }
    ]
  },
  {
    kanji: '休',
    meaning_vi: 'nghỉ',
    example_words: [
      { word: '休み', vi: 'ngày nghỉ' },
      { word: '休む', vi: 'nghỉ ngơi' },
      { word: '夏休み', vi: 'kỳ nghỉ hè' }
    ]
  },
  {
    kanji: '校',
    meaning_vi: 'trường học, trường',
    example_words: [
      { word: '学校', vi: 'trường học' },
      { word: '高校', vi: 'trường cấp ba' },
      { word: '校長', vi: 'hiệu trưởng' }
    ]
  },
  {
    kanji: '無',
    meaning_vi: 'không có, vô',
    example_words: [
      { word: '無い', vi: 'không có' },
      { word: '無理', vi: 'quá sức, không được' }    ]
  },
  {
    kanji: '雨',
    meaning_vi: 'mưa',
    example_words: [
      { word: '雨', vi: 'mưa' },
      { word: '雨天', vi: 'ngày mưa' },
      { word: '雨具', vi: 'đồ dùng che mưa' }
    ]
  },
  {
    kanji: '誰',
    meaning_vi: 'ai',
    example_words: [
      { word: '誰', vi: 'ai' },
      { word: '誰か', vi: 'ai đó' }
    ]
  },
  {
    kanji: '丈',
    meaning_vi: 'đơn vị đo (shaku), dài',
    example_words: [
      { word: '大丈夫', vi: 'không sao' },
      { word: '丈夫', vi: 'bền, khỏe' }
    ]
  }
];
