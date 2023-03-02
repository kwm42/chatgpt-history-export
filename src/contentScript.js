'use strict';

import './contentScript.css'

import { camelcaseToUnderscore, dataURItoBlob } from './util'
import html2canvas from 'html2canvas'
import { parseChatHistoryDocument } from './documentParser';

const prefixCls = 'chatgpt-history-export'

const defaultButtonStyle = {
  position: 'relative',
  display: 'inline-block',
  width: '130px',
  height: '40px',
  color: '#fff',
  borderRadius: '5px',
  padding: '10px 25px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: `inset 2px 2px 2px 0px rgba(255, 255, 255, .5),
    7px 7px 20px 0px rgba(0, 0, 0, .1),
    4px 4px 5px 0px rgba(0, 0, 0, .1)`,
  outline: 'none',
  color: '#333',
  backgroundColor: '#4dccc6',
  backgroundImage: `linear-gradient(315deg, #4dccc6 0%, #96e4df 74%)`,
  lineHeight: `42px`,
  padding: '0',
  border: 'none',
}

function createStyleAttribute(style) {
  if (!typeof style === 'object') {
    return ''
  }
  const styleAttr = Object.keys(style).map((key) => {
    const value = style[key]
    return `${camelcaseToUnderscore(key, '-')}: ${value}`
  }).join(';')

  return styleAttr
}

function createButtonElement({
  text,
  handler,
  name,
  style = defaultButtonStyle
}) {
  const button = document.createElement('button')
  const textNode = document.createTextNode(text)
  const styleAttr = createStyleAttribute(style)

  button.appendChild(textNode)
  button.addEventListener('click', handler)
  button.classList.add(prefixCls + '-button', name)
  button.setAttribute('style', styleAttr)

  return button
}

function copyHandler() {
  const result = parseChatHistoryDocument()
  const str = result.map(section => {
    const questionStr = section.question.join('\n')
    const answerStr = section.answer.join('\n')
    return questionStr + '\n\n' + answerStr
  }).join('\n\n\n')

  navigator.clipboard.writeText(str)
  console.log('success')
}

function saveImageHandler() {
  const $element = document.querySelector('.flex.flex-col.items-center')
  if (!$element) {
    return
  }
  html2canvas($element, {
    useCORS: true,
    allowTaint: true
  }).then(canvasElement => {
    console.log(canvasElement)
    const blob = dataURItoBlob(canvasElement.toDataURL())

    const aLink = document.createElement('a')
    aLink.href = URL.createObjectURL(blob)
    let e = document.createEvent('HTMLEvents')
    e.initEvent('click', true, true)
    aLink.download = 'chatgpt-screenshot-' + new Date().getTime() + '.png'
    aLink.click()

  }).catch(err => {
    console.log(err)
  })
}

function createOperateButtonGroup() {
  const btnGroup = document.createElement('div')
  btnGroup.classList.add(prefixCls + '-btn-group')
  const groupStyle = createStyleAttribute({
    position: 'fixed',
    bottom: '100px',
    left: '50%',
    display: 'flex',
    flexDirection: 'row',
    transform: 'translateX(-50%)'
  })
  btnGroup.setAttribute('style', groupStyle)

  const copyAsTextButton = createButtonElement({
    text: 'Copy As Text',
    handler: copyHandler,
    name: 'copy-as-text',
  })

  const saveAsImageButton = createButtonElement({
    text: 'Save As Image',
    handler: saveImageHandler,
    name: 'save-as-image',
  })

  btnGroup.appendChild(copyAsTextButton)
  btnGroup.appendChild(saveAsImageButton)

  return btnGroup
}

(function () {
  // if (!/openai\.com/.test(location.host)) {
  //   return
  // }
  const buttonGroup = createOperateButtonGroup()
  document.body.appendChild(buttonGroup)
})()