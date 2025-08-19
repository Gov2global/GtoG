// lib/buildFlexBubble.js

export function buildFlexBubble(data) { // [ADDED: ใช้ named export ให้ชัดเจน]
  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        { type: 'text', text: data?.title || 'หัวข้อ', weight: 'bold', size: 'xl' }, // [ADDED]
        { type: 'separator', margin: 'lg' }, // [ADDED]
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
              text: (data && data[key]) ? String(data[key]) : '-', // [ADDED: ถ้าไม่มีค่าให้ใส่ '-']
              wrap: true,
              size: 'sm',
              margin: 'sm',
            },
          ],
        })),
      ],
    },
  };
}
