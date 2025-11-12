import React, { useState } from 'react'
import Picker from 'emoji-picker-react'

const quickEmojis = ['✨', '🔥', '👍', '🎉', '💡', '❤️', '📍', '⭐️', '⚡️', '🍀']

const EmojiPanel = ({ onEmojiSelect }) => {
  const [showPicker, setShowPicker] = useState(false)

  const handleEmojiAdd = (payload = {}) => {
    if (!payload.symbol) return
    const nextEmoji = {
      symbol: payload.symbol,
      name: payload.name || payload.slug || payload.names?.[0] || 'emoji'
    }
    onEmojiSelect(nextEmoji)
  }

  const onEmojiClick = (emojiData) => {
    handleEmojiAdd({
      symbol: emojiData.emoji,
      name: emojiData.names?.[0] || emojiData.slug
    })
    setShowPicker(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">快捷贴纸</p>
        <div className="grid grid-cols-5 gap-2">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiAdd({ symbol: emoji })}
              className="flex items-center justify-center rounded-2xl bg-white/80 border border-gray-200 py-2 text-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              aria-label={`添加${emoji}贴纸`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Emoji 素材库</p>
            <p className="text-xs text-gray-500">来自 emoji-picker-react</p>
          </div>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm hover:shadow-md transition-all"
          >
            {showPicker ? '收起面板' : '展开面板'}
          </button>
        </div>

        {showPicker && (
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner">
            <Picker
              onEmojiClick={onEmojiClick}
              disableAutoFocus
              native
              groupNames={{
                smileys_people: '笑脸与人物',
                animals_nature: '动物与自然',
                food_drink: '食物与饮品',
                travel_places: '旅行与地点',
                activities: '活动',
                objects: '物品',
                symbols: '符号',
                flags: '旗帜'
              }}
            />
          </div>
        )}
      </div>

      <div className="grid gap-3 text-xs text-gray-600 bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖱️</span>
          <span>拖拽贴纸可调整位置，右下角可缩放，右上角可旋转</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">⌫</span>
          <span>选中贴纸后按 Delete 删除，或点击贴纸上的 ×</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">💾</span>
          <span>贴纸信息会自动保存，下次打开自动恢复</span>
        </div>
      </div>
    </div>
  )
}

export default EmojiPanel
