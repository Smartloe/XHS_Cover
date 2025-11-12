import React from 'react'

const TextEditor = ({ content, onChange, bodyFontSize = 52, onBodyFontSizeChange, useGradientText = false, onUseGradientTextChange }) => {
  const handleTextChange = (field, value) => {
    onChange({
      ...content,
      [field]: value
    })
  }

  const commonTags = [
    '探店vlog', '好物分享', '生活记录', '美食日记',
    '穿搭分享', '护肤心得', '旅行攻略', '学习打卡'
  ]

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 p-6 card-hover fade-in">
      <div className="space-y-7">
        {/* 主标题编辑 - 增强设计 */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <span className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"></span>
            主标题
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
              重要
            </span>
          </label>
          <div className="relative group">
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleTextChange('title', e.target.value)}
              className="w-full px-5 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-lg font-semibold hover:shadow-md group-hover:border-emerald-300"
              placeholder="✨ 输入吸引人的主标题"
            />
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 ${
                content.title.length > 20 ? 'bg-red-100 text-red-600' : 
                content.title.length > 15 ? 'bg-yellow-100 text-yellow-600' : 
                'bg-emerald-100 text-emerald-600'
              }`}>
                {content.title.length}/25
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
            建议长度：8-20字，简洁有力更吸引眼球
          </div>
        </div>

        {/* 高亮关键词 - 增强设计 */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></span>
            高亮关键词
          </label>
          <div className="relative">
            <input
              type="text"
              value={content.highlight}
              onChange={(e) => handleTextChange('highlight', e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 font-medium"
              placeholder="输入需要高亮显示的关键词"
            />
            <div className="absolute right-3 top-3">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                ✨ 高亮
              </span>
            </div>
          </div>
          
          {/* 高亮样式预览 */}
          {content.highlight && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                高亮效果预览：
              </p>
              <div className="flex flex-wrap gap-3">
                {/* 经典荧光笔效果 - 与PreviewCanvas保持一致 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">经典：</span>
                  <span className="px-2 py-1 text-sm font-bold"
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          padding: '4px 10px',
                          margin: '0 4px',
                          borderRadius: '10px',
                          background: `
                            linear-gradient(120deg, 
                              rgba(255,235,59,0.98) 0%, 
                              rgba(255,245,59,0.85) 20%, 
                              rgba(255,255,59,0.9) 40%,
                              rgba(255,245,59,0.85) 60%,
                              rgba(255,235,59,0.98) 80%, 
                              rgba(255,215,0,0.95) 100%
                            )
                          `,
                          color: '#1A202C',
                          fontWeight: '800',
                          boxShadow: `
                            0 6px 18px rgba(255,193,7,0.6), 
                            inset 0 3px 0 rgba(255,255,255,0.8),
                            inset 0 -2px 0 rgba(255,193,7,0.4),
                            0 0 0 2px rgba(255,193,7,0.4),
                            0 2px 4px rgba(0,0,0,0.1)
                          `,
                          borderBottom: '4px solid rgba(255,193,7,0.95)',
                          borderTop: '1px solid rgba(255,255,255,0.9)',
                          transform: 'skewX(-1.5deg) translateY(-2px) scale(1.03)',
                          textShadow: '0 1px 3px rgba(255,255,255,0.9), 0 -1px 1px rgba(255,193,7,0.3)',
                          filter: 'drop-shadow(0 3px 6px rgba(255,193,7,0.3))'
                        }}>
                    {content.highlight}
                  </span>
                </div>
                
                {/* 渐变荧光效果 - 增强美化版 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">渐变：</span>
                  <span className="px-2 py-1 text-sm font-bold text-white"
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          padding: '5px 10px',
                          margin: '0 4px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #FF6B9C 0%, #FF8E53 25%, #FFD166 50%, #4ECDC4 75%, #A78BFA 100%)',
                          color: '#FFFFFF',
                          fontWeight: '800',
                          textShadow: '0 2px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)',
                          boxShadow: `
                            0 8px 25px rgba(255,107,156,0.6), 
                            0 6px 15px rgba(255,142,83,0.5), 
                            inset 0 2px 0 rgba(255,255,255,0.4),
                            inset 0 -1px 0 rgba(0,0,0,0.1),
                            0 0 0 1px rgba(255,255,255,0.3)
                          `,
                          transform: 'translateY(-3px) scale(1.08) rotate(-0.5deg)',
                          border: '2px solid rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(3px)',
                          filter: 'drop-shadow(0 4px 8px rgba(255,107,156,0.3))'
                        }}>
                    {content.highlight}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
            关键词会在正文中自动高亮显示，可选择经典或渐变效果
          </p>
        </div>

        {/* 正文内容 - 增强设计 */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></span>
            正文内容
          </label>
          <div className="relative group">
            <textarea
              value={content.body}
              onChange={(e) => handleTextChange('body', e.target.value)}
              className="w-full px-5 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 resize-none custom-scrollbar font-medium leading-relaxed hover:shadow-md group-hover:border-blue-300"
              placeholder="💭 输入正文内容，关键词会自动高亮显示..."
              rows="6"
            />
            <div className="absolute bottom-3 right-4 flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 ${
                content.body.length > 100 ? 'bg-blue-100 text-blue-600' : 
                content.body.length > 50 ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-600'
              }`}>
                {content.body.length}字
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            建议长度：30-80字，包含关键词可自动高亮
          </div>
        </div>

        {/* 字体大小控制 - 增强设计 */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <span className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></span>
            字体大小调节
            <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              {bodyFontSize}px
            </span>
          </label>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-gray-600 min-w-[40px]">小</span>
              <input
                type="range"
                min="32"
                max="80"
                step="2"
                value={bodyFontSize}
                onChange={(e) => onBodyFontSizeChange?.(parseInt(e.target.value, 10))}
                className="flex-1 h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer hover:shadow-md transition-all duration-200"
                style={{
                  background: `linear-gradient(to right, #E879F9 0%, #F472B6 ${((bodyFontSize - 32) / 48) * 100}%, #E5E7EB ${((bodyFontSize - 32) / 48) * 100}%, #E5E7EB 100%)`
                }}
              />
              <span className="text-sm font-medium text-gray-600 min-w-[40px] text-right">大</span>
              <input
                type="number"
                min="32"
                max="80"
                step="2"
                value={bodyFontSize}
                onChange={(e) => onBodyFontSizeChange?.(parseInt(e.target.value, 10))}
                className="w-20 px-3 py-2 text-center bg-white border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold transition-all duration-200"
              />
            </div>
            
            {/* 快捷尺寸按钮 */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { size: 48, label: '小', desc: '精致' },
                { size: 56, label: '中', desc: '标准' },
                { size: 64, label: '大', desc: '醒目' },
                { size: 72, label: '特大', desc: '突出' }
              ].map(({ size, label, desc }) => (
                <button
                  key={size}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                    bodyFontSize === size
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-600 hover:bg-purple-50 border border-purple-200 hover:border-purple-300'
                  }`}
                  onClick={() => onBodyFontSizeChange?.(size)}
                >
                  <div className="text-xs font-bold">{label}</div>
                  <div className="text-xs opacity-75">{size}px</div>
                </button>
              ))}
            </div>
            
            {/* 字体预览 */}
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-gray-600 mb-2">预览效果：</p>
              <div 
                className="text-center font-semibold text-gray-800 transition-all duration-300"
                style={{ fontSize: `${Math.min(bodyFontSize * 0.4, 24)}px` }}
              >
                这是字体大小预览
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
              推荐：标准56px，醒目64px，突出72px
            </p>
          </div>
        </div>

        {/* 渐变荧光效果 - 增强设计 */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 rounded-xl border border-yellow-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ripple-effect">
            <input
              type="checkbox"
              checked={!!useGradientText}
              onChange={(e) => onUseGradientTextChange?.(e.target.checked)}
              className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-400 transition-all duration-200"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-800">✨ 启用渐变荧光效果</span>
                {useGradientText && (
                  <span className="px-2 py-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs rounded-full font-medium animate-pulse">
                    已启用
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">标题使用彩虹渐变色彩，高亮文字采用动态荧光笔效果</p>
            </div>
          </label>
          
          {/* 效果说明 */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></span>
                <span className="text-gray-600">标题：彩虹渐变 + 发光效果</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full"></span>
                <span className="text-gray-600">高亮：动态荧光 + 阴影效果</span>
              </div>
            </div>
          </div>
        </div>

        {/* 标签设置 */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></span>
            标签文字
          </label>
          <input
            type="text"
            value={content.tag}
            onChange={(e) => handleTextChange('tag', e.target.value)}
            className="w-full px-4 py-3 bg-white/70 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
            placeholder="添加标签分类"
          />
          
          {/* 常用标签快捷选择 */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <span className="w-1 h-1 bg-green-400 rounded-full"></span>
              热门标签推荐
            </p>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTextChange('tag', tag)}
                  className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                    content.tag === tag
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextEditor
