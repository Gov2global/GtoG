// lib/buildFlexBubble.js

// 


export function buildFlexBubble(data) {
  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: data?.title || 'หัวข้อ',
          weight: 'bold',
          size: 'xl',
          wrap: true,              // ✅ ทำให้ตัดบรรทัดได้
        },
        { type: 'separator', margin: 'lg' },
        ...['การปฏิบัติงาน', 'การให้น้ำ', 'การให้ปุ๋ย', 'โรค', 'แมลง'].map((key) => ({
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          contents: [
            {
              type: 'text',
              text: key,
              weight: 'bold',
              size: 'md',
              style: 'italic',
            },
            {
              type: 'text',
              text: (data && data[key]) ? String(data[key]) : '-',
              wrap: true,          // ✅ ข้อมูลรายละเอียดก็ให้ wrap ด้วย
              size: 'sm',
              margin: 'sm',
            },
          ],
        })),
      ],
    },
  };
}