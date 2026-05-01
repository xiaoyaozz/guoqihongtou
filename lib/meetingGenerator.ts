import { MeetingMinutesData } from '@/types';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';

const MEETING_TYPES = {
  party: '党委会议',
  admin: '行政办公会议',
  project: '项目例会',
};

export function generateMeetingMinutes(data: MeetingMinutesData): string {
  const meetingTypeText = MEETING_TYPES[data.meetingType];
  
  return `
    ${data.title || `${meetingTypeText}纪要`}
    
    ${data.documentNumber || `[${new Date().getFullYear()}]第${Math.floor(Math.random() * 100)}号`}
    
    主送：${data.issuer || '各部门、各下属单位'}
    抄送：${data.cc || '公司领导'}
    
    时间：${data.date}
    地点：${data.location || '公司会议室'}
    出席人员：${data.attendees}
    主持人：${data.attendees.split('、')[0] || '总经理'}
    记录人：办公室
    
    一、会议概况
    
    ${data.content}
    
    二、会议决议
    
    ${data.resolutions || '无'}
    
    三、待办事项
    
    ${data.todos.length > 0 
      ? data.todos.map((todo, index) => 
        `${index + 1}. ${todo.task} - 责任人：${todo.responsible} - 完成期限：${todo.deadline} - 状态：${todo.status}`
      ).join('\n\n')
      : '无'
    }
    
    （此页无正文）
    
    印发日期：${new Date().toLocaleDateString('zh-CN')}
    印发份数：50份
  `.trim();
}

export async function generateDocx(data: MeetingMinutesData): Promise<Buffer> {
  const meetingTypeText = MEETING_TYPES[data.meetingType];
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'XXXXXXX有限公司',
              bold: true,
              size: 36,
              color: 'c41e3a',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: data.title || `${meetingTypeText}纪要`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: data.documentNumber || `[${new Date().getFullYear()}]第${Math.floor(Math.random() * 100)}号`,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '主送：', bold: true }), new TextRun(data.issuer || '各部门、各下属单位')],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '抄送：', bold: true }), new TextRun(data.cc || '公司领导')],
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '时间：', bold: true }), new TextRun(data.date)],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '地点：', bold: true }), new TextRun(data.location || '公司会议室')],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '出席人员：', bold: true }), new TextRun(data.attendees)],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '主持人：', bold: true }), new TextRun(data.attendees.split('、')[0] || '总经理')],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '记录人：', bold: true }), new TextRun('办公室')],
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: '一、会议概况',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: data.content,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: '二、会议决议',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: data.resolutions || '无',
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: '三、待办事项',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 200 },
        }),
        data.todos.length > 0 ? new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '序号', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '任务', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '责任人', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '完成期限', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '状态', bold: true })] })] }),
              ],
            }),
            ...data.todos.map((todo, index) => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph((index + 1).toString())] }),
                new TableCell({ children: [new Paragraph(todo.task)] }),
                new TableCell({ children: [new Paragraph(todo.responsible)] }),
                new TableCell({ children: [new Paragraph(todo.deadline)] }),
                new TableCell({ children: [new Paragraph(todo.status)] }),
              ],
            })),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }) : new Paragraph({ text: '无' }),
        new Paragraph({
          text: '（此页无正文）',
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '印发日期：', bold: true }), new TextRun(new Date().toLocaleDateString('zh-CN'))],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '印发份数：', bold: true }), new TextRun('50份')],
          alignment: AlignmentType.RIGHT,
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
