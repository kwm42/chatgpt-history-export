function parseChatHistoryDocument() {
  const dialogs = getDialogues()
  const result = []
  let item = {
    question: [],
    answer: []
  }

  console.log(dialogs)

  dialogs.forEach(paragraph => {
    if (!paragraph.isQuestion) {
      item.answer.push(paragraph.content)
    } else {
      if (item.question.length > 0) {
        result.push(Object.assign({}, item))
        item = {
          question: [paragraph.content],
          answer: []
        }
      } else {
        item.question.push(paragraph.content)
      }
    }
  })
  result.push(Object.assign({}, item))
  return result
}

function getTextFromNode(node) {
  const contentNode = node.querySelector('.items-start')
  const content = String(contentNode.textContent)
  return content.replace(/\\n/ig, '').replace(/\s+/g, ' ').trim()
}

function getDialogues() {
  const items = document.querySelectorAll('.text-base')
  const result = []
  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    result.push({
      isQuestion: !checkIsGPTAnswer(element),
      content: getTextFromNode(element)
    })
  }

  return result
}

function checkIsGPTAnswer(node) {
  return node.querySelectorAll('.markdown.prose').length > 0
}

export {
  parseChatHistoryDocument
}