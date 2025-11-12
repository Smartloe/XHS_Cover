import React, { useState } from 'react'
import Picker from 'emoji-picker-react'

const EmojiPanel = ({ onEmojiSelect }) => {
  const [showPicker, setShowPicker] = useState(false)

  const onEmojiClick = (emojiData) => {
    // 适配 emoji-picker-react 4.x 版本的新 API 结构
    const emoji = {
      id: Date.now(),
      name: emojiData.names?.[0] || emojiData.slug || 'emoji',
      symbol: emojiData.emoji,
      x: 540,
      y: 720
    }
    onEmojiSelect(emoji)
    setShowPicker(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Emoji表情</h3>
      
      <div className="space-y-4">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showPicker ? '收起选择器' : '选择Emoji'}
        </button>
        
        {showPicker && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Picker
              onEmojiClick={onEmojiClick}
              disableAutoFocus={true}
              native={true}
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
        
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">使用说明：</p>
          <ul className="space-y-1 text-xs">
            <li>• 点击"选择Emoji"打开选择器</li>
            <li>• 选择喜欢的表情添加到封面</li>
            <li>• 在预览区可拖拽调整位置</li>
            <li>• 点击表情右上角的×可删除</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EmojiPanel
