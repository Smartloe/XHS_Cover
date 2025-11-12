import React from 'react'

const TemplatePanel = ({ onTemplateSelect, selectedTemplate }) => {
  const templates = [
    {
      id: 7,
      name: '空白笔记本',
      theme: 'notebook',
      pattern: 'blank',
      backgroundColor: '#FDFDFD',
      defaultText: {
        title: '空白页',
        highlight: '开始记录',
        tag: '笔记本'
      }
    },
    {
      id: 8,
      name: '横线笔记本',
      theme: 'notebook',
      pattern: 'lines',
      backgroundColor: '#FDFDFD',
      defaultText: {
        title: '横线本',
        highlight: '整齐记录',
        tag: '笔记本'
      }
    },
    {
      id: 9,
      name: '网格笔记本',
      theme: 'notebook',
      pattern: 'grid',
      backgroundColor: '#FDFDFD',
      defaultText: {
        title: '网格本',
        highlight: '精准记录',
        tag: '笔记本'
      }
    }
  ]

  return (
    <div className="space-y-4">
      {/* 模板分类标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['全部', '笔记本', '清新', '商务'].map((category) => (
          <button
            key={category}
            className="px-3 py-1 text-xs bg-white/60 border border-gray-200 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
          >
            {category}
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 card-hover ${
              selectedTemplate?.id === template.id
                ? 'border-emerald-400 shadow-xl transform scale-105 bg-white'
                : 'border-gray-200 hover:border-emerald-300 hover:shadow-lg bg-white/80'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            {/* 模板预览区域 */}
            <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {template.theme === 'notebook' ? (
                <div
                  className="w-full h-full flex items-center justify-center relative"
                  style={{
                    backgroundColor: template.backgroundColor,
                    ...(template.pattern === 'lines'
                      ? {
                          backgroundImage:
                            'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 28px)',
                        }
                      : template.pattern === 'grid'
                      ? {
                          backgroundImage:
                            'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 28px)',
                        }
                      : {})
                  }}
                >
                  {/* 笔记本图标 */}
                  <div className="text-4xl opacity-30">📓</div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              
              {/* 选中状态指示器 */}
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>

            {/* 模板信息区域 */}
            <div className="p-4 bg-white">
              <h4 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">
                {template.name}
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                {template.theme === 'notebook' ? '简约笔记本风格' : '精美设计模板'}
              </p>
              
              {/* 模板特点标签 */}
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                  简约
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  清新
                </span>
              </div>
            </div>

            {/* 悬停时的操作按钮 */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button className="bg-white text-gray-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                使用模板
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 更多模板提示 */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          💡 选择合适的模板，让你的封面更有吸引力
        </p>
      </div>
    </div>
  )
}

export default TemplatePanel
