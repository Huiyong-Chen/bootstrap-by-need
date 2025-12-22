// @ts-ignore
import docx from "./docx.js"
import { QuestionInfo, QuestionTypeChineseName, QuestionTypeEnum } from '../types/index.types.js'


const questionTitle = (q: QuestionInfo, index: number) =>
  `${index + 1}. [${QuestionTypeChineseName[q.type]}] ${q.title} (${q.score}分)`

const createBlankLines = (count: number) =>
  Array.from({ length: count }, () => new docx.Paragraph({ text: '' }))

export function buildDoc(
  title: string,
  questions: QuestionInfo[],
  withAnswer: boolean,
) {
  return new docx.Document({
    sections: [
      {
        children: [
          new docx.Paragraph({
            text: title,
            heading: docx.HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.LEFT,
          }),
          ...questions.flatMap((q, idx) => {
            const isRandomPaper = title.includes('随机试卷')

            const questionParts = [
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: questionTitle(q, idx),
                    bold: true,
                  }),
                ],
              }),
            ]

            if (q.options?.length) {
              const correctAnswers =
                new Set(
                  q.answer
                    .split(',')
                    .map((a) => a.trim())
                    .filter(Boolean),
                )

              questionParts.push(
                ...q.options.map(
                  (opt, optIdx) => {
                    const label = `${String.fromCharCode(65 + optIdx)}`
                    const isCorrect = correctAnswers.has(label) || correctAnswers.has(`${label}.`)
                    return new docx.Paragraph({
                      indent: { left: 200 },
                      children: [
                        new docx.TextRun({
                          text: `${label}. ${opt}`,
                          color: isCorrect ? 'FF0000' : undefined,
                        }),
                      ],
                    })
                  },
                ),
              )
            }

            if (withAnswer) {
              questionParts.push(
                new docx.Paragraph({
                  indent: { left: 200 },
                  children: [
                    new docx.TextRun({
                      text: `答案：${q.answer}`,
                      bold: true,
                      color: 'FF0000',
                    }),
                  ],
                }),
              )
            }

            if (isRandomPaper) {
              if (q.type === QuestionTypeEnum.TrueFalse) {
                questionParts.push(...createBlankLines(1))
              } else if (q.type === QuestionTypeEnum.ShortAnswer) {
                questionParts.push(...createBlankLines(10))
              }
            }

            return questionParts
          }),
        ],
      },
    ],
  })
}

export const downloadDoc = async (doc: Document, filename: string) => {
  const blob = await docx.Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

