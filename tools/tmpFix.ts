import fs from 'node:fs';

const FIXES: Record<string, Record<string, { jp: string; vi: string }>> = {
  'tools/authored-part1.json': {
    りっぱ: { jp: 'りっぱな衣装ですね。', vi: 'Bộ đồ thật lộng lẫy nhỉ.' },
    とり肉: { jp: 'とり肉が大好きです。', vi: 'Tôi thích thịt gà.' }
  },
  'tools/authored-part2.json': {
    開ける: { jp: 'ドアを開けてください。', vi: 'Xin mở cửa.' },
    要る: { jp: '今お金はいりません。', vi: 'Lúc này tôi không cần tiền.' },
    入れる: { jp: '引き出しに紙を入れます。', vi: 'Tôi cho giấy vào ngăn kéo.' },
    切る: { jp: 'ナイフでパンを切ります。', vi: 'Tôi cắt bánh mì bằng dao.' },
    困る: { jp: '時間なくて困っています。', vi: 'Tôi không có thời gian nên rất khó khăn.' },
    閉まる: { jp: '店は六時に閉まります。', vi: 'Cửa hàng đóng lúc sáu giờ.' },
    疲れる: { jp: 'よく眠れないので疲れます。', vi: 'Vì ngủ không đủ nên tôi mệt.' },
    つける: { jp: 'テレビをつけてください。', vi: 'Xin bật ti vi lên.' },
    止める: { jp: 'ここでタクシーを止めます。', vi: 'Tôi dừng taxi ở đây.' },
    取る: { jp: '塩を取ります。', vi: 'Tôi lấy muối.' },
    撮る: { jp: '写真を取りました。', vi: 'Tôi đã chụp ảnh.' },
    並ぶ: { jp: '人の前に並びます。', vi: 'Tôi xếp hàng trước mặt mọi người.' },
    引く: { jp: 'カーテンを引きます。', vi: 'Tôi kéo rèm.' },
    欲しい: { jp: '新しい車が欲しいです。', vi: 'Tôi muốn có một chiếc xe mới.' }
  }
};

for (const [file, fixes] of Object.entries(FIXES)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<
    string,
    { jp: string; vi: string }
  >;
  for (const [k, v] of Object.entries(fixes)) {
    if (data[k]) data[k] = v;
    else console.log(`  ! không có khoá "${k}" trong ${file}`);
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`${file} -> ${Object.keys(data).length} mục`);
}
