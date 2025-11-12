import React from 'react'
import { SketchPicker } from 'react-color'

const ColorPanel = ({ 
  theme, 
  onThemeChange, 
  backgroundColor, 
  onBackgroundColorChange 
}) => {
  const colorThemes = [
    {
      id: 'morandi',
      name: '莫兰迪',
      colors: {
        primary: '#8B7355',
        secondary: '#A89F91',
        accent: '#D4A574'
      }
    },
    {
      id: 'orange',
      name: '活力橙',
      colors: {
        primary: '#FF6B35',
        secondary: '#FF8C42',
        accent: '#FFB347'
      }
    },
    {
      id: 'instagram',
      name: 'Ins风',
      colors: {
        primary: '#E1306C',
        secondary: '#F77737',
        accent: '#FFDC80'
      }
    },
    {
      id: 'green',
      name: '清新绿',
      colors: {
        primary: '#4CAF50',
        secondary: '#8BC34A',
        accent: '#CDDC39'
      }
    },
    {
      id: 'pink',
      name: '温柔粉',
      colors: {
        primary: '#FF69B4',
        secondary: '#FFB6C1',
        accent: '#FFC0CB'
      }
    },
    {
      id: 'gray',
      name: '高级灰',
      colors: {
        primary: '#696969',
        secondary: '#808080',
        accent: '#A9A9A9'
      }
    },
    {
      id: 'notebook',
      name: '笔记本',
      colors: {
        primary: '#2C3E50',
        secondary: '#34495E',
        accent: '#7F8C8D'
      }
    }
  ]

  const [showColorPicker, setShowColorPicker] = React.useState(false)

  return (
    <div className="space-y-6">
      {/* 主题选择区域 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></span>
          <h4 className="text-sm font-semibold text-gray-700">配色主题</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {colorThemes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => onThemeChange(themeOption.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 card-hover ${
                theme === themeOption.id
                  ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md'
                  : 'border-gray-200 hover:border-emerald-300 bg-white/70 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* 配色预览 */}
                <div className="flex space-x-1">
                  <div
                    className="w-5 h-5 rounded-full shadow-sm"
                    style={{ backgroundColor: themeOption.colors.primary }}
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm"
                    style={{ backgroundColor: themeOption.colors.secondary }}
                  />
                  <div
                    className="w-5 h-5 rounded-full shadow-sm"
                    style={{ backgroundColor: themeOption.colors.accent }}
                  />
                </div>
                <div className="text-left flex-1">
                  <span className="text-sm font-semibold text-gray-800 block">{themeOption.name}</span>
                  <span className="text-xs text-gray-500">
                    {themeOption.id === 'morandi' && '温柔优雅'}
                    {themeOption.id === 'orange' && '活力温暖'}
                    {themeOption.id === 'instagram' && '时尚亮眼'}
                    {themeOption.id === 'green' && '自然清新'}
                    {themeOption.id === 'pink' && '甜美可爱'}
                    {themeOption.id === 'gray' && '简约高级'}
                    {themeOption.id === 'notebook' && '商务专业'}
                  </span>
                </div>
                {/* 选中状态指示 */}
                {theme === themeOption.id && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 背景色自定义区域 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></span>
          <h4 className="text-sm font-semibold text-gray-700">背景色微调</h4>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-12 h-12 rounded-xl border-3 border-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              style={{ backgroundColor }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">当前背景色</p>
              <p className="text-xs text-gray-500 font-mono">{backgroundColor}</p>
            </div>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showColorPicker ? '收起' : '选择颜色'}
            </button>
          </div>
          
          {/* 快速颜色选择 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['#F8F5F2', '#FFFFFF', '#F0F9FF', '#F0FDF4', '#FFFBEB', '#FDF2F8', '#F5F3FF'].map((color) => (
              <button
                key={color}
                onClick={() => onBackgroundColorChange(color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                  backgroundColor === color ? 'border-gray-800 shadow-md' : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ backgroundColor }}
                title={color}
              />
            ))}
          </div>
          
          {/* 颜色选择器 */}
          {showColorPicker && (
            <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 shadow-lg">
              <SketchPicker
                color={backgroundColor}
                onChange={(color) => onBackgroundColorChange(color.hex)}
                disableAlpha={true}
                width="100%"
              />
            </div>
          )}
        </div>
      </div>

      {/* 配色建议 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs">💡</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">配色小贴士</p>
            <ul className="space-y-1 text-blue-700 text-xs">
              <li>• 莫兰迪色系：温柔优雅，适合生活分享</li>
              <li>• 活力橙色：温暖明亮，适合美食探店</li>
              <li>• 清新绿色：自然舒适，适合健康环保</li>
              <li>• 背景色建议保持浅色调，确保文字清晰</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorPanel
