// lib/buildFlexBubble.js

// 

// export function buildFlexBubble(data) {
//   return {
//     type: 'bubble',
//     body: {
//       type: 'box',
//       layout: 'vertical',
//       contents: [
//         {
//           type: 'text',
//           text: data?.title || 'หัวข้อ',
//           weight: 'bold',
//           size: 'xl',
//           wrap: true,              // ✅ ทำให้ตัดบรรทัดได้
//         },
//         { type: 'separator', margin: 'lg' },
//         ...['การปฏิบัติงาน', 'การให้น้ำ', 'การให้ปุ๋ย', 'โรค', 'แมลง'].map((key) => ({
//           type: 'box',
//           layout: 'vertical',
//           margin: 'md',
//           contents: [
//             {
//               type: 'text',
//               text: key,
//               weight: 'bold',
//               size: 'md',
//               style: 'italic',
//             },
//             {
//               type: 'text',
//               text: (data && data[key]) ? String(data[key]) : '-',
//               wrap: true,          // ✅ ข้อมูลรายละเอียดก็ให้ wrap ด้วย
//               size: 'sm',
//               margin: 'sm',
//             },
//           ],
//         })),
//       ],
//     },
//   };
// }

export function buildFlexBubble(
  data = {},
  {
    titleKey = 'title',
    sectionOrder = ['การปฏิบัติงาน', 'การให้น้ำ', 'การให้ปุ๋ย', 'โรค', 'แมลง'],
    labelMap,
    showEmpty = false,
    heroUrl,
    button,
  } = {}
) {
  const toText = (v) => {
    const s = String(v ?? '').trim();
    return s.length ? s : null;
  };

  const title = toText(data[titleKey]) || 'หัวข้อ';

  const sectionBoxes = [];
  for (const key of sectionOrder) {
    const label = (labelMap && labelMap[key]) ? labelMap[key] : key;
    const val = toText(data?.[key]);
    if (!val && !showEmpty) continue; // ซ่อนหัวข้อที่ไม่มีค่า
    sectionBoxes.push({
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      contents: [
        { type: 'text', text: String(label), weight: 'bold', size: 'md' },
        { type: 'text', text: val || '-', wrap: true, size: 'sm', margin: 'sm' },
      ],
    });
  }

  const bodyContents = [
    { type: 'text', text: title, weight: 'bold', size: 'xl', wrap: true },
    { type: 'separator', margin: 'lg' },
    ...sectionBoxes,
  ];

  const bubble = {
    type: 'bubble',
    ...(heroUrl
      ? {
          hero: {
            type: 'image',
            url: heroUrl,                // ต้องเป็น HTTPS
            size: 'full',
            aspectRatio: '20:13',        // สัดส่วนที่ LINE แนะนำ
            aspectMode: 'cover',
          },
        }
      : {}),
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: bodyContents,
    },
    ...(button
      ? {
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                height: 'sm',
                action: {
                  type: 'uri',
                  label: button.label || 'ดูรายละเอียด',
                  uri: button.url,
                },
              },
            ],
          },
        }
      : {}),
  };

  return bubble;
}