module.exports = makeRichMessage
module.exports.mergeMessages = mergeMessages

var autolinker = require('autolinker')
var emojiNamedCharacters = require('emoji-named-characters')
var escapeHTML = require('escape-html')
var ghlink = require('ghlink')
var htmlToVDom = require('html-to-vdom')
var VNode = require('virtual-dom/vnode/vnode')
var VText = require('virtual-dom/vnode/vtext')
var util = require('./util.js')

var EMOJI_REGEX = /(\s|>|^)?:([A-z0-9_+]+):(\s|<|$)/g

var convertHTML = htmlToVDom({
  VNode: VNode,
  VText: VText
})

function makeVDom (html) {
  return convertHTML('<div>' + html + '</div>')
}

function makeRichMessage (message) {
  message.anon = /Anonymous/i.test(message.username)
  message.avatar = message.anon
    ? 'static/Icon.png'
    : 'https://github.com/' + message.username + '.png'
  message.timeago = util.timeago(message.timestamp)

  message.html = escapeHTML(message.text)
  message.html = emojify(message.html)
  message.html = autolinker.link(message.html)
  message.html = ghlink(message.html, { format: 'html' })

  message.vdom = makeVDom(message.html)

  return message
}

function emojify (str) {
  return str.replace(EMOJI_REGEX, function (full, $1, $2, $3) {
    return ($1 || '') + renderEmoji($2) + ($3 || '')
  })
}

function renderEmoji (emoji) {
  return emoji in emojiNamedCharacters ?
      '<img src="node_modules/emoji-named-characters/pngs/' + encodeURI(emoji) + '.png"'
      + ' alt=":' + escape(emoji) + ':"'
      + ' title=":' + escape(emoji) + ':"'
      + ' class="emoji" align="absmiddle" height="20" width="20">'
    : ':' + emoji + ':'
}

function mergeMessages (message1, message2) {
  message1.text += '\n' + message2.text
  message1.html += '<p></p>' + message2.html
  message1.vdom = makeVDom(message1.html)
  return message1
}
